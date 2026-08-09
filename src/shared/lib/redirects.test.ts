import { describe, expect, it } from "vitest";

import { sanitizeRedirect } from "./redirects";

const ORIGIN = "https://invites.example.com";

describe("sanitizeRedirect", () => {
  it("keeps a same-origin path", () => {
    expect(sanitizeRedirect("/admin/create", ORIGIN)).toBe("/admin/create");
  });

  it("preserves the query string and hash", () => {
    expect(sanitizeRedirect("/admin?page=2#list", ORIGIN)).toBe("/admin?page=2#list");
  });

  it("falls back when there is no redirect", () => {
    expect(sanitizeRedirect(undefined, ORIGIN)).toBe("/admin");
    expect(sanitizeRedirect("", ORIGIN)).toBe("/admin");
  });

  it("rejects absolute off-origin URLs", () => {
    expect(sanitizeRedirect("https://evil.com/steal", ORIGIN)).toBe("/admin");
  });

  it("rejects protocol-relative URLs", () => {
    expect(sanitizeRedirect("//evil.com", ORIGIN)).toBe("/admin");
  });

  // These are the cases a startsWith("/") && !startsWith("//") guard lets through:
  // the URL parser rewrites backslashes and drops leading control characters.
  it.each([
    ["backslash", "/\\evil.com"],
    ["double backslash", "/\\\\evil.com"],
    ["tab", "/\t/evil.com"],
    ["newline", "/\n/evil.com"],
    ["carriage return", "/\r/evil.com"],
  ])("rejects the %s escape to another origin", (_name, redirectTo) => {
    expect(sanitizeRedirect(redirectTo, ORIGIN)).toBe("/admin");
  });

  it("keeps an absolute same-origin URL but strips it down to a path", () => {
    expect(sanitizeRedirect(`${ORIGIN}/admin/create`, ORIGIN)).toBe("/admin/create");
  });

  it("does not treat an encoded slash sequence as an authority", () => {
    expect(sanitizeRedirect("/%2F%2Fevil.com", ORIGIN)).toBe("/%2F%2Fevil.com");
  });
});
