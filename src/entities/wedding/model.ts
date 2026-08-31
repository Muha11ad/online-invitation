import type { ObjectId } from "mongodb";

import type { LocalizedString } from "@/shared/i18n";
import type { TemplateType } from "@/shared/types/templates";

export type { LocalizedString };

export interface RawWeddingDoc {
  _id: ObjectId;
  names: {
    husband: LocalizedString;
    wife: LocalizedString;
  };
  date: {
    time: string;
    ddmmyyyy: string;
  };
  location: {
    city: LocalizedString;
    venue: LocalizedString;
    address: LocalizedString;
    coords: {
      lat: number;
      lon: number;
    };
  };
  message: LocalizedString;
  music?: string;
  coupleMainImage?: string;
  slug: string;
  // Slugs this invitation used to be reachable at, kept so links already sent
  // to guests keep resolving after the slug is regenerated.
  previousSlugs?: string[];
  // Stable key prefix for this invitation's media in R2. Assigned once at
  // creation and never changed, so renaming the slug never has to move stored
  // objects. Optional only for documents created before it existed — see
  // getMediaPrefix and todo.md.
  mediaId?: string;
  template: TemplateType;
}

// `_id` is a Mongo ObjectId class instance and React refuses to serialise it
// across the server -> client component boundary (same problem solved the
// same way for the admin form — see WeddingFormValue in
// src/features/wedding-form/lib/formState.ts). Locale is dropped too: guest
// language is now a client-side choice via LocaleProvider, not something the
// server resolves and hands down.
export interface WeddingTemplateProps extends Omit<RawWeddingDoc, "_id"> {
  guestName?: string;
}
