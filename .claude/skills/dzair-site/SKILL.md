---
name: dzair-site
description: House rules for the DZAÏR association website (Astro, dzair-suisse/dzair-suisse.github.io). Use for ANY change to this repo — content, events, Instagram sync, design, i18n (FR/EN), CI, deploy, commits or PRs — so the user never has to repeat these rules.
---

# DZAÏR website — rules

## Talking to the user

- Answer in the user's language (usually French). Keep it short.
- **Save tokens.** No subagent swarms, no "cloud" agents, no extra reviews unless the user asks for them. Work locally and directly. Earlier cloud and background agents stalled for 40+ minutes and the work was lost.
- When done, give the live link: https://dzair-suisse.github.io (EN: /en/).

## Git

- Conventional Commits in English: `feat(scope): …`, `fix(scope): …`, `docs(scope): …`, `ci(…)`, `chore(…)`, `test(…)`. commitlint enforces this on commits **and on the PR title**.
- **Never** add a `Co-Authored-By` / Claude trailer or "Generated with Claude" lines.
- Work on a branch, open a PR, squash-merge once CI is green. Never force-push `main`.
- Never commit the Instagram export ZIP or any secret (both are in `.gitignore`; tokens live in GitHub secrets). The repo is public, and it must stay public for free GitHub Pages.

## Stack and constraints

- Astro **7.3.x pinned** (`~7.3.8`). Astro 7.4+ needs Node ≥ 22.23.4, and the local Node is 22.18. Do not bump it.
- TypeScript stays at 6.x because `@astrojs/check` rejects 7.x.
- Tailwind 4 (`@tailwindcss/vite`), sharp, Playwright + axe, Vitest, Prettier.
- Free hosting only (GitHub Pages, free domains/services). The user cannot pay.
- Brand green `#0B4D3A` (`--brand-green`). Keep light and dark mode working.

## Content

- Events live in `src/content/events.yaml` and `instagram-events.yaml` (the latter is written by `scripts/sync-instagram.ts` via `.github/workflows/sync-instagram.yml`). The source is the Instagram account `dzair_suisse`.
- Never invent facts (dates, places, titles). Keep French typography: non-breaking space inside « … », "DZAÏR" with a diaeresis.
- Every visible string exists in **both FR and EN** (`src/i18n/ui.ts`, `routes.ts`). Pages under `src/pages/en/` mirror the French ones.
- Alt texts are descriptive, in the page's language.

## Before pushing (all must pass)

```
npm run lint && npm run check && npm run test:unit && npm run build && npm run test:e2e
```

(`npm run ci` runs the same chain.) Don't count events in tests by hand; tests read the content files.

## CI (in place)

Lint + commitlint, `astro check`, Vitest, `npm audit`, build + html-validate + lychee (internal links), Playwright + axe on Chromium, Android, Firefox, WebKit and iPhone (CI only; locally Chromium with 4 workers max, so the laptop stays usable), Lighthouse, and a daily `health.yml` check of the live site. Never run Firefox/WebKit or many browsers locally.

## Domain

Free address `https://dzair-suisse.github.io`, set only in `src/lib/origin.ts`. Moving to `dzair-suisse.ch` (paid, once the association buys it): follow « Nom de domaine » in the README.

## Pending

- PR #10 (draft): sober design proposal (key figures, photo ribbon, discreet zellige). Do not merge until the user approves. Keep the site professional and restrained.
- Manual: GitHub → Settings → Branches → block force-pushes on `main` (do not require PRs: the Instagram sync pushes to `main`).
