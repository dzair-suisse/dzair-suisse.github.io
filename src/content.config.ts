import { defineCollection, type SchemaContext } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";
import { CATEGORIES } from "./lib/categories";

const eventSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string().min(1),
    /** Premier jour du mois de l’événement (seuls le mois et l'année sont affichés). */
    date: z.coerce.date(),
    /** Lieu affiché, p. ex. « EPFL » ou « Stanserhorn, Nidwald ». */
    location: z.string().min(1),
    /** Rattachement : campus EPFL, UNIL ou sortie hors campus. */
    campus: z.enum(["EPFL", "UNIL", "Hors campus"]),
    category: z.enum(CATEGORIES),
    image: image(),
    /**
     * Cadrage dans la carte : `contain` montre l’affiche en entier (sur un
     * fond teinté), `cover` remplit la vignette (photos).
     */
    fit: z.enum(["contain", "cover"]).default("cover"),
    /** Texte alternatif descriptif (en français). */
    alt: z.string().min(10),
    /**
     * Version anglaise (facultative). Sans elle, la version anglaise du site
     * affiche les textes français.
     */
    en: z
      .object({
        title: z.string().min(1),
        /** Seulement si le lieu s’écrit autrement en anglais (« Berne » → « Bern »). */
        location: z.string().min(1).optional(),
        alt: z.string().min(10),
      })
      .optional(),
    /** Lien vers le post Instagram d’origine (événements synchronisés). */
    permalink: z.url().optional(),
  });

/** Événements saisis à la main. */
const events = defineCollection({
  loader: file("src/content/events.yaml"),
  schema: eventSchema,
});

/**
 * Événements importés automatiquement depuis Instagram par
 * `scripts/sync-instagram.ts` (workflow « Synchronisation Instagram »).
 */
const instagramEvents = defineCollection({
  loader: file("src/content/instagram-events.yaml"),
  schema: eventSchema,
});

export const collections = { events, instagramEvents };
