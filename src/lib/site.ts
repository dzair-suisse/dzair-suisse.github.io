export const SITE = {
  name: "DZAÏR",
  title: "DZAÏR – Étudiants algériens en Suisse",
  legalName: "DZAIR – Association des étudiants algériens en Suisse",
  description:
    "DZAÏR rassemble les étudiants algériens en Suisse pour faciliter leur intégration, encourager l’entraide et créer un réseau actif.",
  email: "dzairassociation@epfl.ch",
  instagram: "https://www.instagram.com/dzair_suisse/",
  joinForm:
    "https://docs.google.com/forms/d/e/1FAIpQLSdeZDe7HzFiykEniiz7zmaKlktJakwYzi3iFuHTpvT_-iPmpQ/viewform?usp=header",
  epfl: "https://www.epfl.ch",
  unil: "https://www.unil.ch",
  locale: "fr_CH",
} as const;

const monthFormatter = new Intl.DateTimeFormat("fr-CH", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** `2025-11-01` → « Novembre 2025 ». */
export function formatMonth(date: Date): string {
  const s = monthFormatter.format(date);
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
