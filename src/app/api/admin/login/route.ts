import { NextResponse } from "next/server";

import { verifyPassword } from "@/shared/lib/password";
import { createSessionCookieValue, SESSION_COOKIE_NAME } from "@/shared/lib/session";

const SESSION_MAX_AGE_SECONDS = 86400;

const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

// Module-level state: acceptable for a single-instance VPS deploy, but this
// will not share limits across multiple server instances/processes.
const failedAttemptsByIp = new Map<string, { count: number; firstAt: number }>();

export async function POST(request: Request): Promise<NextResponse> {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  }

  const body = await parseBody(request);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { username, password } = body;
  if (!isValidCredentials(username, password)) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  failedAttemptsByIp.delete(ip);

  const cookieValue = await createSessionCookieValue();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(ip: string): boolean {
  const entry = failedAttemptsByIp.get(ip);
  if (!entry) {
    return false;
  }

  if (Date.now() - entry.firstAt > RATE_LIMIT_WINDOW_MS) {
    failedAttemptsByIp.delete(ip);
    return false;
  }

  return entry.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const entry = failedAttemptsByIp.get(ip);
  if (!entry || Date.now() - entry.firstAt > RATE_LIMIT_WINDOW_MS) {
    failedAttemptsByIp.set(ip, { count: 1, firstAt: Date.now() });
    return;
  }

  entry.count += 1;
}

function isValidCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminUsername || !adminPasswordHash) {
    throw new Error("ADMIN_USERNAME / ADMIN_PASSWORD_HASH environment variables are not set");
  }

  return username === adminUsername && verifyPassword(password, adminPasswordHash);
}

async function parseBody(request: Request): Promise<{ username: string; password: string } | null> {
  try {
    const json = (await request.json()) as { username?: unknown; password?: unknown };
    if (typeof json.username !== "string" || typeof json.password !== "string") {
      return null;
    }
    return { username: json.username, password: json.password };
  } catch {
    return null;
  }
}
