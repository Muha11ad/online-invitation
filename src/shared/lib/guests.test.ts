import { describe, expect, it } from "vitest";
import { parseGuestName } from "./guests";

describe("parseGuestName", () => {
  it("returns the name as written in the link", () => {
    expect(parseGuestName("Eleanor")).toBe("Eleanor");
  });

  it("keeps the casing it was given, since nothing is matched against a list", () => {
    expect(parseGuestName("eLeAnOr")).toBe("eLeAnOr");
  });

  it("trims surrounding whitespace", () => {
    expect(parseGuestName("  Eleanor  ")).toBe("Eleanor");
  });

  it("returns undefined when the parameter is absent or blank", () => {
    expect(parseGuestName(undefined)).toBeUndefined();
    expect(parseGuestName("")).toBeUndefined();
    expect(parseGuestName("   ")).toBeUndefined();
  });

  it("ignores a name long enough to break the layout", () => {
    expect(parseGuestName("a".repeat(60))).toBe("a".repeat(60));
    expect(parseGuestName("a".repeat(61))).toBeUndefined();
  });

  it("does not choke on a bare percent sign", () => {
    expect(parseGuestName("100%")).toBe("100%");
  });
});
