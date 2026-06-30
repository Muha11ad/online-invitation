import { notFound } from 'next/navigation';

import type { RawWeddingDoc } from '@/entities/wedding';
import { WeddingFirstTemplate } from '@/widgets/wedding/first-template';
import { WeddingSecondTemplate } from '@/widgets/wedding/second-template';
import clientPromise from '@/shared/lib/mongodb';


export default async function EventSlugPage(props: PageProps) {
  const { slug } = await props.params;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const doc = await db
    .collection<RawWeddingDoc>(process.env.MONGODB_COLLECTION_WEDDINGS!)
    .findOne({ slug });

  if (!doc) {
    notFound();
  }

  if (doc.template === 'second') {
    return <WeddingSecondTemplate {...doc} />;
  }
  return <WeddingFirstTemplate {...doc} />;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}
