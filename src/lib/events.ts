import { getCollection, type CollectionEntry } from "astro:content";

export type EventEntry =
  CollectionEntry<"events"> | CollectionEntry<"instagramEvents">;

/**
 * All events (hand-written + synced from Instagram), newest first
 * (ties broken by title for a stable order).
 */
export async function getSortedEvents(): Promise<EventEntry[]> {
  const events: EventEntry[] = [
    ...(await getCollection("events")),
    ...(await getCollection("instagramEvents")),
  ];
  return events.sort(
    (a, b) =>
      b.data.date.getTime() - a.data.date.getTime() ||
      a.data.title.localeCompare(b.data.title, "fr"),
  );
}
