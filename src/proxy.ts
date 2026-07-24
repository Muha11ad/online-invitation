import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "@/shared/lib/session";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isValid = await verifySessionCookieValue(cookieValue);
  if (isValid) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.redirect(buildLoginRedirectUrl(request, cookieValue !== undefined));
}

function buildLoginRedirectUrl(request: NextRequest, hadCookie: boolean): URL {
  const url = request.nextUrl.clone();
  const originalPath = `${url.pathname}${url.search}`;

  url.pathname = "/admin/login";
  url.search = "";
  url.searchParams.set("redirect", originalPath);
  if (hadCookie) {
    url.searchParams.set("expired", "1");
  }

  return url;
}
