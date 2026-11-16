import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import YAML from "yaml";
import { SITE_ORIGIN } from "../../src/lib/origin";

const BASE = "/";

/** Event counts read from the content files, so adding an event never breaks the tests. */
const EVENTS = [
  "src/content/events.yaml",
  "src/content/instagram-events.yaml",
].flatMap(
  (f) => (YAML.parse(readFileSync(f, "utf8")) ?? []) as { category: string }[],
);
const TOTAL = EVENTS.length;
const COUNT = {
  networking: EVENTS.filter((e) => e.category === "networking").length,
  celebrations: EVENTS.filter((e) => e.category === "celebrations").length,
};

/** Collects console errors and uncaught exceptions for the current page. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

async function expectNoSeriousA11yViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22aa",
      "best-practice",
    ])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    serious.map(
      (v) =>
        `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
    ),
  ).toEqual([]);
}

test.describe("Accueil", () => {
  test("se charge avec le bon contenu et sans erreur", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto(BASE);

    await expect(page).toHaveTitle(/DZAÏR/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Étudiants algériens en Suisse",
    );
    await expect(
      page.getByRole("heading", { name: /Qui sommes-nous/ }),
    ).toBeVisible();
    await expect(page.locator("#evenements article")).toHaveCount(3);
    await expect(
      page.getByRole("link", { name: /Rejoins-nous/ }).first(),
    ).toHaveAttribute("href", /docs\.google\.com\/forms/);
    expect(errors).toEqual([]);
  });

  test("n'a pas de violation d'accessibilité grave", async ({ page }) => {
    await page.goto(BASE);
    await expectNoSeriousA11yViolations(page);
  });

  test("le bouton de thème bascule et persiste", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(BASE);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");
    const toggle = page.getByRole("button", { name: "Mode sombre" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  test("le bouton de thème suit le thème du système", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(BASE);
    const toggle = page.getByRole("button", { name: "Mode sombre" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("Navigation", () => {
  test("mène de l'accueil à la page événements et retour", async ({
    page,
    isMobile,
  }) => {
    const errors = trackErrors(page);
    await page.goto(BASE);

    if (isMobile) {
      await page.getByRole("button", { name: "Ouvrir le menu" }).click();
      await page
        .getByRole("navigation", { name: "Navigation mobile" })
        .getByRole("link", { name: "Événements" })
        .click();
    } else {
      await page
        .getByRole("navigation", { name: "Navigation principale" })
        .getByRole("link", { name: "Événements" })
        .click();
    }

    await expect(page).toHaveURL(/\/evenements\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Nos événements" }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: /accueil/i })
      .first()
      .click();
    await expect(page).toHaveURL(/:\d+\/$/);
    expect(errors).toEqual([]);
  });

  test("parcours complet après une navigation côté client", async ({
    page,
    isMobile,
  }) => {
    const errors = trackErrors(page);
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(BASE);
    // Marker that only survives a client-side (ClientRouter) navigation.
    await page.evaluate(() => {
      (window as unknown as { __spa: boolean }).__spa = true;
    });

    if (isMobile) {
      await page.getByRole("button", { name: "Ouvrir le menu" }).click();
      await page
        .getByRole("dialog", { name: "Menu" })
        .getByRole("link", { name: "Événements" })
        .click();
    } else {
      await page
        .getByRole("banner")
        .getByRole("link", { name: "Événements" })
        .click();
    }
    await expect(
      page.getByRole("heading", { level: 1, name: "Nos événements" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => (window as unknown as { __spa?: boolean }).__spa,
      ),
    ).toBe(true);

    // Filter (scripts re-bound after the swap).
    const visibleCards = page.locator("#events-list article:visible");
    await expect(visibleCards).toHaveCount(TOTAL);
    await page.getByRole("radio", { name: /Célébrations/ }).check();
    await expect(visibleCards).toHaveCount(COUNT.celebrations);
    await expect(page).toHaveURL(/categorie=celebrations/);
    await expect(page.getByRole("status")).toHaveText(
      `${COUNT.celebrations} événements affichés`,
    );

    // Lightbox opens and closes.
    await visibleCards.first().locator("a[data-lightbox]").click();
    const dialog = page.locator("dialog#lightbox");
    await expect(dialog).toBeVisible();
    await page.getByRole("button", { name: "Fermer", exact: true }).click();
    await expect(dialog).toBeHidden();

    // Theme toggle.
    const toggle = page.getByRole("button", { name: "Mode sombre" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(errors).toEqual([]);
  });

  test("le menu mobile est modal et rend le focus", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Menu mobile uniquement");
    await page.goto(BASE);
    const button = page.getByRole("button", { name: "Ouvrir le menu" });
    await button.click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();

    // Tab cycles inside the dialog (the page behind is inert).
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(
        () => !!document.activeElement?.closest("#mobile-menu"),
      );
      if (
        await page.evaluate(
          () =>
            document.activeElement === document.body || !document.activeElement,
        )
      )
        continue; // focus briefly left for the (absent) browser UI
      expect(inside).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();

    // A same-page link closes the menu.
    await button.click();
    await menu.getByRole("link", { name: "Nous contacter" }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#contact$/);
  });

  test("affiche une page 404 en français", async ({ page }) => {
    const response = await page.goto(`${BASE}page-inexistante`);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Page introuvable",
    );
  });
});

test.describe("Événements", () => {
  test("liste tous les événements, groupés par catégorie", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto(`${BASE}evenements/`);
    await expect(page.locator("#events-list article")).toHaveCount(TOTAL);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText([
      "Événements EPFL / UNIL",
      "Networking & Partages",
      "Célébrations & Sorties",
    ]);
    // Images are served as AVIF/WebP.
    const sources = page.locator(
      "#events-list picture source[type='image/avif']",
    );
    await expect(sources).toHaveCount(TOTAL);
    expect(errors).toEqual([]);
  });

  test("le filtre par catégorie fonctionne", async ({ page }) => {
    await page.goto(`${BASE}evenements/`);
    const visibleCards = page.locator("#events-list article:visible");
    await expect(visibleCards).toHaveCount(TOTAL);

    await page.getByRole("radio", { name: /Networking/ }).check();
    await expect(visibleCards).toHaveCount(COUNT.networking);
    await expect(page).toHaveURL(/categorie=networking/);
    await expect(page.getByRole("status")).toHaveText(
      `${COUNT.networking} événements affichés`,
    );

    await page.getByRole("radio", { name: /Tous/ }).check();
    await expect(visibleCards).toHaveCount(TOTAL);
  });

  test("le filtre fonctionne sans JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${BASE}evenements/`);
    const visibleCards = page.locator("#events-list article:visible");
    await expect(visibleCards).toHaveCount(TOTAL);
    await page.locator("label.chip", { hasText: "Célébrations" }).click();
    await expect(visibleCards).toHaveCount(COUNT.celebrations);
    await context.close();
  });

  test("la lightbox s'ouvre, se ferme avec Échap et rend le focus", async ({
    page,
  }) => {
    const errors = trackErrors(page);
    await page.goto(`${BASE}evenements/`);
    const trigger = page.locator("a[data-lightbox]").first();
    await trigger.click();

    const dialog = page.locator("dialog#lightbox");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img")).toHaveAttribute("src", /\.webp$/);
    await expect(dialog.locator("figcaption")).not.toBeEmpty();

    await page.keyboard.press("ArrowRight");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator("a[data-lightbox]:focus")).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test("n'a pas de violation d'accessibilité grave", async ({ page }) => {
    await page.goto(`${BASE}evenements/`);
    await expectNoSeriousA11yViolations(page);
  });
});

test.describe("Mode sombre", () => {
  for (const path of ["", "evenements/"]) {
    test(`pas de violation d'accessibilité grave sur /${path}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto(`${BASE}${path}`);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expectNoSeriousA11yViolations(page);
    });
  }
});

/** Clicks a language in the header switcher (in the menu on phones). */
async function switchLanguage(
  page: Page,
  isMobile: boolean,
  name: "English" | "Français",
  // Links read « EN (English) » / « FR (Français) ».
): Promise<void> {
  if (isMobile) {
    await page
      .getByRole("button", { name: /Ouvrir le menu|Open menu/ })
      .click();
    await page
      .getByRole("dialog", { name: "Menu" })
      .getByRole("group", { name: "Langue / Language" })
      .getByRole("link", { name: new RegExp(name) })
      .click();
  } else {
    await page
      .getByRole("banner")
      .getByRole("group", { name: "Langue / Language" })
      .getByRole("link", { name: new RegExp(name) })
      .click();
  }
}

test.describe("Version anglaise", () => {
  const PAGES = [
    { path: "en/", h1: "Algerian students in Switzerland", fr: "" },
    { path: "en/events/", h1: "Our events", fr: "evenements/" },
  ];

  for (const { path, h1, fr } of PAGES) {
    test(`/${path} se charge en anglais, sans erreur`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto(`${BASE}${path}`);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
      await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
        "href",
        `${SITE_ORIGIN}/${path}`,
      );
      for (const [lang, target] of [
        ["fr", fr],
        ["en", path],
        ["x-default", fr],
      ] as const) {
        await expect(
          page.locator(`link[rel=alternate][hreflang="${lang}"]`),
        ).toHaveAttribute("href", `${SITE_ORIGIN}/${target}`);
      }
      await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
        "content",
        "en_GB",
      );
      expect(errors).toEqual([]);
    });

    test(`pas de violation d'accessibilité grave sur /${path} (clair et sombre)`, async ({
      page,
    }) => {
      for (const scheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(`${BASE}${path}`);
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          scheme,
        );
        await expectNoSeriousA11yViolations(page);
      }
    });
  }

  test("les pages françaises annoncent leur version anglaise", async ({
    page,
  }) => {
    await page.goto(`${BASE}evenements/`);
    await expect(
      page.locator('link[rel=alternate][hreflang="en"]'),
    ).toHaveAttribute("href", `${SITE_ORIGIN}/en/events/`);
    await expect(
      page.locator('link[rel=alternate][hreflang="fr"]'),
    ).toHaveAttribute("href", `${SITE_ORIGIN}/evenements/`);
  });

  test("les événements sont traduits, filtre et annonce compris", async ({
    page,
  }) => {
    await page.goto(`${BASE}en/events/`);
    await expect(page.locator("#events-list article")).toHaveCount(TOTAL);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText([
      "EPFL / UNIL events",
      "Networking & meet-ups",
      "Celebrations & outings",
    ]);
    await expect(
      page.getByRole("heading", { name: "Hike to Lac de Taney" }),
    ).toBeVisible();
    await expect(page.getByText("May 2026").first()).toBeVisible();
    await page.getByRole("radio", { name: /Networking/ }).check();
    await expect(page.getByRole("status")).toHaveText(
      `${COUNT.networking} events shown`,
    );
  });

  test("le sélecteur de langue bascule l'accueil FR → EN → FR", async ({
    page,
    isMobile,
  }) => {
    const errors = trackErrors(page);
    await page.goto(BASE);
    await switchLanguage(page, isMobile, "English");
    await expect(page).toHaveURL(/:\d+\/en\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await switchLanguage(page, isMobile, "Français");
    await expect(page).toHaveURL(/:\d+\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    expect(errors).toEqual([]);
  });

  test("le sélecteur garde ?categorie= sur la page événements", async ({
    page,
    isMobile,
  }) => {
    const errors = trackErrors(page);
    await page.goto(`${BASE}evenements/?categorie=networking`);
    const visibleCards = page.locator("#events-list article:visible");
    await expect(visibleCards).toHaveCount(COUNT.networking);

    await switchLanguage(page, isMobile, "English");
    await expect(page).toHaveURL(/\/en\/events\/\?categorie=networking$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(visibleCards).toHaveCount(COUNT.networking);

    // A filter chosen after the page loaded is carried over too.
    await page.getByRole("radio", { name: /Celebrations/ }).check();
    await switchLanguage(page, isMobile, "Français");
    await expect(page).toHaveURL(/\/evenements\/\?categorie=celebrations$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(visibleCards).toHaveCount(COUNT.celebrations);
    expect(errors).toEqual([]);
  });

  test("le sélecteur suit les navigations côté client", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Navigation de bureau");
    await page.goto(`${BASE}en/`);
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Events" })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Our events" }),
    ).toBeVisible();
    await switchLanguage(page, isMobile, "Français");
    await expect(page).toHaveURL(/\/evenements\/$/);
  });

  test("la langue choisie est mémorisée sur l'accueil", async ({
    page,
    isMobile,
  }) => {
    await page.goto(`${BASE}en/`);
    await switchLanguage(page, isMobile, "English");
    await expect(page).toHaveURL(/\/en\/$/);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("lang")))
      .toBe("en");

    // French home → English home (query and hash kept).
    await page.goto(`${BASE}?x=1#contact`);
    await expect(page).toHaveURL(/\/en\/\?x=1#contact$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    // Other French pages are never redirected.
    await page.goto(`${BASE}evenements/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");

    // Choosing French again cancels the redirect.
    await switchLanguage(page, isMobile, "Français");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await page.goto(BASE);
    await expect(page).toHaveURL(/:\d+\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("un navigateur anglophone voit un bandeau, sans redirection", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "en-GB" });
    const page = await context.newPage();
    await page.goto(BASE);
    await expect(page).toHaveURL(/:\d+\/$/);
    const banner = page.locator("aside[data-lang-banner]");
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute("lang", "en");
    await page.getByRole("button", { name: "Dismiss this message" }).click();
    await expect(banner).toBeHidden();
    await page.reload();
    await expect(banner).toBeHidden();
    await context.close();
  });

  test("un navigateur francophone voit le bandeau sur les pages anglaises", async ({
    page,
  }) => {
    await page.goto(`${BASE}en/events/?categorie=networking`);
    const banner = page.locator("aside[data-lang-banner]");
    await expect(banner).toBeVisible();
    await banner.getByRole("link", { name: "Afficher en français" }).click();
    await expect(page).toHaveURL(/\/evenements\/\?categorie=networking$/);
    // A choice was made: no more banner.
    await expect(page.locator("aside[data-lang-banner]")).toBeHidden();
  });
});
