import { NextResponse } from "next/server";

import {
  deleteWeddingBySlug,
  getWeddingBySlug,
  NULLABLE_WEDDING_FIELDS,
  retireSlug,
  slugExists,
  updateWeddingBySlug,
  validateWeddingInput,
  WEDDING_MUTABLE_FIELDS,
} from "@/entities/wedding";
import type { RawWeddingDoc, SlugRename, WeddingInputValue } from "@/entities/wedding";

import { isAdminAuthenticated } from "@/shared/lib/adminAuth";
import { copyObjectsByPrefix, deleteObjects, listKeysByPrefix } from "@/shared/lib/r2";
import { applyTemplatePrefix } from "@/shared/lib/slug";

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const unauthorized = await checkAdminAuthenticated();
  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;
  const wedding = await getWeddingBySlug(slug);
  if (!wedding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(wedding);
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const unauthorized = await checkAdminAuthenticated();
  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;
  const json = await parseJson(request);
  if (!json) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validation = validateWeddingInput(json, {
    partial: true,
    allowedKeys: WEDDING_MUTABLE_FIELDS,
  });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const existing = await getWeddingBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { setFields, unsetFields } = splitPatchValue(validation.value);

  // The template is part of the slug, so switching it has to regenerate the
  // slug. The new one is derived here rather than taken from the client, and
  // the old one is retired (not dropped) by updateWeddingBySlug.
  const newSlug = resolveRenamedSlug(existing, setFields.template);

  // Media is copied to the new prefix before the write and the originals are
  // deleted only after it lands, so a failure never leaves the document
  // pointing at keys that no longer exist.
  let supersededKeys: string[] = [];

  let rename: SlugRename | undefined;

  if (newSlug) {
    const isSlugTaken = await slugExists(newSlug, existing._id);
    if (isSlugTaken) {
      return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    }

    try {
      supersededKeys = await copyObjectsByPrefix(
        `wedding/${existing.slug}/`,
        `wedding/${newSlug}/`,
      );
    } catch {
      return NextResponse.json({ error: "Failed to move media in storage" }, { status: 502 });
    }

    retargetMediaUrls({ existing, setFields, unsetFields, newSlug });

    rename = {
      newSlug,
      previousSlugs: retireSlug({
        currentSlug: existing.slug,
        previousSlugs: existing.previousSlugs,
        newSlug,
      }),
    };
  }

  // Matched on the stored slug: `slug` from the URL may be a retired one.
  const updated = await updateWeddingBySlug({
    slug: existing.slug,
    patch: setFields,
    unsetFields,
    rename,
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (supersededKeys.length > 0) {
    // Best effort: the rename already succeeded, and leftovers at the old
    // prefix are unreferenced rather than harmful.
    try {
      await deleteObjects(supersededKeys);
    } catch {
      // Ignored on purpose — see above.
    }
  }

  return NextResponse.json({ ok: true, slug: newSlug ?? existing.slug });
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const unauthorized = await checkAdminAuthenticated();
  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;

  // Resolved first because `slug` may be a retired one, while the media lives
  // under the current slug's prefix.
  const existing = await getWeddingBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const keys = await listKeysByPrefix(`wedding/${existing.slug}/`);
    await deleteObjects(keys);
  } catch {
    return NextResponse.json({ error: "Failed to delete media from storage" }, { status: 502 });
  }

  await deleteWeddingBySlug(existing.slug);
  return NextResponse.json({ ok: true });
}

// `template` is optional because a PATCH need not touch it — `setFields.template`
// is `TemplateType | undefined`, and the type has to admit that.
function resolveRenamedSlug(existing: RawWeddingDoc, template: RawWeddingDoc["template"] | undefined ): string | undefined {
  if (!template || template === existing.template) {
    return undefined;
  }

  const candidate = applyTemplatePrefix(existing.slug, template);
  if (candidate === existing.slug) {
    return undefined;
  }

  return candidate;
}

// Stored media values are absolute public URLs built from the old slug's key
// prefix, so they have to follow the objects to their new prefix.
function retargetMediaUrls(params: RetargetMediaUrlsParams): void {
  const { existing, setFields, unsetFields, newSlug } = params;

  const oldPrefix = `/wedding/${existing.slug}/`;
  const newPrefix = `/wedding/${newSlug}/`;

  for (const field of MEDIA_URL_FIELDS) {
    if (unsetFields.includes(field)) {
      continue;
    }

    const value = setFields[field] ?? existing[field];
    if (typeof value === "string" && value.includes(oldPrefix)) {
      setFields[field] = value.replace(oldPrefix, newPrefix);
    }
  }
}

// Returns the 401 to send back, or `undefined` when the caller may proceed.
// Named for what it returns rather than what it checks: a predicate-sounding
// name invites `await checkAdminAuthenticated()` on its own line, which drops
// the response and lets the request through unauthenticated.
async function checkAdminAuthenticated(): Promise<NextResponse | undefined> {
  const isAuthenticated = await isAdminAuthenticated();
  if (isAuthenticated) {
    return undefined;
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function splitPatchValue(value: WeddingInputValue): {
  setFields: Partial<Omit<RawWeddingDoc, "_id" | "slug">>;
  unsetFields: Array<(typeof NULLABLE_WEDDING_FIELDS)[number]>;
} {
  const setFields: Partial<Omit<RawWeddingDoc, "_id" | "slug">> = {};
  const unsetFields: Array<(typeof NULLABLE_WEDDING_FIELDS)[number]> = [];

  for (const [key, fieldValue] of Object.entries(value)) {
    if (fieldValue === null) {
      unsetFields.push(key as (typeof NULLABLE_WEDDING_FIELDS)[number]);
    } else if (fieldValue !== undefined) {
      (setFields as Record<string, unknown>)[key] = fieldValue;
    }
  }

  return { setFields, unsetFields };
}

async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

interface RetargetMediaUrlsParams {
	existing: RawWeddingDoc;
	setFields: Partial<Omit<RawWeddingDoc, "_id" | "slug" | "previousSlugs">>;
	unsetFields: ReadonlyArray<(typeof NULLABLE_WEDDING_FIELDS)[number]>;
	newSlug: string;
}

interface RouteParams {
  params: Promise<{ slug: string }>;
}

type MediaUrlField = "music" | "coupleMainImage";

const MEDIA_URL_FIELDS: ReadonlyArray<MediaUrlField> = ["music", "coupleMainImage"];
