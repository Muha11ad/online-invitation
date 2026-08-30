import { NextResponse } from "next/server";

import {
  deleteWeddingBySlug,
  getAvailableLocales,
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
import { getMediaPrefix } from "@/shared/lib/mediaPrefix";
import { deleteObjects, listKeysByPrefix } from "@/shared/lib/r2";
import { buildAutoSlug, isGeneratedSlug } from "@/shared/lib/slug";

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

  // validateWeddingInput can't judge this: a PATCH may touch only one of
  // message/names/location and inherit the rest from the stored document, so
  // the validator would see an incomplete-looking payload that is actually
  // fine once merged. This is a deliberate deviation from enforcing the rule
  // in the validator — the same reason slugExists is checked here rather than
  // there — not an oversight.
  const mergedForCompleteness = {
    message: setFields.message ?? existing.message,
    names: setFields.names ?? existing.names,
    location: setFields.location ?? existing.location,
  };
  if (getAvailableLocales(mergedForCompleteness).length === 0) {
    return NextResponse.json({ error: "At least one locale must be fully filled in" }, { status: 400 });
  }

  // The slug describes the template, couple and date, so editing any of them
  // regenerates it. The new one is derived here rather than taken from the
  // client, and the old one is retired (not dropped) by updateWeddingBySlug.
  const newSlug = resolveRenamedSlug(existing, setFields);

  let rename: SlugRename | undefined;

  if (newSlug) {
    const isSlugTaken = await slugExists(newSlug, existing._id);
    if (isSlugTaken) {
      return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    }

    // Media is keyed on `mediaId`, not the slug, so a rename moves nothing in
    // storage. Documents predating media ids have theirs filed under the old
    // slug: pinning mediaId to it here freezes the prefix where the objects
    // already are, so the rename still costs no copying.
    if (!existing.mediaId) {
      setFields.mediaId = existing.slug;
    }

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

  return NextResponse.json({ ok: true, slug: newSlug ?? existing.slug });
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
  const unauthorized = await checkAdminAuthenticated();
  if (unauthorized) {
    return unauthorized;
  }

  const { slug } = await params;

  // Resolved first because `slug` may be a retired one, and because the media
  // prefix comes from the document rather than the URL.
  const existing = await getWeddingBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const keys = await listKeysByPrefix(getMediaPrefix(existing));
    await deleteObjects(keys);
  } catch {
    return NextResponse.json({ error: "Failed to delete media from storage" }, { status: 502 });
  }

  await deleteWeddingBySlug(existing.slug);
  return NextResponse.json({ ok: true });
}

// A generated slug describes the invitation, so it follows any edit to the
// template, the couple or the date. Every field is optional because a PATCH
// need not touch it, so each falls back to what is already stored.
function resolveRenamedSlug(existing: RawWeddingDoc, setFields: PatchFields): string | undefined {
  const template = setFields.template ?? existing.template;
  const names = setFields.names ?? existing.names;
  const date = setFields.date ?? existing.date;

  const wasGenerated = isGeneratedSlug({
    slug: existing.slug,
    template: existing.template,
    husbandEn: existing.names.husband.en,
    wifeEn: existing.names.wife.en,
    ddmmyyyy: existing.date.ddmmyyyy,
  });
  if (!wasGenerated) {
    return undefined;
  }

  const candidate = buildAutoSlug({
    template,
    husbandEn: names.husband.en,
    wifeEn: names.wife.en,
    ddmmyyyy: date.ddmmyyyy,
  });

  // An empty candidate means the couple and date were cleared; keeping the
  // stored slug beats renaming the invitation to nothing.
  if (candidate.length === 0 || candidate === existing.slug) {
    return undefined;
  }

  return candidate;
}

type PatchFields = Partial<Omit<RawWeddingDoc, "_id" | "slug" | "previousSlugs">>;

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

interface RouteParams {
  params: Promise<{ slug: string }>;
}
