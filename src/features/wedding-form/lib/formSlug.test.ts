import { describe, expect, it } from "vitest";

import { TemplateType } from "@/shared/types/templates";

import { getRenamedSlug, getSlug, isSlugValid, willSlugChange } from "./formSlug";
import type { WeddingFormValue } from "./formState";

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
  husbandEn: "A",
  wifeEn: "B",
  ddmmyyyy: "07-07-2027",
};

describe("getSlug — create mode", () => {
  it("generates from the template, couple and date", () => {
    expect(getSlug(CREATE_BASE)).toBe("third_a-and-b_07-07-2027");
  });

  it("follows the template picker", () => {
    expect(getSlug({ ...CREATE_BASE, template: TemplateType.FIRST })).toBe(
      "first_a-and-b_07-07-2027",
    );
  });

  it("is empty until the couple or date is filled in", () => {
    expect(getSlug({ ...CREATE_BASE, husbandEn: "", wifeEn: "", ddmmyyyy: "" })).toBe("");
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
});

describe("getRenamedSlug", () => {
  it("leaves a hand-written slug alone however the invitation is edited", () => {
    expect(
      getRenamedSlug({
        storedValue: buildStored({ slug: "our-big-day" }),
        template: TemplateType.FIRST,
        husbandEn: "A",
        wifeEn: "B",
        ddmmyyyy: "08-08-2028",
      }),
    ).toBe("our-big-day");
  });

  it("regenerates a slug created before the template prefix existed", () => {
    expect(
      getRenamedSlug({
        storedValue: buildStored({ slug: "a-b-07-07-2027", template: TemplateType.FIRST }),
        template: TemplateType.FIRST,
        husbandEn: "A",
        wifeEn: "B",
        ddmmyyyy: "08-08-2028",
      }),
    ).toBe("first_a-and-b_08-08-2028");
  });

  it("keeps the stored slug when the couple and date are cleared", () => {
    expect(
      getRenamedSlug({
        storedValue: buildStored(),
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

describe("isSlugValid", () => {
  it("blocks create mode until the couple or date produces a slug", () => {
    expect(isSlugValid("create", "")).toBe(false);
    expect(isSlugValid("create", "third_a-and-b_07-07-2027")).toBe(true);
  });

  it("never blocks edit mode, where the slug always exists", () => {
    expect(isSlugValid("edit", "")).toBe(true);
  });
});
