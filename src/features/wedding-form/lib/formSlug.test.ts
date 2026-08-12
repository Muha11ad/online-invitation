import { describe, expect, it } from "vitest";

import type { RawWeddingDoc } from "@/entities/wedding";

import { TemplateType } from "@/shared/types/templates";

import {
  getMediaSlug,
  getRenamedSlug,
  getSlug,
  getSlugPatternError,
  isSlugValid,
  willSlugChange,
} from "./formSlug";

function buildStored(overrides: Partial<RawWeddingDoc> = {}): RawWeddingDoc {
  return {
    slug: "third_a-and-b_07-07-2027",
    template: TemplateType.THIRD,
    ...overrides,
  } as RawWeddingDoc;
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
  const storedValue = buildStored();

  it("shows the stored slug verbatim while the template is unchanged", () => {
    expect(
      getSlug({ ...CREATE_BASE, mode: "edit", storedValue, template: TemplateType.THIRD }),
    ).toBe("third_a-and-b_07-07-2027");
  });

  it("previews the regenerated slug when the template changes", () => {
    expect(
      getSlug({ ...CREATE_BASE, mode: "edit", storedValue, template: TemplateType.FIRST }),
    ).toBe("first_a-and-b_07-07-2027");
  });

  it("ignores a touched manual slug — edit mode never types the slug", () => {
    expect(
      getSlug({ ...CREATE_BASE, mode: "edit", storedValue, slugTouched: true, manualSlug: "x" }),
    ).toBe("third_a-and-b_07-07-2027");
  });
});

describe("getRenamedSlug", () => {
  it("leaves a slug that predates the template prefix alone", () => {
    // The server only renames on an actual template change, so an unchanged
    // template must not preview a rename for these.
    const storedValue = buildStored({ slug: "a-b-07-07-2027", template: TemplateType.FIRST });

    expect(getRenamedSlug({ storedValue, template: TemplateType.FIRST })).toBe("a-b-07-07-2027");
  });

  it("prefixes a legacy slug once the template actually changes", () => {
    const storedValue = buildStored({ slug: "a-b-07-07-2027", template: TemplateType.FIRST });

    expect(getRenamedSlug({ storedValue, template: TemplateType.THIRD })).toBe(
      "third_a-b-07-07-2027",
    );
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
