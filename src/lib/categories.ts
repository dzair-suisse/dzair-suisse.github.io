/**
 * Event categories, in display order. The CSS-only filter rules on the events
 * page are generated from this array (see `filterCss` in
 * src/components/pages/EventsPage.astro), so adding a category here (and its
 * labels in src/i18n/ui.ts) is enough.
 */
export const CATEGORIES = ["epfl-unil", "networking", "celebrations"] as const;

export type Category = (typeof CATEGORIES)[number];
