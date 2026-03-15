import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  site: process.env.PUBLIC_SITE_URL || "https://example.com",
});
