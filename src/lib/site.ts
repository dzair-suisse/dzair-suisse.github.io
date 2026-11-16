import { INTL_LOCALE, LANGS, type Lang } from "../i18n/routes";

export const SITE = {
  name: "DZAÏR",
  legalName: "DZAIR – Association des étudiants algériens en Suisse",
  email: "dzairassociation@epfl.ch",
  instagram: "https://www.instagram.com/dzair_suisse/",
  linkedin: "https://www.linkedin.com/company/dzair-ch/",
  joinForm:
    "https://docs.google.com/forms/d/e/1FAIpQLSdeZDe7HzFiykEniiz7zmaKlktJakwYzi3iFuHTpvT_-iPmpQ/viewform?usp=header",
  epfl: "https://www.epfl.ch",
  unil: "https://www.unil.ch",
} as const;

const monthFormatters = Object.fromEntries(
  LANGS.map((lang) => [
    lang,
    new Intl.DateTimeFormat(INTL_LOCALE[lang], {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  ]),
) as Record<Lang, Intl.DateTimeFormat>;

/** `2025-11-01` → « Novembre 2025 » (fr) / “November 2025” (en). */
export function formatMonth(date: Date, lang: Lang = "fr"): string {
  const s = monthFormatters[lang].format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** `2025-11-01` → `2025-11` (for `<time datetime>`). */
export function isoMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

const escapeHtml = (s: string): string =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ] ?? c,
  );

/**
 * Escapes a plain-text title and sets French ordinal abbreviations in
 * superscript: « 1er novembre » → `1<sup>er</sup> novembre`. Use with `set:html`.
 */
export function titleHtml(title: string): string {
  // Ordinals: 1er, 1re (premier / première).
  return escapeHtml(title).replace(/\b1(er|re)\b/g, "1<sup>$1</sup>");
}
