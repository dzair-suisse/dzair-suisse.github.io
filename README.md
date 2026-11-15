# DZAÏR – Étudiants algériens en Suisse

Site de **DZAÏR**, l’association des étudiants algériens en Suisse (EPFL / UNIL).
En ligne : <https://adessrrrr.github.io/dzair_epfl/>

## Stack

- [Astro](https://astro.build) 7 (site statique, TypeScript strict, View Transitions)
- [Tailwind CSS](https://tailwindcss.com) 4 via `@tailwindcss/vite` (configuration CSS-first dans `src/styles/global.css`)
- `astro:assets` pour les images (AVIF + WebP, tailles responsives, lazy loading)
- Polices auto-hébergées via Fontsource : Montserrat Variable + Fraunces Variable
- `@astrojs/sitemap`, Open Graph / Twitter, JSON-LD `Organization`
- Tests : Playwright + `@axe-core/playwright` ; formatage : Prettier

## Prérequis

Node.js 22 (voir `.nvmrc`, ≥ 22.12) et npm.

> **Version d’Astro épinglée :** `package.json` fixe `"astro": "~7.3.8"` (correctifs 7.3.x uniquement).
> Astro 7.4 et plus récents exigent Node.js ≥ 22.23.4 ; ne lever cet épinglage qu’après avoir mis à jour
> Node en local (et `.nvmrc`, lu par la CI).

## Commandes

| Commande               | Action                                                         |
| ---------------------- | -------------------------------------------------------------- |
| `npm ci`               | Installe les dépendances                                       |
| `npm run dev`          | Serveur de développement : <http://localhost:4321/dzair_epfl/> |
| `npm run build`        | Génère le site dans `dist/`                                    |
| `npm run preview`      | Sert le build localement                                       |
| `npm run check`        | Vérification TypeScript / Astro (`astro check`)                |
| `npm run format`       | Formate le code (Prettier)                                     |
| `npm run format:check` | Vérifie le formatage                                           |
| `npm test`             | Tests Playwright (lancer `npm run build` avant)                |

Première utilisation des tests : `npx playwright install chromium`.

## Structure

```
public/                 favicons, image Open Graph, manifest, redirection evenements.html
scripts/                generate-icons.mjs (régénère favicons + og-image)
src/assets/             logos et photos des événements (optimisés au build)
src/components/         Header, Footer, EventCard, Lightbox, SEO, Icon, ThemeToggle
src/content/events.yaml données des événements
src/content.config.ts   schéma (zod) de la collection « events »
src/layouts/            BaseLayout
src/lib/                helpers (URL avec base, catégories, formats de date…)
src/pages/              index, evenements, 404
src/styles/global.css   thème Tailwind + tokens de couleur (OKLCH)
tests/                  tests Playwright
```

## Ajouter un événement

1. Déposer la photo dans `src/assets/events/` (JPEG/PNG, nom en minuscules avec tirets).
2. Ajouter un bloc dans `src/content/events.yaml` :

   ```yaml
   - id: mon-evenement-2026 # identifiant unique
     title: Mon événement 2026
     date: 2026-03-01 # premier jour du mois (seuls mois et année sont affichés)
     location: EPFL # texte affiché
     campus: EPFL # EPFL | UNIL | Hors campus
     category: celebrations # epfl-unil | networking | celebrations
     image: ../assets/events/mon-evenement-2026.jpeg
     alt: Description de la photo en français.
   ```

3. `npm run check && npm run build` : le schéma refuse toute donnée invalide.
   Les événements sont triés du plus récent au plus ancien ; les trois plus récents apparaissent sur l’accueil.

## Liens internes

Le site est servi sous `/dzair_epfl/`. Pour tout lien interne ou fichier de `public/`, utiliser
`url()` de `src/lib/url.ts` (par ex. `url("evenements/")`), jamais un chemin commençant par `/`.

## Déploiement

Le workflow `.github/workflows/deploy.yml` vérifie le formatage, lance `astro check`, le build et les tests,
puis déploie `dist/` sur GitHub Pages à chaque push sur `main`.

> **Important :** dans _Settings → Pages_ du dépôt, la source doit passer de
> « Deploy from a branch » à **« GitHub Actions »**.

### Référencement

Le site est un « project site » servi sous `/dzair_epfl/` : un `robots.txt` n’y serait jamais lu
(les robots ne consultent que celui de la racine du domaine). Pour aider l’indexation, soumettre
le plan du site `https://adessrrrr.github.io/dzair_epfl/sitemap-index.xml` dans
[Google Search Console](https://search.google.com/search-console) (propriété « préfixe d’URL »).
