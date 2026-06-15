# ITG-969 · STD-4 — Scripts & tags (GTM/GA4/Meta Pixel) som nemme felter

EPIC: ITG-965 (CMS-STD). Bygger på STD-1. **Consent-safe standalone** (consent-banneret
selv kommer i STD-5). DoD: ITG-489.

## Mål
Kunden tilføjer Google/Meta-scripts uden kode (bare indsæt id). **Marketing/statistik-scripts
må ALDRIG køre før samtykke** — derfor consent-gated som default. Uden STD-5's banner loader
intet (compliant fra start); STD-5 plugger consent-signalet ind senere.

## Designbeslutninger
- **Felter** i site-settings `tracking`: `ga4_id`, `gtm_id`, `meta_pixel_id` (alle optional).
  **Presence = on/off**: udfyldt = aktiv, tomt = intet script (matcher accept "tomt felt → intet script"
  + "toggle off → script væk" = ryd feltet).
- **Consent-gating**: `TrackingScripts.astro` udsender en lille inline-loader der KUN injicerer
  hvert script når dets kategori er givet samtykke (`localStorage["itgo:consent"]` = `{statistics, marketing}`).
  Kategorier: GA4 = statistics; GTM + Meta Pixel = marketing. Lytter på `itgo:consent-changed`
  (dispatches af STD-5). Intet samtykke (endnu intet banner) → intet loader = GDPR-safe default.
- **ID-validering**: byg-advarsel (console.warn) ved oplagt forkert format (GA4 `G-…`, GTM `GTM-…`,
  Pixel = cifre) — aldrig crash.
- **Injektion** via `Base.astro <head>` (efter JSON-LD).
- Custom "øvrige scripts" (head/body) → **pass 2** (rå-script-injektion + gating kræver mere; holdes ude af pass 1).

## Filer
1. `src/content.config.ts` — `tracking`-objekt i `siteSettingsSchema`.
2. `src/lib/settings.ts` — `tracking: {}` i DEFAULTS.
3. `studio.config.yml` — `tracking`-felter (hints forklarer consent-gating).
4. `src/lib/tracking.ts` — id-validering (ren funktion) + kategori-map.
5. `src/components/TrackingScripts.astro` — consent-gated inline loader.
6. `src/layouts/Base.astro` — render `<TrackingScripts>`.
7. `docs/site-settings.md` — tracking-afsnit.

## Verifikation
- [ ] `check:model` · `astro check` · `build` grønne.
- [ ] Tomt `tracking` → ingen tracking-output i `dist` (ingen fejl).
- [ ] Med demo-id (temp): gate-script + id'er er i `dist`, men INGEN eager
      `googletagmanager.com`/`connect.facebook.net`-tag i statisk HTML (loades først ved consent).
- [ ] Forkert id-format (temp) → console.warn ved build.

## Out of scope (pass 2)
- Custom head/body raw-scripts; STD-5 consent-banner/-log; Consent Mode v2 default-tags.
