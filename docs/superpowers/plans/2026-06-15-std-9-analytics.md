# ITG-974 · STD-9 — Privacy-venlig besøgsstatistik

EPIC: ITG-965 (CMS-STD). Worktree-isoleret. DoD: ITG-489.

## Mål
Simpel, cookieløs besøgsstatistik uden consent-krav. Site-siden: indlejr en cookieløs beacon.
HQ/Studio-dashboard (besøg/top-sider/kilder) = CRM-side → pass 2.

## Designbeslutninger
- **Cloudflare Web Analytics** (gratis, cookieløs) — token i site-settings `analytics.cf_web_analytics_token`.
- **Ingen consent-gate**: CF Web Analytics er cookieløs → kræver ikke samtykke (jf. issue).
  Holdes derfor ADSKILT fra STD-4's consent-gated GA4/GTM/Pixel (egen komponent, loader altid).
- **Beacon**: `<script defer src="…/beacon.min.js" data-cf-beacon='{"token":"…"}'>` injiceres kun
  når token er sat. Tom token → intet script.
- **Dashboard** (besøg/top-sider/kilder via CF GraphQL Analytics API) hører i CRM/HQ + kræver
  CF API-token → **pass 2** (ikke i den statiske starter).

## Filer
1. `src/content.config.ts` — `analytics`-objekt i `siteSettingsSchema`.
2. `src/lib/settings.ts` — `analytics: {}` i DEFAULTS.
3. `studio.config.yml` — `analytics`-felt (cf_web_analytics_token + hint).
4. `src/components/Analytics.astro` — cookieløs beacon.
5. `src/layouts/Base.astro` — render `<Analytics>`.
6. `docs/site-settings.md` — statistik-afsnit.

## Verifikation
- [ ] `check:model` · `astro check` · `build` grønne.
- [ ] Tom token → ingen beacon. Token (temp) → CF beacon-script i `dist` med korrekt token,
      uafhængigt af consent (ingen gating).

## Out of scope (pass 2)
- HQ/Studio-dashboard (CF Analytics API); Plausible-alternativ; per-side/kilde-visning.
