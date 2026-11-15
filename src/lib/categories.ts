/**
 * Event categories, in display order. The CSS-only filter rules on the events
 * page are generated from this array (see `filterCss` in
 * src/pages/evenements.astro), so adding a category here is enough.
 */
export const CATEGORIES = ["epfl-unil", "networking", "celebrations"] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  "epfl-unil": "Événements EPFL / UNIL",
  networking: "Networking & Partages",
  celebrations: "Célébrations & Sorties",
};
