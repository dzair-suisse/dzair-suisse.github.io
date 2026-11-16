# DZAÏR – Étudiants algériens en Suisse

Site de **DZAÏR**, l’association des étudiants algériens en Suisse (EPFL / UNIL).
En ligne : <https://dzair-suisse.github.io/>

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

| Commande               | Action                                              |
| ---------------------- | --------------------------------------------------- |
| `npm ci`               | Installe les dépendances                            |
| `npm run dev`          | Serveur de développement : <http://localhost:4321/> |
| `npm run build`        | Génère le site dans `dist/`                         |
| `npm run preview`      | Sert le build localement                            |
| `npm run check`        | Vérification TypeScript / Astro (`astro check`)     |
| `npm run format`       | Formate le code (Prettier)                          |
| `npm run format:check` | Vérifie le formatage                                |
| `npm test`             | Tests Playwright (lancer `npm run build` avant)     |

Première utilisation des tests : `npx playwright install chromium`.

## Structure

```
public/                 favicons, image Open Graph, manifest, redirection evenements.html
scripts/                generate-icons.mjs (régénère favicons + og-image)
src/assets/             logos et photos des événements (optimisés au build)
src/components/         Header, Footer, EventCard, Lightbox, SEO, Icon, ThemeToggle, LanguageSwitcher…
src/components/pages/   corps des pages (HomePage, EventsPage), partagés par le français et l’anglais
src/content/events.yaml données des événements
src/content.config.ts   schéma (zod) des collections d’événements
src/i18n/               textes de l’interface (ui.ts) et correspondance des URL FR ⇄ EN (routes.ts)
src/layouts/            BaseLayout
src/lib/                helpers (URL avec base, catégories, formats de date…)
src/pages/              index, evenements, 404 (FR) ; en/index, en/events (EN) : simples enveloppes
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

## Version anglaise

Le français reste à la racine (, ) ; l’anglais est servi sous et (i18n intégré d’Astro). Les deux langues partagent le même balisage : les fichiers de appellent / () avec ou .

- **Textes de l’interface** : , un objet et un objet . L’objet anglais est typé
  d’après le français : une clé oubliée fait échouer .
- **URL** : (, segments traduits comme ⇄ ).
  Chaque page déclare ses équivalents (), repris dans le plan du site.
- **Sélecteur FR | EN** (en-tête et menu mobile) : garde et l’ancre, et mémorise le choix.
  Seule l’accueil française renvoie vers si l’anglais a été choisi ; sans choix, un navigateur
  dans l’autre langue voit seulement un bandeau discret (jamais de redirection automatique).
- **404** : GitHub Pages ne sert qu’un , qui affiche donc les deux langues.

### Titre anglais d’un événement

Ajouter un bloc à l’événement (dans ou ) :

\
Sans bloc , la version anglaise affiche le titre, le lieu et le texte alternatif français. Les
événements importés depuis Instagram reçoivent automatiquement leur version anglaise.

## Import automatique depuis Instagram

Le workflow **Synchronisation Instagram** (`.github/workflows/sync-instagram.yml`) tourne chaque
jour (et à la demande depuis l’onglet _Actions_). Il lit les derniers posts de @dzair_suisse, et
Claude (`claude-opus-5-5`) décide pour chaque nouveau post s’il s’agit d’un événement, s’il fait
doublon avec un événement existant, et en extrait titre, date, lieu, catégorie et texte alternatif
(titre et texte alternatif aussi en anglais).
Les nouveaux événements sont ajoutés à `src/content/instagram-events.yaml` (image dans
`src/assets/events/instagram/`), le site est vérifié, commité puis redéployé.

- Corriger un événement importé : modifier son bloc dans `instagram-events.yaml`, il ne sera
  jamais réécrit.
- Retirer un événement importé : supprimer son bloc (le post reste marqué « traité » dans
  `instagram-state.json`).
- Faire relire un post par Claude : supprimer son entrée dans `instagram-state.json`.

### Configuration (une seule fois)

1. **Compte Instagram professionnel** : dans l’app Instagram, _Paramètres → Type de compte_ →
   passer @dzair_suisse en compte _Créateur_ ou _Entreprise_ (gratuit).
2. **App Meta** : sur <https://developers.facebook.com/apps>, créer une app de type _Entreprise_,
   ajouter le produit **Instagram → API setup with Instagram login**, ajouter @dzair_suisse comme
   testeur Instagram (et accepter l’invitation dans l’app Instagram), puis **Generate token**
   (permission `instagram_business_basic`). Le jeton généré est un jeton longue durée (60 jours).
3. **Clé Anthropic** : créer une clé sur <https://platform.claude.com> (quelques centimes par mois).
4. **Secrets GitHub** : _Settings → Secrets and variables → Actions → New repository secret_ :
   - `INSTAGRAM_ACCESS_TOKEN` : le jeton de l’étape 2 ;
   - `ANTHROPIC_API_KEY` : la clé de l’étape 3 ;
   - `SECRETS_PAT` (facultatif) : un jeton GitHub _fine-grained_ limité à ce dépôt avec la
     permission « Secrets: Read and write ». Le workflow enregistre alors chaque jour le jeton
     Instagram rafraîchi. Sans lui, régénérer le jeton Instagram avant 60 jours.
5. Lancer le workflow une première fois : _Actions → Synchronisation Instagram → Run workflow_.

Sans `INSTAGRAM_ACCESS_TOKEN`, le workflow ne fait rien et le site garde ses événements manuels.

Test local contre de faux serveurs : `INSTAGRAM_GRAPH_URL` et `ANTHROPIC_BASE_URL` permettent de
rediriger les appels.

## Liens internes

Le site est servi à la racine. Pour tout lien interne ou fichier de `public/`, utiliser
`url()` de `src/lib/url.ts` (par ex. `url("evenements/")`), jamais un chemin commençant par `/`.

## Déploiement

Le workflow `.github/workflows/deploy.yml` vérifie le formatage, lance `astro check`, le build et les tests,
puis déploie `dist/` sur GitHub Pages à chaque push sur `main`.

> **Important :** dans _Settings → Pages_ du dépôt, la source doit passer de
> « Deploy from a branch » à **« GitHub Actions »**.

### Référencement

Le site est servi à la racine de `https://dzair-suisse.github.io/` : `public/robots.txt` indique le
plan du site aux robots. Pour accélérer l’indexation, soumettre
`https://dzair-suisse.github.io/sitemap-index.xml` dans
[Google Search Console](https://search.google.com/search-console) (propriété « préfixe d’URL »).
