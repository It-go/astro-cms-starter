# ITG-973 · STD-8 — schema.org LocalBusiness auto fra site-settings

EPIC: ITG-965 (CMS-STD). Bygger på STD-1 (ITG-966, site-settings). DoD: ITG-489.

## Mål
Auto-generér gyldig schema.org **LocalBusiness** JSON-LD i `<head>` på alle sider, afledt
af site-settings (STD-1). Stor lokal-SEO-gevinst for håndværker/klub-kunder (rich results,
Google-kort). Plus **BreadcrumbList** på undersider.

## Designbeslutninger
- **Nye settings-felter** (STD-1-modellen udvides): `business_type` (select — branche →
  korrekt @type), `geo` (latitude/longitude, valgfri), `price_range` (valgfri). Alle optional.
- **Ren builder** `src/lib/schema-org.ts` (ingen rendering): `localBusinessJsonLd(site, {siteUrl})`
  + `breadcrumbJsonLd(items)`. Rene funktioner → testbare og genbrugelige.
- **Gyldighed frem for fuldstændighed**: kun felter med gyldige værdier emittes. Adresse
  parses løst til `PostalAddress` (streetAddress + postalCode + addressLocality + addressCountry DK).
  Åbningstider parses (da/en dag-tokens inkl. intervaller + "Lukket"/Weekend/Hverdage) til
  `openingHoursSpecification`; uparsbare linjer **udelades** (aldrig ugyldig output → Rich Results grøn).
- **@type-allowlist**: ukendt `business_type` falder tilbage til `LocalBusiness`.
- **Injektion** i `Base.astro <head>`: `<script type="application/ld+json">` med `<`→`<`-escaping.
  LocalBusiness på alle sider; BreadcrumbList kun på undersider (ikke forsider `/` og `/en`).
- **i18n**: structured data er sprog-neutralt (URL'er/tal/enums); breadcrumb-hjemlabel da/en.

## Filer
1. `src/content.config.ts` — `business_type`/`geo`/`price_range` i `siteSettingsSchema`.
2. `studio.config.yml` — samme felter i `settings`-collection (hints; check:model 1:1).
3. `src/lib/settings.ts` — `geo: {}` i DEFAULTS.
4. `src/lib/schema-org.ts` — builders + parsere (ny).
5. `src/layouts/Base.astro` — byg + inject JSON-LD i `<head>`.
6. `src/content/settings/site.yml` — demo: business_type + geo.
7. `docs/site-settings.md` — schema.org-afsnit.

## Verifikation (pass 1 = byg + tests → én PR)
- [ ] `npm run check:model` grøn (settings stadig 1:1).
- [ ] `npm run check` (typer) grøn.
- [ ] `npm run build` grøn.
- [ ] `dist/`-HTML indeholder gyldig LocalBusiness JSON-LD (@type, address, sameAs,
      openingHoursSpecification fra demo: Man–tor + Fredag, Weekend udeladt) + BreadcrumbList på /om-os.
- [ ] Google Rich Results test (human, mod deployet URL).

## Out of scope (pass 2)
- Article-schema pr. nyhed; geo auto-opslag fra adresse; review/rating-schema.
