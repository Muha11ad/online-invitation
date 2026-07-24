import { LOCALES } from "@/shared/i18n";
import type { LocalizedString } from "@/shared/i18n";

import type { RawWeddingDoc } from "../model";

// Fields the admin panel is allowed to create/update, besides `slug` (which
// is immutable after creation and validated separately by the POST route).
export const WEDDING_MUTABLE_FIELDS = [
  "template",
  "names",
  "date",
  "location",
  "message",
  "music",
  "guests",
  "coupleMainImage",
] as const satisfies ReadonlyArray<keyof RawWeddingDoc>;

// Fields that can be explicitly cleared (sent as `null`) in partial/PATCH
// mode, which the caller is expected to translate into a MongoDB `$unset`.
export const NULLABLE_WEDDING_FIELDS = [
  "guests",
  "music",
  "coupleMainImage",
] as const satisfies ReadonlyArray<keyof RawWeddingDoc>;

const DDMMYYYY_PATTERN = /^\d{2}-\d{2}-\d{4}$/;
const TEMPLATES: ReadonlyArray<RawWeddingDoc["template"]> = ["first", "second", "third"];

export interface WeddingInputValue {
  template?: RawWeddingDoc["template"];
  names?: RawWeddingDoc["names"];
  date?: RawWeddingDoc["date"];
  location?: RawWeddingDoc["location"];
  message?: LocalizedString;
  guests?: string[] | null;
  music?: string | null;
  coupleMainImage?: string | null;
}

export interface ValidateWeddingInputOptions {
  // Partial (PATCH) mode: fields may be omitted, and the nullable fields
  // above may be sent as `null` to request clearing them.
  partial: boolean;
  allowedKeys: readonly string[];
}

export type ValidateWeddingInputResult =
  { ok: true; value: WeddingInputValue } | { ok: false; error: string };

export function validateWeddingInput(
  json: unknown,
  options: ValidateWeddingInputOptions,
): ValidateWeddingInputResult {
  if (!isPlainObject(json)) {
    return { ok: false, error: "Invalid request body" };
  }

  const unknownKey = Object.keys(json).find((key) => !options.allowedKeys.includes(key));
  if (unknownKey) {
    return { ok: false, error: `Unknown field: ${unknownKey}` };
  }

  const { partial } = options;
  const value: WeddingInputValue = {};

  const validators = [
    () => validateTemplate(json, value, partial),
    () => validateNames(json, value, partial),
    () => validateDate(json, value, partial),
    () => validateLocation(json, value, partial),
    () => validateMessage(json, value, partial),
    () => validateGuests(json, value, partial),
    () => validateMusic(json, value, partial),
    () => validateCoupleMainImage(json, value, partial),
  ];

  for (const validate of validators) {
    const error = validate();
    if (error) {
      return { ok: false, error };
    }
  }

  return { ok: true, value };
}

function validateTemplate(
  json: Record<string, unknown>,
  value: WeddingInputValue,
  partial: boolean,
): string | null {
  if (!("template" in json)) {
    return partial ? null : "Missing template";
  }

  if (!TEMPLATES.includes(json.template as RawWeddingDoc["template"])) {
    return "Invalid template";
  }

  value.template = json.template as RawWeddingDoc["template"];
  return null;
}

function validateNames(
  json: Record<string, unknown>,
  value: WeddingInputValue,
  partial: boolean,
): string | null {
  if (!("names" in json)) {
    return partial ? null : "Missing names";
  }

  const names = json.names;
  if (!isPlainObject(names)) {
    return "Invalid names";
  }

  const husbandError = validateLocalizedShape(names.husband, "names.husband");
  if (husbandError) {
    return husbandError;
  }

  const wifeError = validateLocalizedShape(names.wife, "names.wife");
  if (wifeError) {
    return wifeError;
  }

  value.names = names as RawWeddingDoc["names"];
  return null;
}

function validateDate(
  json: Record<string, unknown>,
  value: WeddingInputValue,
  partial: boolean,
): string | null {
  if (!("date" in json)) {
    return partial ? null : "Missing date";
  }

  const date = json.date;
  if (!isPlainObject(date)) {
    return "Invalid date";
  }

  if (typeof date.ddmmyyyy !== "string" || !DDMMYYYY_PATTERN.test(date.ddmmyyyy)) {
    return "Invalid date.ddmmyyyy";
  }

  if (typeof date.time !== "string" || date.time.trim().length === 0) {
    return "Invalid date.time";
  }

  value.date = { ddmmyyyy: date.ddmmyyyy, time: date.time };
  return null;
}

function validateLocation(
  json: Record<string, unknown>,
  value: WeddingInputValue,
  partial: boolean,
): string | null {
  if (!("location" in json)) {
    return partial ? null : "Missing location";
  }

  const location = json.location;
  if (!isPlainObject(location)) {
    return "Invalid location";
  }

  const cityError = validateLocalizedShape(location.city, "location.city");
  if (cityError) {
    return cityError;
  }

  const venueError = validateLocalizedShape(location.venue, "location.venue");
  if (venueError) {
    return venueError;
  }

  const addressError = validateLocalizedShape(location.address, "location.address");
  if (addressError) {
    return addressError;
  }

  const coords = location.coords;
  if (!isPlainObject(coords) || !isFiniteNumber(coords.lat) || !isFiniteNumber(coords.lon)) {
    return "Invalid location.coords";
  }

  value.location = location as RawWeddingDoc["location"];
  return null;
}

function validateMessage(
  json: Record<string, unknown>,
  value: WeddingInputValue,
  partial: boolean,
): string | null {
  if (!("message" in json)) {
    return partial ? null : "Missing message";
  }

  const error = validateLocalizedShape(json.message, "message");
  if (error) {
    return error;
  }

  value.message = json.message as LocalizedString;
  return null;
}

function validateGuests(
  json: Record<string, unknown>,
  value: WeddingInputValue,
  partial: boolean,
): string | null {
  if (!("guests" in json)) {
    return null;
  }

  const guests = json.guests;
  if (guests === null) {
    return validateNullableClear("guests", value, partial);
  }

  if (!Array.isArray(guests) || guests.some((guest) => typeof guest !== "string")) {
    return "Invalid guests";
  }

  value.guests = guests;
  return null;
}

function validateMusic(
  json: Record<string, unknown>,
  value: WeddingInputValue,
  partial: boolean,
): string | null {
  if (!("music" in json)) {
    return null;
  }

  const music = json.music;
  if (music === null) {
    return validateNullableClear("music", value, partial);
  }

  if (typeof music !== "string") {
    return "Invalid music";
  }

  value.music = music;
  return null;
}

function validateCoupleMainImage(
  json: Record<string, unknown>,
  value: WeddingInputValue,
  partial: boolean,
): string | null {
  if (!("coupleMainImage" in json)) {
    return null;
  }

  const coupleMainImage = json.coupleMainImage;
  if (coupleMainImage === null) {
    return validateNullableClear("coupleMainImage", value, partial);
  }

  if (typeof coupleMainImage !== "string") {
    return "Invalid coupleMainImage";
  }

  value.coupleMainImage = coupleMainImage;
  return null;
}

function validateNullableClear(
  field: (typeof NULLABLE_WEDDING_FIELDS)[number],
  value: WeddingInputValue,
  partial: boolean,
): string | null {
  if (!partial) {
    return `Invalid ${field}`;
  }

  value[field] = null;
  return null;
}

function validateLocalizedShape(value: unknown, field: string): string | null {
  if (!isPlainObject(value)) {
    return `Invalid ${field}`;
  }

  for (const locale of LOCALES) {
    if (locale in value && typeof value[locale] !== "string") {
      return `Invalid ${field}.${locale}`;
    }
  }

  return null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
