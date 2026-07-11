import { notFound } from "next/navigation";

import type { RawWeddingDoc } from "@/entities/wedding";

import clientPromise from "@/shared/lib/mongodb";
import { TemplateType } from "@/shared/types/templates";

import { WeddingFirstTemplate } from "@/widgets/wedding/first-template";
import { WeddingSecondTemplate } from "@/widgets/wedding/second-template";

export default async function EventSlugPage({ params }: PageProps) {
  const { slug } = await params;

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
    default: {
      notFound();
    }
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}
