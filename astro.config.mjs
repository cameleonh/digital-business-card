import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: process.env.PUBLIC_SITE_URL || "https://example.com",
  vite: {
    resolve: {
      alias: {
        "astro/entrypoints/prerender": fileURLToPath(
          new URL("./node_modules/astro/dist/entrypoints/prerender.js", import.meta.url)
        ),
      },
    },
  },
});
