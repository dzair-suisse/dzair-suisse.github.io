import { getCollection, type CollectionEntry } from "astro:content";

export type EventEntry = CollectionEntry<"events">;

/** All events, newest first (ties broken by title for a stable order). */
export async function getSortedEvents(): Promise<EventEntry[]> {
  const events = await getCollection("events");
  return events.sort(
    (a, b) =>
      b.data.date.getTime() - a.data.date.getTime() ||
      a.data.title.localeCompare(b.data.title, "fr"),
  );
}
