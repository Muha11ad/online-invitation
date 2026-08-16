import { describe, expect, it } from "vitest";

import { SLUG_PATTERN } from "./slug";

describe("SLUG_PATTERN", () => {
  it("accepts a real crypto.randomUUID() output", () => {
    expect(SLUG_PATTERN.test(crypto.randomUUID())).toBe(true);
  });

  it("rejects an old readable slug", () => {
    expect(SLUG_PATTERN.test("third_ali-and-madina_12-09-2026")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(SLUG_PATTERN.test("")).toBe(false);
  });

  it("rejects a non-v4 UUID (wrong version and variant nibbles)", () => {
    // v1 UUID: version nibble is "1", not "4", and the variant nibble is "a"
    // rather than one of 8/9/a/b.
    expect(SLUG_PATTERN.test("3fa85f64-5717-1562-a3fc-2c963f66afa6")).toBe(false);
  });

  it("rejects a path-traversal-shaped string", () => {
    expect(SLUG_PATTERN.test("../../etc/passwd")).toBe(false);
  });

  it("rejects an uppercase UUID", () => {
    // crypto.randomUUID() never emits uppercase, and the duplicate check and
    // R2 key built from the slug are both case-sensitive — an uppercase
    // variant of an existing slug must not validate as a distinct one.
    expect(SLUG_PATTERN.test(crypto.randomUUID().toUpperCase())).toBe(false);
  });
});
