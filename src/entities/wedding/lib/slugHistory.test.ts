import { describe, expect, it } from "vitest";

import { retireSlug } from "./slugHistory";

describe("retireSlug", () => {
  it("retires the current slug when there is no history yet", () => {
    expect(retireSlug("third_a-and-b_07-07-2027", undefined, "first_a-and-b_07-07-2027")).toEqual([
      "third_a-and-b_07-07-2027",
    ]);
  });

  it("keeps earlier retired slugs", () => {
    expect(retireSlug("third_a", ["second_a"], "first_a")).toEqual(["second_a", "third_a"]);
  });

  it("drops the slug being adopted from the history", () => {
    // first -> third -> first: "first_a" becomes live again and must not stay
    // listed as retired.
    expect(retireSlug("third_a", ["first_a"], "first_a")).toEqual(["third_a"]);
  });

  it("does not duplicate a slug already retired", () => {
    expect(retireSlug("third_a", ["third_a", "second_a"], "first_a")).toEqual([
      "third_a",
      "second_a",
    ]);
  });
});
