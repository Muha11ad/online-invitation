import { describe, expect, it } from "vitest";

import { TemplateType } from "@/shared/types/templates";

import { applyTemplatePrefix, buildAutoSlug, isGeneratedSlug, SLUG_PATTERN, slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("  Ali Vali  ")).toBe("ali-vali");
  });

  it("drops leading and trailing separators", () => {
    expect(slugify("!!Ali!!")).toBe("ali");
  });

  it("returns an empty string when nothing survives", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("buildAutoSlug", () => {
  it("prefixes the template and joins the couple with -and-", () => {
    expect(
      buildAutoSlug({
        template: TemplateType.THIRD,
        husbandEn: "A",
        wifeEn: "B",
        ddmmyyyy: "07-07-2027",
      }),
    ).toBe("third_a-and-b_07-07-2027");
  });

  it("keeps the same couple and date unique across templates", () => {
    const couple = { husbandEn: "Ali", wifeEn: "Madina", ddmmyyyy: "12-09-2026" };

    expect(buildAutoSlug({ template: TemplateType.FIRST, ...couple })).not.toBe(
      buildAutoSlug({ template: TemplateType.THIRD, ...couple }),
    );
  });

  it("omits empty parts instead of leaving dangling separators", () => {
    expect(
      buildAutoSlug({
        template: TemplateType.FIRST,
        husbandEn: "Ali",
        wifeEn: "",
        ddmmyyyy: "12-09-2026",
      }),
    ).toBe("first_ali_12-09-2026");

    expect(
      buildAutoSlug({
        template: TemplateType.FIRST,
        husbandEn: "Ali",
        wifeEn: "Madina",
        ddmmyyyy: "",
      }),
    ).toBe("first_ali-and-madina");
  });

  it("stays empty while the couple and date are blank", () => {
    // Media upload slots treat an empty slug as "no invitation yet" and stay
    // disabled, so the template alone must not produce one.
    expect(
      buildAutoSlug({ template: TemplateType.FIRST, husbandEn: "", wifeEn: "", ddmmyyyy: "" }),
    ).toBe("");

    expect(
      buildAutoSlug({ template: TemplateType.FIRST, husbandEn: "!!!", wifeEn: "  ", ddmmyyyy: "" }),
    ).toBe("");
  });

  it("produces a slug the API pattern accepts", () => {
    const slug = buildAutoSlug({
      template: TemplateType.SECOND,
      husbandEn: "Ali",
      wifeEn: "Madina",
      ddmmyyyy: "12-09-2026",
    });

    expect(SLUG_PATTERN.test(slug)).toBe(true);
  });
});

describe("isGeneratedSlug", () => {
  const couple = {
    template: TemplateType.THIRD,
    husbandEn: "Ali",
    wifeEn: "Madina",
    ddmmyyyy: "12-09-2026",
  };

  it("recognises a slug in the current format", () => {
    expect(isGeneratedSlug({ slug: "third_ali-and-madina_12-09-2026", ...couple })).toBe(true);
  });

  it("recognises a slug from before the template prefix existed", () => {
    expect(isGeneratedSlug({ slug: "ali-madina-12-09-2026", ...couple })).toBe(true);
  });

  it("does not recognise a hand-written slug", () => {
    expect(isGeneratedSlug({ slug: "our-big-day", ...couple })).toBe(false);
  });

  it("does not recognise a slug describing different values", () => {
    expect(isGeneratedSlug({ slug: "third_ali-and-madina_01-01-2020", ...couple })).toBe(false);
  });
});

describe("applyTemplatePrefix", () => {
  it("swaps an existing template segment", () => {
    expect(applyTemplatePrefix("third_a-and-b_07-07-2027", TemplateType.FIRST)).toBe(
      "first_a-and-b_07-07-2027",
    );
  });

  it("prepends to a legacy slug that has no template segment", () => {
    expect(applyTemplatePrefix("a-b-07-07-2027", TemplateType.FIRST)).toBe("first_a-b-07-07-2027");
  });

  it("preserves a hand-written slug body", () => {
    expect(applyTemplatePrefix("first_our-big-day", TemplateType.SECOND)).toBe(
      "second_our-big-day",
    );
  });

  it("does not treat a bare template name as a prefixed slug", () => {
    expect(applyTemplatePrefix("third", TemplateType.FIRST)).toBe("first_third");
  });

  it("is idempotent for an unchanged template", () => {
    const slug = "third_a-and-b_07-07-2027";
    expect(applyTemplatePrefix(slug, TemplateType.THIRD)).toBe(slug);
  });

  it("leaves an empty slug alone", () => {
    expect(applyTemplatePrefix("", TemplateType.FIRST)).toBe("");
  });
});
