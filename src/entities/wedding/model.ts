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
  slug: string;
  template: TemplateType;
}

export interface WeddingTemplateProps extends RawWeddingDoc {
  locale: Locale;
  guestName?: string;
}
