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
