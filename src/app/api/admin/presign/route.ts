import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/shared/lib/adminAuth";
import { presignPutUrl } from "@/shared/lib/r2";

// Accepts a mediaId (a UUID for anything created since media ids existed) and
// also the slug-shaped prefix that older invitations still use.
const MEDIA_ID_PATTERN = /^[a-z0-9_-]+$/i;

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

  const { mediaId, kind, filename, contentType } = body;
  const key = `wedding/${mediaId}/${kind}/${randomUUID()}-${sanitizeFilename(filename)}`;

  const { uploadUrl, publicUrl } = await presignPutUrl({ key, contentType });

  return NextResponse.json({ uploadUrl, publicUrl });
}

function validatePresignRequest(body: PresignRequestBody): string | null {
  const { mediaId, kind, contentType, size } = body;

  if (!MEDIA_ID_PATTERN.test(mediaId)) {
    return "Invalid mediaId";
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
      typeof json.mediaId !== "string" ||
      typeof json.kind !== "string" ||
      typeof json.filename !== "string" ||
      typeof json.contentType !== "string" ||
      typeof json.size !== "number"
    ) {
      return null;
    }
    return {
      mediaId: json.mediaId,
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
  mediaId: string;
  // Left as `string` until validatePresignRequest narrows it to MediaKind;
  // casting here would defeat the point of validating it below.
  kind: string;
  filename: string;
  contentType: string;
  size: number;
}
