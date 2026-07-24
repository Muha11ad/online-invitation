import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/shared/lib/adminAuth";
import { presignPutUrl } from "@/shared/lib/r2";

const SLUG_PATTERN = /^[a-z0-9-_]+$/;

const MEDIA_KINDS = ["images", "audios", "videos"] as const;
type MediaKind = (typeof MEDIA_KINDS)[number];

const CONTENT_TYPE_PREFIXES: Record<MediaKind, string> = {
  images: "image/",
  audios: "audio/",
  videos: "video/",
};

const MAX_SIZE_BYTES: Record<MediaKind, number> = {
  images: 8 * 1024 * 1024,
  audios: 15 * 1024 * 1024,
  videos: 100 * 1024 * 1024,
};

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await parseBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validationError = validatePresignRequest(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { slug, kind, filename, contentType } = body;
  const key = `wedding/${slug}/${kind}/${randomUUID()}-${sanitizeFilename(filename)}`;

  const { uploadUrl, publicUrl } = await presignPutUrl({ key, contentType });

  return NextResponse.json({ uploadUrl, publicUrl });
}

function validatePresignRequest(body: PresignRequestBody): string | null {
  const { slug, kind, contentType, size } = body;

  if (!SLUG_PATTERN.test(slug)) {
    return "Invalid slug";
  }

  if (!isMediaKind(kind)) {
    return "Invalid kind";
  }

  if (!contentType.startsWith(CONTENT_TYPE_PREFIXES[kind])) {
    return "Content type does not match kind";
  }

  if (size <= 0 || size > MAX_SIZE_BYTES[kind]) {
    return "File exceeds the maximum allowed size";
  }

  return null;
}

function isMediaKind(value: string): value is MediaKind {
  return (MEDIA_KINDS as readonly string[]).includes(value);
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function parseBody(request: Request): Promise<PresignRequestBody | null> {
  try {
    const json = (await request.json()) as Partial<PresignRequestBody>;
    if (
      typeof json.slug !== "string" ||
      typeof json.kind !== "string" ||
      typeof json.filename !== "string" ||
      typeof json.contentType !== "string" ||
      typeof json.size !== "number"
    ) {
      return null;
    }
    return {
      slug: json.slug,
      kind: json.kind,
      filename: json.filename,
      contentType: json.contentType,
      size: json.size,
    };
  } catch {
    return null;
  }
}

interface PresignRequestBody {
  slug: string;
  // Left as `string` until validatePresignRequest narrows it to MediaKind;
  // casting here would defeat the point of validating it below.
  kind: string;
  filename: string;
  contentType: string;
  size: number;
}
