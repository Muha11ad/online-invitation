import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "@/shared/lib/session";

// Re-verifies the admin session cookie inside a route handler. Middleware
// already gates access to /api/admin/**, but each handler re-checks as a
// cheap defense-in-depth measure.
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionCookieValue(cookieValue);
}
