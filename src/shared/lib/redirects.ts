const FALLBACK_PATH = "/admin";

// Only follow same-origin, path-relative redirects.
//
// A prefix check like `startsWith("/") && !startsWith("//")` is NOT enough:
// the URL parser normalizes a leading backslash to a forward slash and strips
// leading control characters before it works out the authority. So "/\evil.com",
// "/\t/evil.com" and "/\n/evil.com" all look path-relative but resolve to
// https://evil.com/. Parsing and comparing origins is the only reliable check.
export function sanitizeRedirect(redirectTo: string | undefined, origin: string): string {
  if (!redirectTo) {
    return FALLBACK_PATH;
  }

  let url: URL;
  try {
    url = new URL(redirectTo, origin);
  } catch {
    return FALLBACK_PATH;
  }

  if (url.origin !== origin) {
    return FALLBACK_PATH;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
