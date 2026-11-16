/**
 * Sanity checks on the event files (hand-written and synced from Instagram).
 * Only generic rules: adding a valid event never breaks these tests.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import YAML from "yaml";
import { CATEGORIES } from "../../src/lib/categories";

interface RawEvent {
  id?: unknown;
  title?: unknown;
  date?: unknown;
  location?: unknown;
  campus?: unknown;
  category?: unknown;
  image?: unknown;
  alt?: unknown;
  en?: { title?: unknown; alt?: unknown };
}

const CONTENT = "src/content";
const FILES = ["events.yaml", "instagram-events.yaml"] as const;
const load = (file: string): RawEvent[] =>
  (YAML.parse(readFileSync(path.join(CONTENT, file), "utf8")) ??
    []) as RawEvent[];
const ALL = FILES.flatMap((file) =>
  load(file).map((event) => ({ file, event })),
);
const MAX_YEAR = new Date().getUTCFullYear() + 1;

describe("events", () => {
  it("are lists", () => {
    for (const file of FILES) expect(Array.isArray(load(file))).toBe(true);
    expect(load("events.yaml").length).toBeGreaterThan(0);
  });

  it("have unique ids across both files", () => {
    const ids = ALL.map(({ event }) => event.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  describe.each(
    ALL.map(
      ({ file, event }) =>
        [`${file} › ${String(event.id)}`, file, event] as const,
    ),
  )("%s", (_name, file, event) => {
    it("has an id, a title and a location", () => {
      expect(event.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(String(event.title ?? "").trim()).not.toBe("");
      expect(String(event.location ?? "").trim()).not.toBe("");
    });

    it("has a known campus and category", () => {
      expect(["EPFL", "UNIL", "Hors campus"]).toContain(event.campus);
      expect(CATEGORIES).toContain(event.category);
    });

    it("has a sane date", () => {
      const date =
        event.date instanceof Date ? event.date : new Date(String(event.date));
      expect(Number.isNaN(date.getTime())).toBe(false);
      expect(date.getUTCFullYear()).toBeGreaterThanOrEqual(2015);
      expect(date.getUTCFullYear()).toBeLessThanOrEqual(MAX_YEAR);
    });

    it("has an existing image", () => {
      expect(typeof event.image).toBe("string");
      const image = path.join(CONTENT, String(event.image));
      expect(existsSync(image), image).toBe(true);
    });

    it("has a descriptive alt text", () => {
      const alt = String(event.alt ?? "");
      expect(alt.length).toBeGreaterThanOrEqual(10);
      expect(alt.length).toBeLessThanOrEqual(400);
    });

    it("has a complete English version when present (required by hand)", () => {
      if (file === "events.yaml") expect(event.en).toBeDefined();
      if (event.en === undefined) return;
      expect(String(event.en.title ?? "").trim()).not.toBe("");
      const alt = String(event.en.alt ?? "");
      expect(alt.length).toBeGreaterThanOrEqual(10);
      expect(alt.length).toBeLessThanOrEqual(400);
    });
  });
});
