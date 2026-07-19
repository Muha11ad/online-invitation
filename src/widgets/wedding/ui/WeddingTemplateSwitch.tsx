import { notFound } from "next/navigation";

import type { RawWeddingDoc } from "@/entities/wedding";

import type { Locale } from "@/shared/i18n";
import { TemplateType } from "@/shared/types/templates";

import { WeddingFirstTemplate } from "@/widgets/wedding/first-template";
import { WeddingSecondTemplate } from "@/widgets/wedding/second-template";
import { WeddingThirdTemplate } from "@/widgets/wedding/third-template";

interface WeddingTemplateSwitchProps {
  doc: RawWeddingDoc;
  locale: Locale;
  guestName?: string;
}

export function WeddingTemplateSwitch({
  doc,
  locale,
  guestName,
}: WeddingTemplateSwitchProps): React.JSX.Element {
  switch (doc.template) {
    case TemplateType.FIRST: {
      return <WeddingFirstTemplate {...doc} locale={locale} guestName={guestName} />;
    }
    case TemplateType.SECOND: {
      return <WeddingSecondTemplate {...doc} locale={locale} guestName={guestName} />;
    }
    case TemplateType.THIRD: {
      return <WeddingThirdTemplate {...doc} locale={locale} guestName={guestName} />;
    }
    default: {
      notFound();
    }
  }
}
