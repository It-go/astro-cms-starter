# ITG-971 · STD-6 — Privatlivspolitik-generator

EPIC: ITG-965 (CMS-STD). Bygger på STD-1 (firmainfo) + STD-4/5 (tracking/consent).
Worktree-isoleret. DoD: ITG-489.

## Mål
Auto-generér en korrekt da/en privatlivs- + cookiepolitik ud fra site-settings, så kunden
ikke skal skrive den. Altid i sync med faktisk tracking/consent. Kunden kan overtage og
redigere den selv.

## Designbeslutninger
- **Synthetic route i `[...slug].astro`**: policy-siden genereres som en syntetisk rute
  (da `/privatlivspolitik`, en `/en/privacy-policy`) — MEN kun hvis ingen content-side
  allerede har det slug. Opretter kunden siden i Studio, vinder deres (redigerbare) version
  → opfylder "kunden kan redigere bagefter" uden rute-kollision.
- **Ren builder** `src/lib/privacy.ts`: `buildPrivacyPolicy(site, {locale})` → typede sektioner
  (dataansvarlig fra STD-1; cookies/tracking-afsnit afledt af STD-4-id'er + STD-5-kategorier;
  GDPR-rettigheder; klage→Datatilsynet; ændringer). Altid korrekt fordi den læser settings ved build.
- **Disclaimer**: "skabelon, ikke juridisk rådgivning" — eksplicit i bunden.
- **Auto-link**: footer + consent-banner linker til policy. Effektiv URL = `consent.policy_url`
  hvis sat, ellers den genererede locale-rute.
- **AI-assist (Fable/Sonnet)**: pass 2 — kræver Studio/gateway (kan ikke køre ved statisk build).
- Ingen schema/config-ændringer → `check:model` uberørt.

## Filer
1. `src/lib/privacy.ts` — policy-builder (da/en, ren funktion).
2. `src/components/PrivacyPolicy.astro` — renderer doc'et.
3. `src/pages/[...slug].astro` — syntetiske policy-ruter (yield til content-side).
4. `src/layouts/Base.astro` — footer policy-link + `policyHref` → ConsentBanner.
5. `src/components/ConsentBanner.astro` — accepter `policyHref`-prop (fallback til genereret rute).
6. `docs/site-settings.md` — privacy-afsnit.

## Verifikation
- [ ] `check:model` · `astro check` · `build` grønne.
- [ ] `/privatlivspolitik` + `/en/privacy-policy` genereret med firmanavn/CVR + cookie-afsnit der
      matcher tracking (temp GA4 → "Google Analytics" nævnt; uden tracking → "kun nødvendige").
- [ ] Footer + consent linker til policy.
- [ ] Override: opret `pages/da/privatlivspolitik.md` (temp) → ingen duplikat-rute-fejl, content vinder.

## Out of scope (pass 2)
- AI-assist tekst-tilpasning + gem-som-side i Studio; per-branche-skabeloner.
