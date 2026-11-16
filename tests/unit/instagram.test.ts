import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import YAML from "yaml";
import {
  appendEvents,
  imageUrlOf,
  monthDate,
  readYamlList,
  slugify,
  type EventRecord,
  type IgPost,
} from "../../scripts/lib/instagram";

describe("slugify", () => {
  it("removes accents, punctuation and case", () => {
    expect(slugify("Célébration du 1er Novembre !")).toBe(
      "celebration-du-1er-novembre",
    );
    expect(slugify("  Ftour « Ramadan » 2025 ")).toBe("ftour-ramadan-2025");
    expect(slugify("DZAÏR × Turcopoly")).toBe("dzair-turcopoly");
  });

  it("returns an empty string for symbols only and caps the length", () => {
    expect(slugify("🎉 !!")).toBe("");
    expect(slugify("a".repeat(100))).toHaveLength(60);
  });
});

describe("monthDate", () => {
  it("normalises to the first day of the month", () => {
    expect(monthDate("2025-11-23", "2026-01-01T10:00:00+0000")).toBe(
      "2025-11-01",
    );
    expect(monthDate("2025-11", "2026-01-01")).toBe("2025-11-01");
  });

  it("falls back to the post date", () => {
    expect(monthDate("inconnue", "2026-03-14T18:00:00+0000")).toBe(
      "2026-03-01",
    );
    expect(monthDate("", "2024-12-31")).toBe("2024-12-01");
  });
});

describe("imageUrlOf", () => {
  const post = (p: Partial<IgPost>): IgPost => ({
    id: "1",
    media_type: "IMAGE",
    permalink: "https://www.instagram.com/p/x/",
    timestamp: "2026-01-01T00:00:00+0000",
    ...p,
  });

  it("uses the image, or the thumbnail of a video", () => {
    expect(imageUrlOf(post({ media_url: "img" }))).toBe("img");
    expect(
      imageUrlOf(
        post({ media_type: "VIDEO", media_url: "mp4", thumbnail_url: "jpg" }),
      ),
    ).toBe("jpg");
  });

  it("uses the first slide of a carousel", () => {
    expect(
      imageUrlOf(
        post({
          media_type: "CAROUSEL_ALBUM",
          children: {
            data: [
              { media_type: "IMAGE", media_url: "a" },
              { media_type: "IMAGE", media_url: "b" },
            ],
          },
        }),
      ),
    ).toBe("a");
    expect(
      imageUrlOf(
        post({
          media_type: "CAROUSEL_ALBUM",
          children: {
            data: [{ media_type: "VIDEO", media_url: "v", thumbnail_url: "t" }],
          },
        }),
      ),
    ).toBe("t");
    expect(imageUrlOf(post({ media_type: "CAROUSEL_ALBUM" }))).toBeUndefined();
  });
});

describe("appendEvents", () => {
  let dir: string;
  let file: string;
  const record = (id: string): EventRecord => ({
    id,
    title: `Événement ${id}`,
    date: "2026-01-01",
    location: "EPFL",
    campus: "EPFL",
    category: "networking",
    image: `../assets/events/instagram/${id}.jpg`,
    fit: "cover",
    alt: "Une photo de groupe devant le Rolex Learning Center.",
    en: { title: `Event ${id}`, alt: "A group photo." },
    permalink: `https://www.instagram.com/p/${id}/`,
  });

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "dzair-"));
    file = path.join(dir, "events.yaml");
  });
  afterEach(() => rm(dir, { recursive: true, force: true }));

  it("replaces an empty list and keeps the header comments", async () => {
    await writeFile(file, "# En-tête\n# deuxième ligne\n[]\n");
    await appendEvents(file, [record("a"), record("b")]);
    const text = await readFile(file, "utf8");
    expect(text.startsWith("# En-tête\n# deuxième ligne\n")).toBe(true);
    expect(text).not.toContain("[]");
    expect((await readYamlList<EventRecord>(file)).map((e) => e.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("appends without rewriting existing entries", async () => {
    const existing =
      "# Commentaire\n- id: old\n  title: Édité   à la main # gardé\n";
    await writeFile(file, existing);
    await appendEvents(file, [record("new")]);
    const text = await readFile(file, "utf8");
    expect(text.startsWith(existing.trimEnd())).toBe(true);
    const list = YAML.parse(text) as EventRecord[];
    expect(list.map((e) => e.id)).toEqual(["old", "new"]);
    expect(list[1]).toEqual(record("new"));
  });

  it("creates the file if needed and does nothing without records", async () => {
    await appendEvents(file, []);
    expect(await readYamlList(file)).toEqual([]);
    await appendEvents(file, [record("x")]);
    expect((await readYamlList<EventRecord>(file))[0]?.id).toBe("x");
  });
});
