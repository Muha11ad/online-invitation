import { describe, expect, it } from "vitest";

import { TemplateType } from "@/shared/types/templates";

import type { WeddingFormValue } from "./formState";
import {
  getMediaSlug,
  getRenamedSlug,
  getSlug,
  getSlugPatternError,
  isSlugValid,
  willSlugChange,
} from "./formSlug";

function buildStored(overrides: Partial<WeddingFormValue> = {}): WeddingFormValue {
  return {
    slug: "third_a-and-b_07-07-2027",
    template: TemplateType.THIRD,
    names: {
      husband: { en: "A", ru: "", uz: "", kiril: "" },
      wife: { en: "B", ru: "", uz: "", kiril: "" },
    },
    date: { ddmmyyyy: "07-07-2027", time: "3:30 pm" },
    ...overrides,
  } as WeddingFormValue;
}

const CREATE_BASE = {
  mode: "create" as const,
  storedValue: undefined,
  template: TemplateType.THIRD,
  slugTouched: false,
  manualSlug: "",
  husbandEn: "A",
  wifeEn: "B",
  ddmmyyyy: "07-07-2027",
};

describe("getSlug — create mode", () => {
  it("generates from the template, couple and date", () => {
    expect(getSlug(CREATE_BASE)).toBe("third_a-and-b_07-07-2027");
  });

  it("follows the template picker until the admin types a slug", () => {
    expect(getSlug({ ...CREATE_BASE, template: TemplateType.FIRST })).toBe(
      "first_a-and-b_07-07-2027",
    );
  });

  it("keeps a hand-typed slug once touched", () => {
    expect(getSlug({ ...CREATE_BASE, slugTouched: true, manualSlug: "our-big-day" })).toBe(
      "our-big-day",
    );
  });
});

describe("getSlug — edit mode", () => {
  const editBase = { ...CREATE_BASE, mode: "edit" as const, storedValue: buildStored() };

  it("shows the stored slug verbatim while nothing identifying changed", () => {
    expect(getSlug(editBase)).toBe("third_a-and-b_07-07-2027");
  });

  it("previews the regenerated slug when the template changes", () => {
    expect(getSlug({ ...editBase, template: TemplateType.FIRST })).toBe("first_a-and-b_07-07-2027");
  });

  it("previews the regenerated slug when the date changes", () => {
    expect(getSlug({ ...editBase, ddmmyyyy: "08-08-2028" })).toBe("third_a-and-b_08-08-2028");
  });

  it("previews the regenerated slug when a name changes", () => {
    expect(getSlug({ ...editBase, wifeEn: "Carla" })).toBe("third_a-and-carla_07-07-2027");
  });

  it("ignores a touched manual slug — edit mode never types the slug", () => {
    expect(getSlug({ ...editBase, slugTouched: true, manualSlug: "x" })).toBe(
      "third_a-and-b_07-07-2027",
    );
  });
});

describe("getRenamedSlug", () => {
  it("leaves a hand-written slug alone however the invitation is edited", () => {
    const storedValue = buildStored({ slug: "our-big-day" });

    expect(
      getRenamedSlug({
        storedValue,
        template: TemplateType.FIRST,
        husbandEn: "A",
        wifeEn: "B",
        ddmmyyyy: "08-08-2028",
      }),
    ).toBe("our-big-day");
  });

  it("regenerates a slug created before the template prefix existed", () => {
    const storedValue = buildStored({ slug: "a-b-07-07-2027", template: TemplateType.FIRST });

    expect(
      getRenamedSlug({
        storedValue,
        template: TemplateType.FIRST,
        husbandEn: "A",
        wifeEn: "B",
        ddmmyyyy: "08-08-2028",
      }),
    ).toBe("first_a-and-b_08-08-2028");
  });

  it("keeps the stored slug when the couple and date are cleared", () => {
    const storedValue = buildStored();

    expect(
      getRenamedSlug({
        storedValue,
        template: TemplateType.THIRD,
        husbandEn: "",
        wifeEn: "",
        ddmmyyyy: "",
      }),
    ).toBe("third_a-and-b_07-07-2027");
  });
});

describe("willSlugChange", () => {
  it("is false in create mode", () => {
    expect(willSlugChange(undefined, "first_a")).toBe(false);
  });

  it("is false when the derived slug matches the stored one", () => {
    expect(willSlugChange(buildStored(), "third_a-and-b_07-07-2027")).toBe(false);
  });

  it("is true once the derived slug differs", () => {
    expect(willSlugChange(buildStored(), "first_a-and-b_07-07-2027")).toBe(true);
  });
});

describe("getMediaSlug", () => {
  it("uses the live slug while creating", () => {
    expect(getMediaSlug(undefined, "third_a")).toBe("third_a");
  });

  it("stays on the stored slug while editing, even mid-rename", () => {
    expect(getMediaSlug(buildStored(), "first_a-and-b_07-07-2027")).toBe(
      "third_a-and-b_07-07-2027",
    );
  });
});

describe("slug validation", () => {
  it("reports nothing for an empty create-mode slug", () => {
    expect(getSlugPatternError("create", "")).toBeNull();
    expect(isSlugValid("create", "")).toBe(false);
  });

  it("rejects characters outside the pattern", () => {
    expect(getSlugPatternError("create", "Ali & Madina")).not.toBeNull();
    expect(isSlugValid("create", "Ali & Madina")).toBe(false);
  });

  it("accepts the generated format", () => {
    expect(getSlugPatternError("create", "third_a-and-b_07-07-2027")).toBeNull();
    expect(isSlugValid("create", "third_a-and-b_07-07-2027")).toBe(true);
  });

  it("never blocks edit mode, where the slug is derived", () => {
    expect(getSlugPatternError("edit", "Ali & Madina")).toBeNull();
    expect(isSlugValid("edit", "")).toBe(true);
  });
});
