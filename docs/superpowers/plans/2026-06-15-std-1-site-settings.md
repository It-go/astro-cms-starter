# ITG-966 · STD-1 — site-settings fil-collection + Astro-læsning (fundament)

EPIC: ITG-965 (CMS-STD). DoD: ITG-489 (da/en i18n · mobil-first · kunde-selvbetjening · grøn build · rør ikke prod).

## Mål
Én global `site-settings`-fil pr. site som kunden redigerer i ITGo Studio (Sveltia
`files`-widget) og som Astro læser typesikkert ved build. Kundens kontrolpanel for alt
ikke-design: firmanavn, CVR, adresse, tlf, e-mail, åbningstider, sociale links, logo.

## Designbeslutninger
- **Sveltia**: ny `files`-collection `settings` (ét entry `site` → `src/content/settings/site.yml`).
  Skrives fladt (felter i roden). Collection-navn = `settings` så `check:model` matcher 1:1.
- **Astro**: `file()`-loader med custom `parser` der wrapper det flade YAML-objekt som
  `{ site: data }` → ét entry med id `site`. `getEntry('settings','site')`.
- **Robusthed**: zod-skema = alle felter `optional`/`.default()` → manglende felt giver
  aldrig build-crash. Helper `getSiteSettings()` merger desuden med `DEFAULTS`.
- **i18n**: site-settings er globale (firmanavn/CVR/tlf/e-mail oversættes ikke). Ingen
  oversættbare strenge i footer-output → iboende i18n-sikkert. Dokumenteres.
- **Synlighed (accept-krav 1)**: slank global kontakt-footer i `Base.astro` (firma · CVR ·
  tlf · e-mail · adresse · sociale links), mobile-first, med fallback når felter mangler.

## Filer
1. `studio.config.yml` — tilføj `settings` files-collection (med `hint`-tekster, samme stil).
2. `src/content.config.ts` — `settings` collection (`file()` + parser + zod), tilføj til
   `export const collections`.
3. `src/content/settings/site.yml` — demo-værdier (starter er demo-base).
4. `src/lib/settings.ts` — `getSiteSettings()` + `DEFAULTS` + type.
5. `src/layouts/Base.astro` — hent settings + render global kontakt-footer + CSS.
6. `docs/site-settings.md` — konvention (kunde + udvikler); link fra `docs/content-model.md`.
7. `package.json` — `yaml` som eksplicit devDependency (bruges i loader + check-model).

## Verifikation (pass 1 = byg + tests → én PR)
- [ ] `npm run check:model` grøn (collections 1:1 inkl. `settings`).
- [ ] `npm run check` (astro check / typer) grøn.
- [ ] `npm run build` grøn (skema validerer; tom/manglende felt → fallback, ingen crash).
- [ ] Manuel: kunde redigerer firmainfo i Studio → commit → synligt på sitet (human/live).

## Out of scope (pass 2 / senere)
- Live-preview-binding (`data-itgo-field`) for settings — wires i editing-UX-tracket.
- Per-kunde branding/onboarding-udfyldning (Phase B).
