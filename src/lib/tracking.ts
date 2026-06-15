// Tracking-config + id-validering (STD-4 / ITG-969). Rene funktioner.
// Presence = on/off: kun udfyldte id'er bliver til scripts. Hvert script har en
// consent-kategori — loaderen (TrackingScripts.astro) kører det først efter samtykke.
import type { SiteSettings } from "../content.config";

export type ConsentCategory = "statistics" | "marketing";
export type TrackingKind = "ga4" | "gtm" | "pixel";

export interface TrackingScript {
  kind: TrackingKind;
  id: string;
  category: ConsentCategory;
}

const VALIDATORS: Record<TrackingKind, { re: RegExp; example: string }> = {
  ga4: { re: /^G-[A-Z0-9]{6,}$/i, example: "G-XXXXXXXXXX" },
  gtm: { re: /^GTM-[A-Z0-9]{5,}$/i, example: "GTM-XXXXXXX" },
  pixel: { re: /^\d{6,20}$/, example: "15-16 cifre" },
};

const CATEGORY: Record<TrackingKind, ConsentCategory> = {
  ga4: "statistics",
  gtm: "marketing",
  pixel: "marketing",
};

/** Aktive (udfyldte) tracking-scripts + advarsler om oplagt forkert id-format. */
export function resolveTracking(tracking: SiteSettings["tracking"]): {
  scripts: TrackingScript[];
  warnings: string[];
} {
  const t = tracking ?? {};
  const raw: Array<[TrackingKind, string | undefined]> = [
    ["ga4", t.ga4_id],
    ["gtm", t.gtm_id],
    ["pixel", t.meta_pixel_id],
  ];
  const scripts: TrackingScript[] = [];
  const warnings: string[] = [];
  for (const [kind, value] of raw) {
    const id = (value ?? "").trim();
    if (!id) continue; // tomt = slået fra
    if (!VALIDATORS[kind].re.test(id)) {
      warnings.push(`${kind}-id "${id}" ser forkert ud (forventet ${VALIDATORS[kind].example})`);
    }
    scripts.push({ kind, id, category: CATEGORY[kind] });
  }
  return { scripts, warnings };
}
