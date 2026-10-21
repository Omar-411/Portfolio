import type { Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";

const dictionaries: Record<Locale, Dictionary> = { en, fr };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];
export type { Dictionary };
