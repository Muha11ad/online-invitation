// Migrates the hardcoded per-wedding media URLs (music / coupleMainImage)
// from local /public paths to their new public R2 URLs, now that the files
// have been uploaded via scripts/upload-media-to-r2.sh.
//
// Usage:
//   node scripts/migrate-media-to-r2.mjs [--dry-run]
//
// Reads MONGODB_URI / MONGODB_DB_NAME / MONGODB_COLLECTION_WEDDINGS from
// /Users/mim/Projects/online-invitation/.env explicitly (not cwd-relative).

import { config } from "dotenv";
import { MongoClient } from "mongodb";

const ENV_PATH = "/Users/mim/Projects/online-invitation/.env";

config({ path: ENV_PATH });

const isDryRun = process.argv.includes("--dry-run");

const R2_PUBLIC_BASE = "https://pub-4a35e8f2f4c84c4c975069310d47d03f.r2.dev";

const SLUG_UPDATES = {
  "a-and-b_07-07-2027": {
    music: `${R2_PUBLIC_BASE}/wedding/a-and-b_07-07-2027/audios/wedding.mp3`,
  },
  "a-and-b_08-08-2028": {
    music: `${R2_PUBLIC_BASE}/wedding/a-and-b_08-08-2028/audios/wedding.mp3`,
  },
  "a-and-b_09-09-2029": {
    music: `${R2_PUBLIC_BASE}/wedding/a-and-b_09-09-2029/audios/wedding.mp3`,
    coupleMainImage: `${R2_PUBLIC_BASE}/wedding/a-and-b_09-09-2029/images/wedding.png`,
  },
};

async function main() {
  const client = new MongoClient(requireEnv("MONGODB_URI"));
  await client.connect();

  const db = client.db(requireEnv("MONGODB_DB_NAME"));
  const collection = db.collection(requireEnv("MONGODB_COLLECTION_WEDDINGS"));

  const slugs = Object.keys(SLUG_UPDATES);
  const docs = await collection.find({ slug: { $in: slugs } }).toArray();
  console.log(
    `Found ${docs.length} of ${slugs.length} expected document(s) in ${collection.collectionName}.`,
  );
  console.log(isDryRun ? "Running in --dry-run mode (no writes will be made).\n" : "");

  for (const doc of docs) {
    await migrateDoc(collection, doc);
  }

  await client.close();
}

async function migrateDoc(collection, doc) {
  const slug = doc.slug ?? String(doc._id);
  const set = SLUG_UPDATES[doc.slug];

  if (!set) {
    console.log(`[skip] ${slug} — no media update defined`);
    return;
  }

  console.log(`[migrate] ${slug}`);
  console.log(`  $set: ${JSON.stringify(set)}`);

  if (isDryRun) {
    return;
  }

  await collection.updateOne({ _id: doc._id }, { $set: set });
  console.log(`  done.`);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
