/**
 * Pure helpers of the Instagram sync (scripts/sync-instagram.ts), kept in a
 * module without side effects so they can be unit-tested.
 */
import { readFile, writeFile } from "node:fs/promises";
import YAML from "yaml";
import type { CATEGORIES } from "../../src/lib/categories.ts";

export interface IgChild {
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
}

export interface IgPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  children?: { data: IgChild[] };
}

export interface EventRecord {
  id: string;
  title: string;
  date: string;
  location: string;
  campus: "EPFL" | "UNIL" | "Hors campus";
  category: (typeof CATEGORIES)[number];
  image: string;
  fit: "contain" | "cover";
  alt: string;
  /** English version, shown on the English site. */
  en: { title: string; alt: string };
  permalink: string;
}

/** URL of the image to analyse: first slide of a carousel, thumbnail of a video. */
export function imageUrlOf(post: IgPost): string | undefined {
  if (post.media_type === "CAROUSEL_ALBUM") {
    const first = post.children?.data[0];
    return first?.media_type === "VIDEO"
      ? first.thumbnail_url
      : first?.media_url;
  }
  return post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Normalise to the first day of the month (only month + year are shown). */
export function monthDate(raw: string, fallback: string): string {
  const m = /^(\d{4})-(\d{2})/.exec(raw) ?? /^(\d{4})-(\d{2})/.exec(fallback);
  return m ? `${m[1]}-${m[2]}-01` : fallback.slice(0, 7) + "-01";
}

export async function readYamlList<T>(file: string): Promise<T[]> {
  try {
    const parsed: unknown = YAML.parse(await readFile(file, "utf8"));
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

/**
 * Appends new entries to `file` without re-serialising existing ones, so
 * manual edits (and comments) in the YAML file are preserved byte for byte.
 */
export async function appendEvents(
  file: string,
  records: EventRecord[],
): Promise<void> {
  if (records.length === 0) return;
  const current = await readFile(file, "utf8").catch(() => "");
  const block = YAML.stringify(records, { lineWidth: 0 });
  const isEmptyList = (await readYamlList(file)).length === 0;
  const next = isEmptyList
    ? current.replace(/^\[\]\s*$/m, "").trimEnd() + "\n\n" + block
    : current.trimEnd() + "\n\n" + block;
  await writeFile(file, next.trimStart());
}
