// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import pruneUnusedAssets from "./src/integrations/prune-unused-assets.ts";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: "https://adessrrrr.github.io",
  base: "/dzair_epfl",
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  integrations: [sitemap(), pruneUnusedAssets()],
  image: {
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
