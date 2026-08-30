import { notFound } from "next/navigation";

import type { RawWeddingDoc, WeddingTemplateProps } from "@/entities/wedding";

import { TemplateType } from "@/shared/types/templates";

import { WeddingFirstTemplate } from "@/widgets/wedding/first-template";
import { WeddingSecondTemplate } from "@/widgets/wedding/second-template";
import { WeddingThirdTemplate } from "@/widgets/wedding/third-template";

export function WeddingTemplateSwitch({
  doc,
  guestName,
}: WeddingTemplateSwitchProps): React.JSX.Element {
  const wedding = toWeddingTemplateFields(doc);

  switch (doc.template) {
    case TemplateType.FIRST: {
      return <WeddingFirstTemplate {...wedding} guestName={guestName} />;
    }
    case TemplateType.SECOND: {
      return <WeddingSecondTemplate {...wedding} guestName={guestName} />;
    }
    case TemplateType.THIRD: {
      return <WeddingThirdTemplate {...wedding} guestName={guestName} />;
    }
    default: {
      notFound();
    }
  }
}

interface WeddingTemplateSwitchProps {
  doc: RawWeddingDoc;
  guestName?: string;
}

// Listed field by field rather than spread-minus-_id, same precedent as
// toWeddingFormValue in src/features/wedding-form/lib/formState.ts: this is a
// serialisation boundary (the templates below are client components and a
// Mongo ObjectId can't cross it), so anything new on the document has to be
// named here before it can cross it. A rest-spread would let a future
// non-serialisable field through unnoticed.
function toWeddingTemplateFields(doc: RawWeddingDoc): Omit<WeddingTemplateProps, "guestName"> {
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
