/**
 * Languages and localized routes. No Astro imports: also used by
 * astro.config.mjs (sitemap alternates).
 */
export const LANGS = ["fr", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "fr";

/** `<html lang>` and `hreflang` values. */
export const HTML_LANG: Record<Lang, string> = { fr: "fr", en: "en" };
/** JSON-LD `inLanguage` (BCP 47). */
export const CONTENT_LANG: Record<Lang, string> = { fr: "fr-CH", en: "en-GB" };
/** Open Graph `og:locale`. */
export const OG_LOCALE: Record<Lang, string> = { fr: "fr_CH", en: "en_GB" };
/** Locale used by `Intl` (dates). */
export const INTL_LOCALE: Record<Lang, string> = { fr: "fr-CH", en: "en-GB" };

/**
 * Path segments that differ between languages (one entry per translated
 * slug). French is the default language: its pages have no prefix.
 */
const SEGMENTS: Record<Lang, string>[] = [{ fr: "evenements", en: "events" }];

export function isLang(value: unknown): value is Lang {
  return (LANGS as readonly unknown[]).includes(value);
}

export function otherLang(lang: Lang): Lang {
  return lang === "fr" ? "en" : "fr";
}

/**
 * Language of a path relative to the base (`/en/events/` → `en`,
 * `/evenements/` → `fr`).
 */
export function langFromPath(path: string): Lang {
  const first = path.replace(/^\/+/, "").split(/[/?#]/)[0];
  return first && first !== DEFAULT_LANG && isLang(first)
    ? first
    : DEFAULT_LANG;
}

/**
 * Equivalent of a path (relative to the base, with or without leading slash,
 * query and hash kept) in another language, without leading slash:
 * `localizedPath("evenements/?categorie=x", "en")` → `en/events/?categorie=x`,
 * `localizedPath("/en/#contact", "fr")` → `#contact`.
 * Pass the result to `url()`.
 */
export function localizedPath(path: string, lang: Lang): string {
  const [, pathname = "", rest = ""] = /^([^?#]*)(.*)$/s.exec(path) ?? [];
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && isLang(segments[0])) segments.shift();
  const mapped = segments.map((segment) => {
    const entry = SEGMENTS.find((e) => Object.values(e).includes(segment));
    return entry ? entry[lang] : segment;
  });
  if (lang !== DEFAULT_LANG) mapped.unshift(lang);
  const last = mapped.at(-1) ?? "";
  const isFile = /\.[a-z0-9]+$/i.test(last);
  const joined = mapped.join("/");
  return (joined && !isFile ? `${joined}/` : joined) + rest;
}
