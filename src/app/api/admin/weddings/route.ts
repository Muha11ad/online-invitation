import { NextResponse } from "next/server";

import { createWedding, listWeddings, slugExists, validateWeddingInput, WEDDING_MUTABLE_FIELDS } from "@/entities/wedding";
import type { RawWeddingDoc, WeddingInputValue } from "@/entities/wedding";

import { isAdminAuthenticated } from "@/shared/lib/adminAuth";
import { SLUG_PATTERN } from "@/shared/lib/slug";

const POST_ALLOWED_KEYS = [...WEDDING_MUTABLE_FIELDS, "slug", "mediaId"] as const;

// Minted by the browser before the document exists, since media can be
// uploaded while the form is still being filled in.
const MEDIA_ID_PATTERN = /^[a-z0-9_-]+$/i;

export async function GET(): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weddings = await listWeddings();
  return NextResponse.json(weddings);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await parseJson(request);
  if (json === undefined) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const record = json as Record<string, unknown>;
  if (typeof record.slug !== "string" || !SLUG_PATTERN.test(record.slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  if (typeof record.mediaId !== "string" || !MEDIA_ID_PATTERN.test(record.mediaId)) {
    return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });
  }

  const validation = validateWeddingInput(json, {
    partial: false,
    allowedKeys: POST_ALLOWED_KEYS,
  });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (await slugExists(record.slug)) {
    return NextResponse.json({ error: "slug_taken" }, { status: 409 });
  }

  await createWedding(buildCreateDoc({ slug: record.slug, mediaId: record.mediaId, value: validation.value }));
  return NextResponse.json({ ok: true }, { status: 201 });
}

function buildCreateDoc(params: BuildCreateDocParams): Omit<RawWeddingDoc, "_id"> {
  const { slug, mediaId, value } = params;

  const doc: Omit<RawWeddingDoc, "_id"> = {
    slug,
    mediaId,
    template: value.template!,
    names: value.names!,
    date: value.date!,
    location: value.location!,
    message: value.message!,
  };

  // Non-partial validation rejects `null` for these, so they can only be
  // `string | undefined` at this point.
  if (value.music !== undefined) {
    doc.music = value.music as string;
  }
  if (value.coupleMainImage !== undefined) {
    doc.coupleMainImage = value.coupleMainImage as string;
  }

  return doc;
}

interface BuildCreateDocParams {
  slug: string;
  mediaId: string;
  value: WeddingInputValue;
}

async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
