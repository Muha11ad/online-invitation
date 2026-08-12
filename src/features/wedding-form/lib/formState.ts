import type { LocalizedString, RawWeddingDoc } from "@/entities/wedding";

import { TemplateType } from "@/shared/types/templates";

import { guestsToText } from "./guests";
import { emptyLocalizedString } from "./localizedString";

export type WeddingFormMode = "create" | "edit";

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
}

// The single answer to "what does each field start as". Keeping it here means
// the component reads `initial.city` instead of unpacking the stored document
// and its fallback inline, sixteen times over.
export function getInitialFormState(
  storedValue: RawWeddingDoc | undefined,
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
  };
}
