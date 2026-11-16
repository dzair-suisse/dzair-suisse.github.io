import { describe, expect, it } from "vitest";
import { CATEGORIES } from "../../src/lib/categories";
import { SITE, formatMonth, isoMonth, titleHtml } from "../../src/lib/site";
import { absoluteUrl, stripBase, url } from "../../src/lib/url";

describe("formatMonth", () => {
  it("formats in French with a capital letter", () => {
    expect(formatMonth(new Date("2025-11-01"))).toBe("Novembre 2025");
    expect(formatMonth(new Date("2026-02-01"), "fr")).toBe("Février 2026");
  });

  it("formats in English", () => {
    expect(formatMonth(new Date("2026-05-01"), "en")).toBe("May 2026");
  });

  it("uses UTC (no shift to the previous month)", () => {
    expect(formatMonth(new Date("2025-09-01T00:00:00Z"), "en")).toBe(
      "September 2025",
    );
    expect(isoMonth(new Date("2025-09-01T00:00:00Z"))).toBe("2025-09");
  });
});

describe("titleHtml", () => {
  it("sets French ordinals in superscript", () => {
    expect(titleHtml("Célébration du 1er novembre")).toBe(
      "Célébration du 1<sup>er</sup> novembre",
    );
    expect(titleHtml("La 1re édition")).toBe("La 1<sup>re</sup> édition");
  });

  it("leaves other numbers alone", () => {
    expect(titleHtml("11er 21re 1erx 2025")).toBe("11er 21re 1erx 2025");
  });

  it("escapes HTML", () => {
    expect(titleHtml(`<b>"A" & 'B'</b>`)).toBe(
      "&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;",
    );
  });
});

describe("url helpers", () => {
  it("builds internal URLs", () => {
    expect(url()).toBe("/");
    expect(url("evenements/")).toBe("/evenements/");
    expect(url("//en/")).toBe("/en/");
  });

  it("builds absolute URLs", () => {
    expect(absoluteUrl("en/", undefined)).toBe(
      "https://dzair-suisse.github.io/en/",
    );
    expect(absoluteUrl("x/", new URL("https://example.org"))).toBe(
      "https://example.org/x/",
    );
  });

  it("strips the base and trailing slash", () => {
    expect(stripBase("/")).toBe("/");
    expect(stripBase("/evenements/")).toBe("/evenements");
    expect(stripBase("/en/events")).toBe("/en/events");
  });
});

describe("constants", () => {
  it("has unique categories and valid site links", () => {
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length);
    for (const link of [SITE.instagram, SITE.joinForm, SITE.epfl, SITE.unil])
      expect(new URL(link).protocol).toBe("https:");
    expect(SITE.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/);
  });
});
