import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const BASE = "/dzair_epfl/";

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
      page.getByRole("heading", { name: "Qui sommes-nous ?" }),
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
    await page.getByRole("button", { name: "Mode sombre" }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
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

    await expect(page).toHaveURL(/\/dzair_epfl\/evenements\/?$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Nos événements" }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: /accueil/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/dzair_epfl\/?$/);
    expect(errors).toEqual([]);
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
  test("liste les 12 événements, groupés par catégorie", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto(`${BASE}evenements/`);
    await expect(page.locator("#events-list article")).toHaveCount(12);
    await expect(page.getByRole("heading", { level: 2 })).toHaveText([
      "Événements EPFL / UNIL",
      "Networking & Partages",
      "Célébrations & Sorties",
    ]);
    // Images are served as AVIF/WebP.
    const sources = page.locator(
      "#events-list picture source[type='image/avif']",
    );
    await expect(sources).toHaveCount(12);
    expect(errors).toEqual([]);
  });

  test("le filtre par catégorie fonctionne", async ({ page }) => {
    await page.goto(`${BASE}evenements/`);
    const visibleCards = page.locator("#events-list article:visible");
    await expect(visibleCards).toHaveCount(12);

    await page.getByRole("radio", { name: /Networking/ }).check();
    await expect(visibleCards).toHaveCount(4);
    await expect(page).toHaveURL(/categorie=networking/);
    await expect(page.getByRole("status")).toHaveText("4 événements affichés");

    await page.getByRole("radio", { name: /Tous/ }).check();
    await expect(visibleCards).toHaveCount(12);
  });

  test("le filtre fonctionne sans JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${BASE}evenements/`);
    const visibleCards = page.locator("#events-list article:visible");
    await expect(visibleCards).toHaveCount(12);
    await page.locator("label.chip", { hasText: "Célébrations" }).click();
    await expect(visibleCards).toHaveCount(4);
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
