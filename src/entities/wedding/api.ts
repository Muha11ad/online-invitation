import clientPromise from "@/shared/lib/mongodb";

import type { RawWeddingDoc } from "./model";

export async function getWeddingBySlug(slug: string): Promise<RawWeddingDoc | null> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);

  return db
    .collection<RawWeddingDoc>(process.env.MONGODB_COLLECTION_WEDDINGS!)
    .findOne({ slug });
}
