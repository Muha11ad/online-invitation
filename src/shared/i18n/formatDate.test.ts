import { describe, expect, it } from "vitest";
import { formatWeddingDate } from "./formatDate";

// 07-07-2027 is a Wednesday.
const DDMMYYYY = "07-07-2027";

describe("formatWeddingDate", () => {
  it("formats the 'formatted' style identically across all locales", () => {
    for (const locale of ["en", "ru", "uz", "kiril"] as const) {
      expect(formatWeddingDate(DDMMYYYY, locale, "formatted")).toBe("07 · 07 · 2027");
    }
  });

  it("formats en short/full", () => {
    expect(formatWeddingDate(DDMMYYYY, "en", "short")).toBe("7 July");
    expect(formatWeddingDate(DDMMYYYY, "en", "full")).toBe("Wednesday, 7 July 2027");
  });

  it("formats ru short/full using genitive month forms and a capitalized weekday", () => {
    expect(formatWeddingDate(DDMMYYYY, "ru", "short")).toBe("7 июля");
    expect(formatWeddingDate(DDMMYYYY, "ru", "full")).toBe("Среда, 7 июля 2027");
  });

  it("formats uz short/full with hyphenated day-month", () => {
    expect(formatWeddingDate(DDMMYYYY, "uz", "short")).toBe("7-Iyul");
    expect(formatWeddingDate(DDMMYYYY, "uz", "full")).toBe("Chorshanba, 7-Iyul 2027");
  });

  it("formats kiril short/full with hyphenated day-month", () => {
    expect(formatWeddingDate(DDMMYYYY, "kiril", "short")).toBe("7-Июл");
    expect(formatWeddingDate(DDMMYYYY, "kiril", "full")).toBe("Чоршанба, 7-Июл 2027");
  });

  it("returns null for unparseable input", () => {
    expect(formatWeddingDate("not-a-date", "en", "full")).toBeNull();
    expect(formatWeddingDate("", "en", "short")).toBeNull();
    expect(formatWeddingDate("2027-07-07", "en", "formatted")).toBeNull();
  });

  it("returns null for a calendar date that doesn't exist", () => {
    expect(formatWeddingDate("31-02-2027", "en", "short")).toBeNull();
  });

  it("returns null for out-of-range month/day", () => {
    expect(formatWeddingDate("07-13-2027", "en", "short")).toBeNull();
    expect(formatWeddingDate("32-07-2027", "en", "short")).toBeNull();
  });
});
