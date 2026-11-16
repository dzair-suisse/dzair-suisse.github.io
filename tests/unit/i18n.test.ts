import { describe, expect, it } from "vitest";
import {
  LANGS,
  isLang,
  langFromPath,
  localizedPath,
  otherLang,
} from "../../src/i18n/routes";
import { ui, useTranslations } from "../../src/i18n/ui";
import { getLangFromUrl, localizeEvent } from "../../src/i18n/utils";
import type { EventEntry } from "../../src/lib/events";

/** Dotted paths of every leaf of a dictionary (functions count as leaves). */
function keys(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([k, v]) =>
    keys(v, prefix ? `${prefix}.${k}` : k),
  );
}

function leaves(value: unknown): unknown[] {
  if (value === null || typeof value !== "object") return [value];
  return Object.values(value).flatMap(leaves);
}

describe("dictionary", () => {
  it("has the same keys in every language", () => {
    const fr = keys(ui.fr).sort();
    for (const lang of LANGS) expect(keys(ui[lang]).sort()).toEqual(fr);
  });

  it("has no empty string and the same kind of value per key", () => {
    for (const lang of LANGS) {
      for (const leaf of leaves(ui[lang])) {
        if (typeof leaf === "string") expect(leaf.trim()).not.toBe("");
        else expect(typeof leaf).toBe("function");
      }
    }
  });

  it("formats counts and labels", () => {
    expect(ui.fr.events.count(1)).toBe("1 événement");
    expect(ui.fr.events.count(2)).toBe("2 événements");
    expect(ui.en.events.count(1)).toBe("1 event");
    expect(ui.en.events.count(0)).toBe("0 events");
    expect(ui.en.footer.email("a@b.ch")).toBe("Email a@b.ch");
    expect(useTranslations("en")).toBe(ui.en);
  });
});

describe("routes", () => {
  it("recognises languages", () => {
    expect(isLang("fr")).toBe(true);
    expect(isLang("en")).toBe(true);
    expect(isLang("de")).toBe(false);
    expect(otherLang("fr")).toBe("en");
    expect(otherLang("en")).toBe("fr");
  });

  it.each([
    ["/", "fr"],
    ["/evenements/", "fr"],
    ["/en/", "en"],
    ["/en/events/", "en"],
    ["en", "en"],
    ["/fr/", "fr"],
    ["/english/", "fr"],
    ["/en?x=1", "en"],
  ] as const)("langFromPath(%s) = %s", (path, lang) => {
    expect(langFromPath(path)).toBe(lang);
  });

  it.each([
    ["", "en", "en/"],
    ["/", "fr", ""],
    ["evenements/", "en", "en/events/"],
    ["/en/events/", "fr", "evenements/"],
    ["evenements/?categorie=x", "en", "en/events/?categorie=x"],
    ["/en/#contact", "fr", "#contact"],
    ["/#contact", "en", "en/#contact"],
    ["/en/events", "en", "en/events/"],
    ["sitemap-index.xml", "en", "en/sitemap-index.xml"],
  ] as const)("localizedPath(%s, %s) = %s", (path, lang, expected) => {
    expect(localizedPath(path, lang)).toBe(expected);
  });

  it("round-trips every localized page", () => {
    for (const path of ["", "evenements/"]) {
      expect(localizedPath(localizedPath(path, "en"), "fr")).toBe(path);
    }
  });

  it("reads the language of a URL", () => {
    expect(getLangFromUrl(new URL("https://x.ch/en/events/"))).toBe("en");
    expect(getLangFromUrl(new URL("https://x.ch/evenements/"))).toBe("fr");
  });
});

describe("localizeEvent", () => {
  const event = (en?: object) =>
    ({
      data: {
        title: "Randonnée",
        location: "Berne",
        alt: "Une photo de groupe",
        en,
      },
    }) as unknown as EventEntry;

  it("uses the English version when present", () => {
    expect(
      localizeEvent(event({ title: "Hike", alt: "A group photo" }), "en"),
    ).toEqual({ title: "Hike", location: "Berne", alt: "A group photo" });
    expect(
      localizeEvent(
        event({ title: "Hike", alt: "A group photo", location: "Bern" }),
        "en",
      ).location,
    ).toBe("Bern");
  });

  it("falls back to French", () => {
    expect(localizeEvent(event(), "en").title).toBe("Randonnée");
    expect(localizeEvent(event({ title: "Hike", alt: "x" }), "fr")).toEqual({
      title: "Randonnée",
      location: "Berne",
      alt: "Une photo de groupe",
    });
  });
});
