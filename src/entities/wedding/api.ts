import type { Collection, UpdateFilter, WithId } from "mongodb";

import clientPromise from "@/shared/lib/mongodb";

import type { RawWeddingDoc } from "./model";

export async function getWeddingBySlug(slug: string): Promise<RawWeddingDoc | null> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);

  return db.collection<RawWeddingDoc>(process.env.MONGODB_COLLECTION_WEDDINGS!).findOne({ slug });
}

export async function listWeddings(): Promise<WeddingListItem[]> {
  const collection = await getWeddingsCollection();

  return collection
    .find({}, { projection: { slug: 1, template: 1, names: 1, date: 1, guests: 1 } })
    .toArray() as Promise<WeddingListItem[]>;
}

export async function slugExists(slug: string): Promise<boolean> {
  const collection = await getWeddingsCollection();
  const count = await collection.countDocuments({ slug }, { limit: 1 });
  return count > 0;
}

export async function createWedding(doc: Omit<RawWeddingDoc, "_id">): Promise<void> {
  const collection = await getWeddingsCollection();
  await collection.insertOne(doc as RawWeddingDoc);
}

export async function updateWeddingBySlug(
  slug: string,
  patch: Partial<Omit<RawWeddingDoc, "_id" | "slug">>,
  unsetFields: ReadonlyArray<keyof RawWeddingDoc> = [],
): Promise<void> {
  const collection = await getWeddingsCollection();
  const update = buildUpdateFilter(patch, unsetFields);
  if (Object.keys(update).length === 0) {
    return;
  }

  await collection.updateOne({ slug }, update);
}

function buildUpdateFilter(
  patch: Partial<Omit<RawWeddingDoc, "_id" | "slug">>,
  unsetFields: ReadonlyArray<keyof RawWeddingDoc>,
): UpdateFilter<RawWeddingDoc> {
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

export type WeddingListItem = WithId<
  Pick<RawWeddingDoc, "slug" | "template" | "names" | "date" | "guests">
>;
