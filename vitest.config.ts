import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Mirrors the "@/*" -> "./src/*" mapping from tsconfig.json so modules under
// test can use the same import specifiers as the rest of the app.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
