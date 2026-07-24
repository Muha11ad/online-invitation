import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/shared/lib/session";

export function POST(): NextResponse {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
