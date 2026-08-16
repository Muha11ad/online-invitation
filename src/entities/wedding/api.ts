import type { Collection, Filter, UpdateFilter, WithId } from "mongodb";

import clientPromise from "@/shared/lib/mongodb";

import type { RawWeddingDoc } from "./model";

export async function getWeddingBySlug(slug: string): Promise<RawWeddingDoc | null> {
  const collection = await getWeddingsCollection();

  // Retired slugs resolve too, so an invitation link already sent to guests
  // keeps working after a template change regenerated the slug.
  return collection.findOne({ $or: [{ slug }, { previousSlugs: slug }] });
}

export async function listWeddings(): Promise<WeddingListItem[]> {
  const collection = await getWeddingsCollection();

  return collection
    .find({}, { projection: { slug: 1, template: 1, names: 1, date: 1, guests: 1 } })
    .toArray() as Promise<WeddingListItem[]>;
}

export async function slugExists(slug: string): Promise<boolean> {
  const collection = await getWeddingsCollection();

  // Retired slugs count as taken — reusing one would hijack links that still
  // point at the invitation that gave it up.
  const filter: Filter<RawWeddingDoc> = { $or: [{ slug }, { previousSlugs: slug }] };

  const count = await collection.countDocuments(filter, { limit: 1 });
  return count > 0;
}

export async function createWedding(doc: Omit<RawWeddingDoc, "_id">): Promise<void> {
  const collection = await getWeddingsCollection();
  await collection.insertOne(doc as RawWeddingDoc);
}

export async function updateWeddingBySlug(params: UpdateWeddingBySlugParams): Promise<boolean> {
  const { slug } = params;

  const collection = await getWeddingsCollection();
  const update = buildUpdateFilter(params);
  if (Object.keys(update).length === 0) {
    return true;
  }

  // Reported back so a caller can tell whether the document it patched is
  // still there.
  const result = await collection.updateOne({ slug }, update);
  return result.matchedCount > 0;
}

function buildUpdateFilter(params: UpdateWeddingBySlugParams): UpdateFilter<RawWeddingDoc> {
  const { patch, unsetFields = [] } = params;

  const update: UpdateFilter<RawWeddingDoc> = {};

  if (Object.keys(patch).length > 0) {
    update.$set = patch;
  }

  if (unsetFields.length > 0) {
    update.$unset = Object.fromEntries(unsetFields.map((field) => [field, ""]));
  }

  return update;
}

export async function deleteWeddingBySlug(slug: string): Promise<void> {
  const collection = await getWeddingsCollection();
  await collection.deleteOne({ slug });
}

async function getWeddingsCollection(): Promise<Collection<RawWeddingDoc>> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  return db.collection<RawWeddingDoc>(process.env.MONGODB_COLLECTION_WEDDINGS!);
}

export interface UpdateWeddingBySlugParams {
  // The stored slug to match on — not necessarily the one the caller was given,
  // which may be retired.
  slug: string;
  patch: Partial<Omit<RawWeddingDoc, "_id" | "slug" | "previousSlugs">>;
  unsetFields?: ReadonlyArray<keyof RawWeddingDoc>;
}

export type WeddingListItem = WithId<
  Pick<RawWeddingDoc, "slug" | "template" | "names" | "date" | "guests">
>;
