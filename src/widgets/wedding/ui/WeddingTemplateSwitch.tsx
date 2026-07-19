import { notFound } from "next/navigation";

import type { RawWeddingDoc } from "@/entities/wedding";

import { TemplateType } from "@/shared/types/templates";

import { WeddingFirstTemplate } from "@/widgets/wedding/first-template";
import { WeddingSecondTemplate } from "@/widgets/wedding/second-template";
import { WeddingThirdTemplate } from "@/widgets/wedding/third-template";

interface WeddingTemplateSwitchProps {
  doc: RawWeddingDoc;
  guestName?: string;
}

export function WeddingTemplateSwitch({
  doc,
  guestName,
}: WeddingTemplateSwitchProps): React.JSX.Element {
  switch (doc.template) {
    case TemplateType.FIRST: {
      return <WeddingFirstTemplate {...doc} guestName={guestName} />;
    }
    case TemplateType.SECOND: {
      return <WeddingSecondTemplate {...doc} guestName={guestName} />;
    }
    case TemplateType.THIRD: {
      return <WeddingThirdTemplate {...doc} guestName={guestName} />;
    }
    default: {
      notFound();
    }
  }
}
