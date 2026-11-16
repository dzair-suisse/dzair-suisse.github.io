// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import pruneUnusedAssets from "./src/integrations/prune-unused-assets.ts";
import { SITE_ORIGIN } from "./src/lib/origin.ts";
import {
  DEFAULT_LANG,
  HTML_LANG,
  LANGS,
  localizedPath,
} from "./src/i18n/routes.ts";

// Adresse publique du site (voir src/lib/origin.ts pour changer de domaine).
const SITE = SITE_ORIGIN;

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE,
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  i18n: {
    defaultLocale: DEFAULT_LANG,
    locales: [...LANGS],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: DEFAULT_LANG, locales: HTML_LANG },
      // The i18n option only pairs identical paths (/x/ ⇄ /en/x/); translated
      // slugs (/evenements/ ⇄ /en/events/) are paired here.
      serialize(item) {
        const path = new URL(item.url).pathname;
        item.links = LANGS.map((lang) => ({
          lang: HTML_LANG[lang],
          url: new URL(localizedPath(path, lang), `${SITE}/`).href,
        }));
        return item;
      },
    }),
    pruneUnusedAssets(),
  ],
  image: {
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
