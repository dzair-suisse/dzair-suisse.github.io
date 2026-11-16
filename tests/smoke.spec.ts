import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import YAML from "yaml";

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
