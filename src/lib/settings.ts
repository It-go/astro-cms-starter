// Site-settings helper (STD-1 / ITG-966).
// Eksponerer det globale site-settings-entry til layout/blocks med fallback-defaults,
// så intet felt nogensinde er undefined på render-tidspunkt (ingen build-crash).
import { getEntry } from "astro:content";
import type { SiteSettings } from "../content.config";

// Fallback hvis settings-filen mangler eller et felt er tomt. Holdes i sync med
// siteSettingsSchema (kun de felter der ikke er rene optional behøver en default her).
const DEFAULTS: SiteSettings = {
  company: "",
  opening_hours: [],
  social: {},
  geo: {},
  menu: [],
  tracking: {},
};

/** Globale site-indstillinger (firma/kontakt). Altid defineret; merget med DEFAULTS. */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const entry = await getEntry("settings", "site");
    return { ...DEFAULTS, ...(entry?.data ?? {}) };
  } catch {
    // Fil mangler / parser-fejl → fald tilbage til defaults i stedet for at fejle build.
    return DEFAULTS;
  }
}
