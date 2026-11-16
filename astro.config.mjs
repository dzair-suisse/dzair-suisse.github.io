// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import pruneUnusedAssets from "./src/integrations/prune-unused-assets.ts";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Site d’organisation GitHub Pages : servi à la racine du domaine.
  site: "https://dzair-suisse.github.io",
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
