// Hashes a plaintext password into the "salt:hash" (scrypt, hex) format
// expected by ADMIN_PASSWORD_HASH / src/shared/lib/password.ts.
//
// Usage:
//   node scripts/hash-password.mjs <plain-password>

import { randomBytes, scryptSync } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;

const plain = process.argv[2];
if (!plain) {
  console.error("Usage: node scripts/hash-password.mjs <plain-password>");
  process.exitCode = 1;
} else {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, SCRYPT_KEY_LENGTH).toString("hex");
  console.log(`${salt}:${hash}`);
}
