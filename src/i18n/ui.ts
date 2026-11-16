/**
 * Interface strings, one object per language. `en` is typed from `fr`: a
 * missing (or extra) key in one language is a compile error (`npm run check`).
 *
 * Only type imports here: the Instagram sync script (run directly by Node)
 * imports this file too.
 */
import type { Category } from "../lib/categories";
import type { Lang } from "./routes";

const fr = {
  site: {
    title: "DZAÏR – Étudiants algériens en Suisse",
    description:
      "DZAÏR rassemble les étudiants algériens en Suisse pour faciliter leur intégration, encourager l’entraide et créer un réseau actif.",
    ogImageAlt: "Logo de DZAÏR – Association des étudiants algériens en Suisse",
    tagline: "Association des étudiants algériens en Suisse.",
    recognised: "Une association reconnue par l’EPFL",
  },
  a11y: {
    skipLink: "Aller au contenu",
    newTab: "(nouvel onglet)",
  },
  nav: {
    home: "Accueil",
    about: "Qui sommes-nous ?",
    events: "Événements",
    contact: "Nous contacter",
    main: "Navigation principale",
    mobile: "Navigation mobile",
    footer: "Pied de page",
    logo: "DZAÏR – accueil",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    menu: "Menu",
  },
  lang: {
    /** Name of the language, in that language. */
    name: "Français",
    /** Banner shown to visitors of the *other* language. */
    bannerText: "Ce site existe aussi en français.",
    bannerAction: "Afficher en français",
    bannerDismiss: "Masquer ce message",
    /** Accessible name of the banner landmark. */
    bannerLabel: "Choix de la langue",
  },
  theme: {
    label: "Mode sombre",
    title: "Changer de thème",
  },
  join: "Rejoins-nous",
  seeEvents: "Voir nos événements",
  home: {
    heroLine: "Étudiants algériens en Suisse",
    intro:
      "DZAÏR est l’association qui rassemble les étudiants algériens en Suisse pour faciliter leur intégration, encourager l’entraide et créer un réseau actif. Elle organise des événements culturels, des activités sociales et accompagne les nouveaux arrivants, tout en valorisant la culture algérienne.",
    aboutEyebrow: "À propos de DZAÏR",
    aboutTitle: "Qui sommes-nous ?",
    aboutLead:
      "Une association qui rassemble les étudiants algériens en Suisse, autour de trois engagements.",
    values: {
      integration: {
        title: "Intégration",
        text: "Faciliter l’intégration des étudiants algériens en Suisse et accompagner les nouveaux arrivants.",
      },
      support: {
        title: "Entraide",
        text: "Encourager l’entraide entre étudiants et créer un réseau actif.",
      },
      culture: {
        title: "Culture",
        text: "Organiser des événements culturels et des activités sociales qui valorisent la culture algérienne.",
      },
    },
    stats: {
      label: "DZAÏR en chiffres",
      events: "événements partagés",
      celebrations: "célébrations et sorties",
      campuses: "campus : EPFL et UNIL",
      firstYear: "notre premier événement",
    },
    joinEyebrow: "Nous rejoindre",
    joinTitle: "Rejoindre DZAÏR en trois étapes",
    joinSteps: {
      form: {
        title: "Remplis le formulaire",
        text: "Quelques questions en ligne pour faire connaissance.",
        action: "Ouvrir le formulaire",
      },
      instagram: {
        title: "Écris-nous sur Instagram",
        text: "On t’ajoute au canal WhatsApp de l’association.",
        action: "@dzair_suisse",
      },
      events: {
        title: "Viens à nos événements",
        text: "Journées d’accueil, soirées, randonnées : retrouve-nous sur le campus et ailleurs.",
        action: "Voir les événements",
      },
    },
    ribbonEyebrow: "En images",
    ribbonTitle: "Des souvenirs, ensemble",
    latestEyebrow: "Agenda",
    latestTitle: "Nos derniers événements",
    allEvents: "Tous les événements",
    contactEyebrow: "Nous contacter",
    contactTitle:
      "Contacte-nous sur Instagram pour rejoindre le canal WhatsApp !",
    onInstagram: "sur Instagram (nouvel onglet)",
  },
  events: {
    title: "Événements des étudiants algériens – EPFL et UNIL",
    description:
      "Les événements passés de DZAÏR : journées EPFL / UNIL, soirées networking et culturelles, célébrations et sorties.",
    eyebrow: "Agenda",
    heading: "Nos événements",
    lead: "Journées d’accueil, soirées culturelles, rencontres et sorties : retour en images sur les moments partagés par DZAÏR.",
    filterLegend: "Filtrer par catégorie",
    all: "Tous",
    count: (n: number): string => `${n} événement${n > 1 ? "s" : ""}`,
    /** Live-region text; `{n}` is replaced on the client (Intl.PluralRules). */
    shown: {
      one: "{n} événement affiché",
      other: "{n} événements affichés",
    },
    enlarge: (title: string): string => `Agrandir la photo « ${title} » :`,
  },
  event: {
    breadcrumb: "Fil d’Ariane",
    date: "Date",
    place: "Lieu",
    campus: "Campus",
    description: (title: string, when: string, location: string): string =>
      `${title} (${when}, ${location}) : un événement de DZAÏR, l’association des étudiants algériens en Suisse.`,
    instagram: "Voir la publication sur Instagram",
    share: "Partager",
    copied: "Lien copié",
    neighbours: "Autres événements",
    newer: "Plus récent",
    older: "Plus ancien",
    backToAll: "Tous les événements",
    details: "Voir l’événement",
  },
  campus: {
    EPFL: "EPFL",
    UNIL: "UNIL",
    "Hors campus": "Hors campus",
  },
  categories: {
    "epfl-unil": "Événements EPFL / UNIL",
    networking: "Networking & Partages",
    celebrations: "Célébrations & Sorties",
  } satisfies Record<Category, string>,
  lightbox: {
    previous: "Photo précédente",
    next: "Photo suivante",
    close: "Fermer",
  },
  footer: {
    follow: "Suivre DZAÏR",
    navigation: "Navigation",
    epfl: "EPFL (nouvel onglet)",
    unil: "Université de Lausanne (nouvel onglet)",
    instagram: "Instagram de DZAÏR (nouvel onglet)",
    linkedin: "LinkedIn de DZAÏR (nouvel onglet)",
    email: (email: string): string => `Écrire à ${email}`,
    copyright:
      "© 2025–2026 DZAÏR – Association des étudiants algériens en Suisse.",
    nonProfit: "Site associatif sans but lucratif.",
  },
  notFound: {
    title: "Page introuvable",
    description: "Cette page n’existe pas ou a été déplacée.",
    text: "Oups, cette page n’existe pas ou a été déplacée. Pas de panique, voici quelques pistes :",
    back: "Retour à l’accueil",
  },
};

export type UIStrings = typeof fr;

const en: UIStrings = {
  site: {
    title: "DZAÏR – Algerian Students in Switzerland",
    description:
      "DZAÏR brings together Algerian students in Switzerland to help them settle in, encourage mutual support and build an active network.",
    ogImageAlt: "DZAÏR logo – Association of Algerian Students in Switzerland",
    tagline: "Association of Algerian Students in Switzerland.",
    recognised: "An association recognised by EPFL",
  },
  a11y: {
    skipLink: "Skip to content",
    newTab: "(opens in a new tab)",
  },
  nav: {
    home: "Home",
    about: "About us",
    events: "Events",
    contact: "Contact us",
    main: "Main navigation",
    mobile: "Mobile navigation",
    footer: "Footer",
    logo: "DZAÏR – home",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    menu: "Menu",
  },
  lang: {
    name: "English",
    bannerText: "This site is also available in English.",
    bannerAction: "Switch to English",
    bannerDismiss: "Dismiss this message",
    bannerLabel: "Language choice",
  },
  theme: {
    label: "Dark mode",
    title: "Change theme",
  },
  join: "Join us",
  seeEvents: "See our events",
  home: {
    heroLine: "Algerian students in Switzerland",
    intro:
      "DZAÏR is the association that brings together Algerian students in Switzerland to help them settle in, encourage mutual support and build an active network. It organises cultural events and social activities, supports newcomers and celebrates Algerian culture.",
    aboutEyebrow: "About DZAÏR",
    aboutTitle: "Who are we?",
    aboutLead:
      "An association that brings together Algerian students in Switzerland around three commitments.",
    values: {
      integration: {
        title: "Integration",
        text: "Helping Algerian students settle in Switzerland and supporting newcomers.",
      },
      support: {
        title: "Mutual support",
        text: "Encouraging students to help one another and building an active network.",
      },
      culture: {
        title: "Culture",
        text: "Organising cultural events and social activities that celebrate Algerian culture.",
      },
    },
    stats: {
      label: "DZAÏR in numbers",
      events: "events shared",
      celebrations: "celebrations and outings",
      campuses: "campuses: EPFL and UNIL",
      firstYear: "our first event",
    },
    joinEyebrow: "Join us",
    joinTitle: "Join DZAÏR in three steps",
    joinSteps: {
      form: {
        title: "Fill in the form",
        text: "A few questions online so we can get to know you.",
        action: "Open the form",
      },
      instagram: {
        title: "Message us on Instagram",
        text: "We’ll add you to the association’s WhatsApp channel.",
        action: "@dzair_suisse",
      },
      events: {
        title: "Come to our events",
        text: "Welcome days, evenings, hikes: meet us on campus and beyond.",
        action: "See the events",
      },
    },
    ribbonEyebrow: "In pictures",
    ribbonTitle: "Memories, together",
    latestEyebrow: "What’s on",
    latestTitle: "Our latest events",
    allEvents: "All events",
    contactEyebrow: "Get in touch",
    contactTitle: "Message us on Instagram to join the WhatsApp channel!",
    onInstagram: "on Instagram (opens in a new tab)",
  },
  events: {
    title: "Algerian student events – EPFL and UNIL",
    description:
      "DZAÏR’s past events: EPFL / UNIL days, networking and cultural evenings, celebrations and outings.",
    eyebrow: "What’s on",
    heading: "Our events",
    lead: "Welcome days, cultural evenings, meet-ups and outings: a look back in pictures at the moments shared by DZAÏR.",
    filterLegend: "Filter by category",
    all: "All",
    count: (n) => `${n} event${n === 1 ? "" : "s"}`,
    shown: {
      one: "{n} event shown",
      other: "{n} events shown",
    },
    enlarge: (title) => `Enlarge photo “${title}”:`,
  },
  event: {
    breadcrumb: "Breadcrumb",
    date: "Date",
    place: "Place",
    campus: "Campus",
    description: (title, when, location) =>
      `${title} (${when}, ${location}): an event by DZAÏR, the association of Algerian students in Switzerland.`,
    instagram: "See the post on Instagram",
    share: "Share",
    copied: "Link copied",
    neighbours: "Other events",
    newer: "Newer",
    older: "Older",
    backToAll: "All events",
    details: "See the event",
  },
  campus: {
    EPFL: "EPFL",
    UNIL: "UNIL",
    "Hors campus": "Off campus",
  },
  categories: {
    "epfl-unil": "EPFL / UNIL events",
    networking: "Networking & meet-ups",
    celebrations: "Celebrations & outings",
  },
  lightbox: {
    previous: "Previous photo",
    next: "Next photo",
    close: "Close",
  },
  footer: {
    follow: "Follow DZAÏR",
    navigation: "Navigation",
    epfl: "EPFL (opens in a new tab)",
    unil: "University of Lausanne (opens in a new tab)",
    instagram: "DZAÏR on Instagram (opens in a new tab)",
    linkedin: "DZAÏR on LinkedIn (opens in a new tab)",
    email: (email) => `Email ${email}`,
    copyright:
      "© 2025–2026 DZAÏR – Association of Algerian Students in Switzerland.",
    nonProfit: "Non-profit student association website.",
  },
  notFound: {
    title: "Page not found",
    description: "This page does not exist or has been moved.",
    text: "Oops, this page does not exist or has been moved. Don’t worry, here are a few options:",
    back: "Back to the home page",
  },
};

export const ui: Record<Lang, UIStrings> = { fr, en };

export function useTranslations(lang: Lang): UIStrings {
  return ui[lang];
}
