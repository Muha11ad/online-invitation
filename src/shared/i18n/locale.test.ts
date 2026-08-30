import { describe, expect, it } from "vitest";
import { LOCALES, LOCALE_LABELS, isLocale } from "./locale";

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

describe("LOCALE_LABELS", () => {
  it("has a non-empty label for every locale", () => {
    for (const locale of LOCALES) {
      expect(LOCALE_LABELS[locale]).toBeTruthy();
    }
  });
});
