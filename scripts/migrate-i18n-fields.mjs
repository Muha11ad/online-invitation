// Migrates existing wedding documents to the new localized schema:
//   - message / location.city / location.venue / location.address: string -> LocalizedString
//   - names.a / names.b -> names.husband / names.wife (LocalizedString)
//   - location.ceremonyTime -> date.time (plain string)
//   - drops the old date.short / date.full / date.formatted fields
//
// Every localized field is seeded with the original string value in all 4
// locale slots (en/ru/uz/kiril) as a starting point — the doc is renderable
// right away, but ru/uz/kiril still need real translations filled in by hand.
//
// Usage:
//   node scripts/migrate-i18n-fields.mjs [--dry-run]
//
// Reads MONGODB_URI / MONGODB_DB_NAME / MONGODB_COLLECTION_WEDDINGS from
// /Users/mim/Projects/online-invitation/.env explicitly (not cwd-relative).

import { config } from "dotenv";
import { MongoClient } from "mongodb";

const ENV_PATH = "/Users/mim/Projects/online-invitation/.env";

config({ path: ENV_PATH });

const isDryRun = process.argv.includes("--dry-run");

async function main() {
  const client = new MongoClient(requireEnv("MONGODB_URI"));
  await client.connect();

  const db = client.db(requireEnv("MONGODB_DB_NAME"));
  const collection = db.collection(requireEnv("MONGODB_COLLECTION_WEDDINGS"));

  const docs = await collection.find({}).toArray();
  console.log(`Found ${docs.length} document(s) in ${collection.collectionName}.`);
  console.log(isDryRun ? "Running in --dry-run mode (no writes will be made).\n" : "");

  for (const doc of docs) {
    await migrateDoc(collection, doc);
  }

  await client.close();
}

async function migrateDoc(collection, doc) {
  const slug = doc.slug ?? String(doc._id);

  if (typeof doc.message !== "string") {
    console.log(`[skip] ${slug} — already migrated`);
    return;
  }

  const set = {
    message: toLocalized(doc.message),
    "location.city": toLocalized(doc.location?.city),
    "location.venue": toLocalized(doc.location?.venue),
    "location.address": toLocalized(doc.location?.address),
    "names.husband": toLocalized(doc.names?.a),
    "names.wife": toLocalized(doc.names?.b),
  };
  const unset = {
    "names.a": "",
    "names.b": "",
    "date.short": "",
    "date.full": "",
    "date.formatted": "",
  };

  if (doc.location?.ceremonyTime !== undefined && doc.date?.time === undefined) {
    set["date.time"] = doc.location.ceremonyTime;
    unset["location.ceremonyTime"] = "";
  }

  console.log(`[migrate] ${slug}`);
  console.log(
    "  seeded all locales (en/ru/uz/kiril) with the original value — translate ru/uz/kiril properly before publishing",
  );
  console.log(`  $set: ${JSON.stringify(set)}`);
  console.log(`  $unset: ${JSON.stringify(unset)}`);

  if (isDryRun) {
    return;
  }

  await collection.updateOne({ _id: doc._id }, { $set: set, $unset: unset });
  console.log(`  done.`);
}

function toLocalized(value) {
  if (value && typeof value === "object") {
    // Already localized (defensive — shouldn't happen given the string guard above).
    return value;
  }
  // Seed every locale with the original value so the doc renders everywhere
  // (including the default "kiril" locale) immediately after migration, even
  // before real per-locale translations are filled in by hand.
  const original = value ?? "";
  return { en: original, ru: original, uz: original, kiril: original };
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
