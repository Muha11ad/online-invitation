import { AwsClient } from "aws4fetch";

import { R2_PUBLIC_BASE } from "@/shared/lib/mediaLinks";

const DELETE_OBJECTS_CHUNK_SIZE = 1000;

let cachedClient: AwsClient | undefined;

// Content-Length is not part of the presigned URL's signature (only method,
// path, query, and the headers we explicitly sign are), so R2 will accept an
// upload of any size through this URL. The size check in the presign route
// is therefore advisory only — it stops well-behaved clients, not a
// determined attacker; enforce hard limits at the CDN/bucket level if needed.
export async function presignPutUrl(params: PresignPutUrlParams): Promise<PresignPutUrlResult> {
  const { key, contentType, expiresSeconds = 300 } = params;

  const url = new URL(`${getBucketEndpoint()}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(expiresSeconds));

  const signedRequest = await getClient().sign(url, {
    method: "PUT",
    headers: { "content-type": contentType },
    aws: { signQuery: true },
  });

  return {
    uploadUrl: signedRequest.url,
    publicUrl: `${R2_PUBLIC_BASE}/${key}`,
  };
}

export async function listKeysByPrefix(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const page = await listObjectsPage(prefix, continuationToken);
    keys.push(...page.keys);
    continuationToken = page.nextContinuationToken;
  } while (continuationToken);

  return keys;
}

export async function deleteObjects(keys: string[]): Promise<void> {
  for (let i = 0; i < keys.length; i += DELETE_OBJECTS_CHUNK_SIZE) {
    const chunk = keys.slice(i, i + DELETE_OBJECTS_CHUNK_SIZE);
    await deleteObjectsChunk(chunk);
  }
}

async function listObjectsPage(
  prefix: string,
  continuationToken: string | undefined,
): Promise<{ keys: string[]; nextContinuationToken: string | undefined }> {
  const url = new URL(getBucketEndpoint());
  url.searchParams.set("list-type", "2");
  url.searchParams.set("prefix", prefix);
  if (continuationToken) {
    url.searchParams.set("continuation-token", continuationToken);
  }

  const response = await getClient().fetch(url);
  if (!response.ok) {
    throw new Error(`R2 ListObjectsV2 failed: ${response.status} ${await response.text()}`);
  }

  const xml = await response.text();
  return {
    keys: extractAllTagValues(xml, "Key"),
    nextContinuationToken: extractAllTagValues(xml, "NextContinuationToken")[0],
  };
}

async function deleteObjectsChunk(keys: string[]): Promise<void> {
  if (keys.length === 0) {
    return;
  }

  const body = buildDeleteObjectsXml(keys);
  const url = new URL(getBucketEndpoint());
  url.searchParams.set("delete", "");

  const response = await getClient().fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/xml",
      "content-md5": await md5Base64(body),
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`R2 DeleteObjects failed: ${response.status} ${await response.text()}`);
  }
}

function buildDeleteObjectsXml(keys: string[]): string {
  const objects = keys.map((key) => `<Object><Key>${escapeXml(key)}</Key></Object>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><Delete>${objects}</Delete>`;
}

function extractAllTagValues(xml: string, tag: string): string[] {
  const pattern = new RegExp(`<${tag}>([^<]*)</${tag}>`, "g");
  return [...xml.matchAll(pattern)].map((match) => match[1]);
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function md5Base64(input: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("md5").update(input).digest("base64");
}

function getClient(): AwsClient {
  if (!cachedClient) {
    cachedClient = new AwsClient({
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
      region: "auto",
      service: "s3",
    });
  }
  return cachedClient;
}

function getBucketEndpoint(): string {
  return `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${requireEnv("R2_BUCKET_NAME")}`;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is not set`);
  }
  return value;
}

interface PresignPutUrlParams {
  key: string;
  contentType: string;
  expiresSeconds?: number;
}

interface PresignPutUrlResult {
  uploadUrl: string;
  publicUrl: string;
}
