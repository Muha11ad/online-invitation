import { NextResponse } from "next/server";

import {
  deleteWeddingBySlug,
  getWeddingBySlug,
  NULLABLE_WEDDING_FIELDS,
  updateWeddingBySlug,
  validateWeddingInput,
  WEDDING_MUTABLE_FIELDS,
} from "@/entities/wedding";
import type { RawWeddingDoc, WeddingInputValue } from "@/entities/wedding";

import { isAdminAuthenticated } from "@/shared/lib/adminAuth";
import { getMediaPrefix } from "@/shared/lib/mediaPrefix";
import { deleteObjects, listKeysByPrefix } from "@/shared/lib/r2";

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

  // Matched on the stored slug: `slug` from the URL may be a retired one.
  const updated = await updateWeddingBySlug({
    slug: existing.slug,
    patch: setFields,
    unsetFields,
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
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
    const keys = await listKeysByPrefix(getMediaPrefix(existing.slug));
    await deleteObjects(keys);
  } catch {
    return NextResponse.json({ error: "Failed to delete media from storage" }, { status: 502 });
  }

  await deleteWeddingBySlug(existing.slug);
  return NextResponse.json({ ok: true });
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

interface RouteParams {
  params: Promise<{ slug: string }>;
}
