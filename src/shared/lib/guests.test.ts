import { describe, expect, it } from "vitest";
import { resolveGuestName } from "./guests";

describe("resolveGuestName", () => {
  const guests = ["Eleanor", "James"];

  it("matches case-insensitively and returns the stored casing", () => {
    expect(resolveGuestName(guests, "james")).toBe("James");
    expect(resolveGuestName(guests, "ELEANOR")).toBe("Eleanor");
  });

  it("trims surrounding whitespace before matching", () => {
    expect(resolveGuestName(guests, "  Eleanor  ")).toBe("Eleanor");
  });

  it("returns undefined for an unmatched name", () => {
    expect(resolveGuestName(guests, "Someone Else")).toBeUndefined();
  });

  it("returns undefined when guests or requested is missing", () => {
    expect(resolveGuestName(undefined, "Eleanor")).toBeUndefined();
    expect(resolveGuestName(guests, undefined)).toBeUndefined();
    expect(resolveGuestName(guests, "   ")).toBeUndefined();
  });
});
