import type { EventEntry } from "../lib/events";
import { stripBase } from "../lib/url";
import { langFromPath, type Lang } from "./routes";

export {
  DEFAULT_LANG,
  LANGS,
  localizedPath,
  otherLang,
  type Lang,
} from "./routes";
export { useTranslations } from "./ui";

/** Language of the current page (`Astro.url`). */
export function getLangFromUrl(url: URL): Lang {
  return langFromPath(stripBase(url.pathname));
}

/** Displayed texts of an event, falling back to French when no translation exists. */
export function localizeEvent(
  event: EventEntry,
  lang: Lang,
): { title: string; location: string; alt: string | undefined } {
  const { title, location, alt, en } = event.data;
  if (lang === "en" && en) {
    return { title: en.title, location: en.location ?? location, alt: en.alt };
  }
  return { title, location, alt };
}
