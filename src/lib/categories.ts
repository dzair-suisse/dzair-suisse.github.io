export const CATEGORIES = ["epfl-unil", "networking", "celebrations"] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  "epfl-unil": "Événements EPFL / UNIL",
  networking: "Networking & Partages",
  celebrations: "Célébrations & Sorties",
};
