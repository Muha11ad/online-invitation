import { notFound } from "next/navigation";

import type { RawWeddingDoc } from "@/entities/wedding";

import clientPromise from "@/shared/lib/mongodb";
import { resolveGuestName } from "@/shared/lib/guests";
import { TemplateType } from "@/shared/types/templates";

import { WeddingFirstTemplate } from "@/widgets/wedding/first-template";
import { WeddingSecondTemplate } from "@/widgets/wedding/second-template";
import { WeddingThirdTemplate } from "@/widgets/wedding/third-template";

export default async function EventSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { guest } = await searchParams;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const doc = await db
    .collection<RawWeddingDoc>(process.env.MONGODB_COLLECTION_WEDDINGS!)
    .findOne({ slug });

  if (!doc) {
    notFound();
  }

  switch (doc.template) {
    case TemplateType.FIRST: {
      return <WeddingFirstTemplate {...doc} />;
    }
    case TemplateType.SECOND: {
      return <WeddingSecondTemplate {...doc} />;
    }
    case TemplateType.THIRD: {
      const guestName = resolveGuestName(doc.guests, typeof guest === "string" ? guest : undefined);
      return <WeddingThirdTemplate {...doc} guestName={guestName} />;
    }
    default: {
      notFound();
    }
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ guest?: string | string[] }>;
}
