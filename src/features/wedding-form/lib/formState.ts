import type { LocalizedString, RawWeddingDoc } from "@/entities/wedding";

import { getMediaId } from "@/shared/lib/mediaPrefix";

import { TemplateType } from "@/shared/types/templates";

import { guestsToText } from "./guests";
import { emptyLocalizedString } from "./localizedString";

export type WeddingFormMode = "create" | "edit";

// The stored invitation minus `_id`. A Mongo ObjectId is a class instance with
// a toJSON method, and React refuses to serialise those across the server →
// client component boundary, so the form is handed a plain object instead.
export type WeddingFormValue = Omit<RawWeddingDoc, "_id">;

// Listed field by field rather than spread-minus-_id: this is a serialisation
// boundary, so anything new on the document has to be named here before it can
// cross it.
export function toWeddingFormValue(doc: RawWeddingDoc): WeddingFormValue {
  return {
    slug: doc.slug,
    previousSlugs: doc.previousSlugs,
    mediaId: doc.mediaId,
    template: doc.template,
    names: doc.names,
    date: doc.date,
    location: doc.location,
    message: doc.message,
    guests: doc.guests,
    music: doc.music,
    coupleMainImage: doc.coupleMainImage,
  };
}

export interface WeddingFormInitialState {
  template: RawWeddingDoc["template"];
  husband: LocalizedString;
  wife: LocalizedString;
  ddmmyyyy: string;
  time: string;
  city: LocalizedString;
  venue: LocalizedString;
  address: LocalizedString;
  lat: string;
  lon: string;
  message: LocalizedString;
  guestsText: string;
  music: string | undefined;
  coupleMainImage: string | undefined;
  slug: string;
  mediaId: string;
}

// The single answer to "what does each field start as". Keeping it here means
// the component reads `initial.city` instead of unpacking the stored document
// and its fallback inline, sixteen times over.
export function getInitialFormState(
  storedValue: WeddingFormValue | undefined,
): WeddingFormInitialState {
  if (!storedValue) {
    return getBlankFormState();
  }

  return {
    template: storedValue.template,
    husband: storedValue.names.husband,
    wife: storedValue.names.wife,
    ddmmyyyy: storedValue.date.ddmmyyyy,
    time: storedValue.date.time,
    city: storedValue.location.city,
    venue: storedValue.location.venue,
    address: storedValue.location.address,
    lat: String(storedValue.location.coords.lat),
    lon: String(storedValue.location.coords.lon),
    message: storedValue.message,
    guestsText: guestsToText(storedValue.guests),
    music: storedValue.music,
    coupleMainImage: storedValue.coupleMainImage,
    slug: storedValue.slug,
    mediaId: getMediaId(storedValue),
  };
}

function getBlankFormState(): WeddingFormInitialState {
  return {
    template: TemplateType.FIRST,
    husband: emptyLocalizedString(),
    wife: emptyLocalizedString(),
    ddmmyyyy: "",
    time: "",
    city: emptyLocalizedString(),
    venue: emptyLocalizedString(),
    address: emptyLocalizedString(),
    lat: "",
    lon: "",
    message: emptyLocalizedString(),
    guestsText: "",
    music: undefined,
    coupleMainImage: undefined,
    slug: "",
    // Left empty on purpose: getInitialFormState runs on every render, so the
    // id is minted once by the component's lazy state initialiser instead.
    mediaId: "",
  };
}
