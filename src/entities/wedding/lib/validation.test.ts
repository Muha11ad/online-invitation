import { describe, expect, it } from "vitest";

import { TemplateType } from "../../../shared/types/templates";

import { validateWeddingInput, WEDDING_MUTABLE_FIELDS } from "./validation";

// Only the new "at least one complete locale" rule in the non-partial path is
// covered here. validateWeddingInput's pre-existing per-field behaviour is
// unrelated to this change and is intentionally left uncovered.
function buildValidJson(overrides: {
  husband?: string;
  wife?: string;
  city?: string;
  venue?: string;
  address?: string;
  message?: string;
}): Record<string, unknown> {
  const localized = (value: string | undefined) => (value === undefined ? {} : { en: value });

  return {
    template: TemplateType.FIRST,
    names: {
      husband: localized(overrides.husband),
      wife: localized(overrides.wife),
    },
    date: { ddmmyyyy: "07-07-2027", time: "3:30 pm" },
    location: {
      city: localized(overrides.city),
      venue: localized(overrides.venue),
      address: localized(overrides.address),
      coords: { lat: 0, lon: 0 },
    },
    message: localized(overrides.message),
  };
}

describe("validateWeddingInput — at least one complete locale (non-partial)", () => {
  it("accepts when at least one locale has every localized field filled in", () => {
    const json = buildValidJson({
      husband: "Alex",
      wife: "Diana",
      city: "City",
      venue: "Venue",
      address: "Address",
      message: "Hello",
    });

    const result = validateWeddingInput(json, {
      partial: false,
      allowedKeys: WEDDING_MUTABLE_FIELDS,
    });

    expect(result.ok).toBe(true);
  });

  it("rejects when the localized fields are empty across every locale", () => {
    const json = buildValidJson({});

    const result = validateWeddingInput(json, {
      partial: false,
      allowedKeys: WEDDING_MUTABLE_FIELDS,
    });

    expect(result).toEqual({ ok: false, error: "At least one locale must be fully filled in" });
  });

  it("rejects when the only filled locale has whitespace-only fields", () => {
    const json = buildValidJson({
      husband: "  ",
      wife: "  ",
      city: "  ",
      venue: "  ",
      address: "  ",
      message: "  ",
    });

    const result = validateWeddingInput(json, {
      partial: false,
      allowedKeys: WEDDING_MUTABLE_FIELDS,
    });

    expect(result).toEqual({ ok: false, error: "At least one locale must be fully filled in" });
  });

  it("rejects when a locale is only partially filled in", () => {
    const json = buildValidJson({
      husband: "Alex",
      wife: "Diana",
      city: "City",
      venue: "Venue",
      // address and message left empty for every locale.
    });

    const result = validateWeddingInput(json, {
      partial: false,
      allowedKeys: WEDDING_MUTABLE_FIELDS,
    });

    expect(result).toEqual({ ok: false, error: "At least one locale must be fully filled in" });
  });
});
