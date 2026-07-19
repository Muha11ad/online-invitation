import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, isLocale, resolveLocale } from "./locale";

describe("isLocale", () => {
  it("returns true for known locale codes", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ru")).toBe(true);
    expect(isLocale("uz")).toBe(true);
    expect(isLocale("kiril")).toBe(true);
  });

  it("returns false for unknown codes", () => {
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale("EN")).toBe(false);
  });
});

describe("resolveLocale", () => {
  it("returns the matching locale for a valid lowercase code", () => {
    expect(resolveLocale("en")).toBe("en");
    expect(resolveLocale("ru")).toBe("ru");
    expect(resolveLocale("uz")).toBe("uz");
    expect(resolveLocale("kiril")).toBe("kiril");
  });

  it("is case-insensitive", () => {
    expect(resolveLocale("EN")).toBe("en");
    expect(resolveLocale("Ru")).toBe("ru");
    expect(resolveLocale("KIRIL")).toBe("kiril");
  });

  it("falls back to the default locale for unknown codes", () => {
    expect(resolveLocale("fr")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("xx")).toBe(DEFAULT_LOCALE);
  });

  it("falls back to the default locale when undefined or empty", () => {
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("")).toBe(DEFAULT_LOCALE);
  });
});
