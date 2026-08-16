import { ObjectId } from "mongodb";

import type { Locale, LocalizedString } from "@/shared/i18n";
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
  guests?: string[];
  coupleMainImage?: string;
  // A client-minted crypto.randomUUID(), assigned once when the create form
  // mounts and never changed afterwards. It is the single id for the
  // invitation: it identifies the document and, via getMediaPrefix, keys its
  // media in R2.
  slug: string;
  // Slugs sent to guests before the UUID migration, kept only so those links
  // keep resolving. No longer written to — the slug never changes now.
  previousSlugs?: string[];
  template: TemplateType;
}

export interface WeddingTemplateProps extends RawWeddingDoc {
  locale: Locale;
  guestName?: string;
}
