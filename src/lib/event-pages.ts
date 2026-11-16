import type { Lang } from "../i18n/routes";
import { getSortedEvents, type EventEntry } from "./events";

export interface EventPageProps {
  lang: Lang;
  event: EventEntry;
  /** Neighbours in the newest-first list (undefined at either end). */
  newer: EventEntry | undefined;
  older: EventEntry | undefined;
}

/** `getStaticPaths` of the event pages, one per event and language. */
export async function eventPageProps(
  lang: Lang,
): Promise<{ params: { id: string }; props: EventPageProps }[]> {
  const events = await getSortedEvents();
  return events.map((event, i) => ({
    params: { id: event.id },
    props: { lang, event, newer: events[i - 1], older: events[i + 1] },
  }));
}
