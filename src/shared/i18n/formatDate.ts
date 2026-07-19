import { getDictionary } from "./dictionary";
import type { Locale } from "./locale";

type DateStyle = "short" | "full" | "formatted";

interface ParsedDate {
  day: number;
  month: number;
  year: number;
  weekdayIndex: number;
}

// Locales whose short/full styles hyphenate the day and month instead of separating them with a space.
const HYPHENATED_DAY_MONTH_LOCALES: readonly Locale[] = ["uz", "kiril"];

export function formatWeddingDate(
  ddmmyyyy: string,
  locale: Locale,
  style: DateStyle,
): string | null {
  const parsed = parseDdmmyyyy(ddmmyyyy);
  if (!parsed) {
    return null;
  }

  if (style === "formatted") {
    return `${pad(parsed.day)} · ${pad(parsed.month)} · ${parsed.year}`;
  }

  const dict = getDictionary(locale).date;
  const monthName = dict.months[parsed.month - 1];
  const dayMonth = HYPHENATED_DAY_MONTH_LOCALES.includes(locale)
    ? `${parsed.day}-${monthName}`
    : `${parsed.day} ${monthName}`;

  if (style === "short") {
    return dayMonth;
  }

  const weekdayName = dict.weekdays[parsed.weekdayIndex];
  return `${weekdayName}, ${dayMonth} ${parsed.year}`;
}

function parseDdmmyyyy(value: string): ParsedDate | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  const isValidCalendarDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isValidCalendarDate) {
    return null;
  }

  return { day, month, year, weekdayIndex: date.getDay() };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
