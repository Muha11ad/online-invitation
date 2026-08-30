import { describe, expect, it } from "vitest";

import type { LocaleCompletenessInput } from "@/entities/wedding/lib/localization";

import { getLocaleCompleteness } from "./localeCompleteness";

// Fills the first `filledCount` of the six fields getLocalizedFields reads
// (order doesn't matter for a count-based threshold, only how many are
// non-empty), so each boundary can be built from a single number.
function buildDoc(filledCount: number): LocaleCompletenessInput {
  const slots = [0, 1, 2, 3, 4, 5].map((index) => (index < filledCount ? "filled" : ""));

  return {
    message: { en: slots[0], ru: "", uz: "", kiril: "" },
    names: {
      husband: { en: slots[1], ru: "", uz: "", kiril: "" },
      wife: { en: slots[2], ru: "", uz: "", kiril: "" },
    },
    location: {
      city: { en: slots[3], ru: "", uz: "", kiril: "" },
      venue: { en: slots[4], ru: "", uz: "", kiril: "" },
      address: { en: slots[5], ru: "", uz: "", kiril: "" },
    },
  };
}

describe("getLocaleCompleteness", () => {
  it("returns empty when none of the six fields are filled in", () => {
    expect(getLocaleCompleteness(buildDoc(0), "en")).toBe("empty");
  });

  it("returns partial when only one of the six fields is filled in", () => {
    expect(getLocaleCompleteness(buildDoc(1), "en")).toBe("partial");
  });

  it("returns partial when five of the six fields are filled in", () => {
    expect(getLocaleCompleteness(buildDoc(5), "en")).toBe("partial");
  });

  it("returns complete only once all six fields are filled in", () => {
    expect(getLocaleCompleteness(buildDoc(6), "en")).toBe("complete");
  });
});
