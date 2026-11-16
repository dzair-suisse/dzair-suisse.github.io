import { SITE_ORIGIN } from "./origin";

/**
 * Helpers that respect Astro's `base` (`/` today).
 * Always use them for internal links and files served from `public/`.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

/** `url("evenements/")` → `/evenements/` ; `url()` → `/` (with the base prepended if one is set). */
export function url(path = ""): string {
  return `${BASE}/${path.replace(/^\/+/, "")}`;
}

/** Absolute URL (origin + base) for canonical / Open Graph tags. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  return new URL(url(path), site ?? SITE_ORIGIN).href;
}

/** Pathname without base and trailing slash, e.g. `/evenements/` → `/evenements`. */
export function stripBase(pathname: string): string {
  const rest = pathname.startsWith(BASE)
    ? pathname.slice(BASE.length)
    : pathname;
  const trimmed = rest.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}
