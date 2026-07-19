import { describe, expect, it } from "vitest";

import type { RawWeddingDoc } from "../model";
import { hasCompleteLocale, pick } from "./localization";

function buildDoc(overrides: Partial<RawWeddingDoc> = {}): RawWeddingDoc {
  return {
    _id: "000000000000000000000000" as unknown as RawWeddingDoc["_id"],
    names: {
      husband: { en: "Alex", ru: "Алекс", uz: "Aleks", kiril: "Алекс" },
      wife: { en: "Diana", ru: "Диана", uz: "Diana", kiril: "Диана" },
    },
    date: { time: "3:30 pm", ddmmyyyy: "07-07-2027" },
    location: {
      city: { en: "City", ru: "Город", uz: "Shahar", kiril: "Шаҳар" },
      venue: { en: "Venue", ru: "Место", uz: "Manzil", kiril: "Манзил" },
      address: { en: "Address", ru: "Адрес", uz: "Manzil", kiril: "Манзил" },
      coords: { lat: 0, lon: 0 },
    },
    message: { en: "Hello", ru: "Привет", uz: "Salom", kiril: "Салом" },
    slug: "test-slug",
    template: "first",
    ...overrides,
  };
}

describe("hasCompleteLocale", () => {
  it("returns true when every required field is present for the locale", () => {
    const doc = buildDoc();
    expect(hasCompleteLocale(doc, "en")).toBe(true);
    expect(hasCompleteLocale(doc, "ru")).toBe(true);
  });

  it("returns false when a required field is missing for the locale", () => {
    const doc = buildDoc({
      message: { en: "Hello", ru: "", uz: "Salom", kiril: "Салом" },
    });
    expect(hasCompleteLocale(doc, "ru")).toBe(false);
    expect(hasCompleteLocale(doc, "en")).toBe(true);
  });

  it("returns false when a required field is only whitespace", () => {
    const doc = buildDoc({
      location: {
        ...buildDoc().location,
        venue: { en: "Venue", ru: "  ", uz: "Manzil", kiril: "Манзил" },
      },
    });
    expect(hasCompleteLocale(doc, "ru")).toBe(false);
  });

  it("returns false instead of throwing for legacy flat-string docs", () => {
    const legacyDoc = {
      ...buildDoc(),
      names: { a: "Alex", b: "Diana" },
      location: { city: "City", venue: "Venue", address: "Address", coords: { lat: 0, lon: 0 } },
      message: "Hello",
    } as unknown as RawWeddingDoc;

    expect(() => hasCompleteLocale(legacyDoc, "en")).not.toThrow();
    expect(hasCompleteLocale(legacyDoc, "en")).toBe(false);
  });

  it("returns false instead of throwing for docs with missing nested shapes", () => {
    const malformedDoc = {
      ...buildDoc(),
      names: undefined,
      location: undefined,
      message: undefined,
    } as unknown as RawWeddingDoc;

    expect(() => hasCompleteLocale(malformedDoc, "en")).not.toThrow();
    expect(hasCompleteLocale(malformedDoc, "en")).toBe(false);
  });
});

describe("pick", () => {
  it("returns the string for the requested locale", () => {
    const value = { en: "Hello", ru: "Привет", uz: "Salom", kiril: "Салом" };
    expect(pick(value, "en")).toBe("Hello");
    expect(pick(value, "ru")).toBe("Привет");
    expect(pick(value, "uz")).toBe("Salom");
    expect(pick(value, "kiril")).toBe("Салом");
  });
});
