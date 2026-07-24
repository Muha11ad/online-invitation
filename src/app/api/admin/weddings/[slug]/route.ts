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
import { deleteObjects, listKeysByPrefix } from "@/shared/lib/r2";

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const wedding = await getWeddingBySlug(slug);
  if (!wedding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(wedding);
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const json = await parseJson(request);
  if (json === undefined) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validation = validateWeddingInput(json, {
    partial: true,
    allowedKeys: WEDDING_MUTABLE_FIELDS,
  });
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { setFields, unsetFields } = splitPatchValue(validation.value);
  await updateWeddingBySlug(slug, setFields, unsetFields);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const keys = await listKeysByPrefix(`wedding/${slug}/`);
    await deleteObjects(keys);
  } catch {
    return NextResponse.json({ error: "Failed to delete media from storage" }, { status: 502 });
  }

  await deleteWeddingBySlug(slug);
  return NextResponse.json({ ok: true });
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
