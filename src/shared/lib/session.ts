// Signed, stateless admin session cookie.
//
// Format: base64url(JSON{exp}) + "." + base64url(HMAC-SHA256(payload, SESSION_SECRET))
//
// Implemented with the Web Crypto API (crypto.subtle) rather than node:crypto
// so the same code works in both the Node.js runtime (route handlers) and the
// Edge runtime (middleware.ts, which cannot run node:crypto).

// These are stateless, signed sessions with no server-side store: logout
// (see /api/admin/logout) only clears this cookie and cannot revoke a
// cookie value that has already been handed out — it stays valid until exp.
export const SESSION_COOKIE_NAME = "admin_session";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export async function createSessionCookieValue(): Promise<string> {
  const payload = base64UrlEncode(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS }));
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function verifySessionCookieValue(value: string | undefined): Promise<boolean> {
  if (!value) {
    return false;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = await sign(payload);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return false;
  }

  const exp = parseExpiry(payload);
  if (exp === undefined) {
    return false;
  }

  return Date.now() < exp;
}

async function sign(payload: string): Promise<string> {
  const key = await getSigningKey();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64UrlEncodeBytes(new Uint8Array(signatureBuffer));
}

async function getSigningKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }

  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function parseExpiry(payload: string): number | undefined {
  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as { exp?: unknown };
    return typeof decoded.exp === "number" ? decoded.exp : undefined;
  } catch {
    return undefined;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function base64UrlEncode(input: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(input));
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): string {
  const padded = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(input.length / 4) * 4, "=");
  return atob(padded);
}
