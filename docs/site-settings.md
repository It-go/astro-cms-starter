# Site-settings (STD-1)

Kundens **globale kontrolpanel** for alt der ikke er design eller sideindhold:
firmanavn, CVR, adresse, telefon, e-mail, åbningstider, sociale links og logo.
Redigeres i **ITGo Studio** under **Indstillinger → Firma & kontakt** og bruges overalt
på sitet (fx i footeren).

## Hvor det lever

| Lag | Fil | Rolle |
|---|---|---|
| Editor | `studio.config.yml` → collection `settings` (en `files`-widget) | Hvad kunden ser/redigerer |
| Data | `src/content/settings/site.yml` | Det committede indhold (ét fladt YAML-objekt) |
| Skema | `src/content.config.ts` → `siteSettingsSchema` + collection `settings` | Typer + validering |
| API | `src/lib/settings.ts` → `getSiteSettings()` | Det resten af sitet kalder |

`settings` indgår i `check:model` på linje med `pages`/`news` — config og skema holdes 1:1.

## Sådan læser du indstillingerne i Astro

```astro
---
import { getSiteSettings } from "../lib/settings";
const site = await getSiteSettings(); // altid defineret — aldrig undefined
---
<p>{site.company}{site.cvr && ` · CVR ${site.cvr}`}</p>
```

`getSiteSettings()` henter entry'et `settings/site` og **merger med fallback-defaults**.
Det betyder:

- **Manglende felt** → tom/​default-værdi, ikke en build-fejl. Skemaet er fuldt `optional`/`.default()`.
- **Manglende fil / parse-fejl** → helper falder tilbage til `DEFAULTS`.

Skriv altid render-kode defensivt (`{site.phone && …}`), så tomme felter bare udelades.

## i18n

Site-settings er **globale** — firmanavn, CVR, telefon og e-mail er ens på alle sprog
og oversættes ikke. Derfor har collection'en ingen locale-mapper; den samme `site.yml`
bruges for både `da` og `en`. Sideindhold (collection `pages`) er fortsat i18n pr. locale.

## Navigation / menu (STD-3)

Feltet `menu` (liste, drag-sorteret i Studio) styrer site-headeren. Hvert punkt har
`label` (da), valgfri `label_en` (fallback = `label`) og `link`. `link` er enten en **intern
side** (`om-os`, eller tom = forsiden) eller en **fuld URL** (`https://…`). Interne links får
automatisk den locale-korrekte sti (da `/om-os`, en `/en/om-os`). Renderes af
`src/components/SiteHeader.astro` (resolver: `src/lib/nav.ts`) med JS-fri mobil-burger.
Døde interne links giver en build-advarsel (console.warn), ikke en fejl.

## SEO / schema.org (STD-8)

Felterne `business_type`, `geo` og `price_range` + firma/adresse/tlf/åbningstider bruges til at
auto-generere **LocalBusiness** JSON-LD i `<head>` på alle sider (`src/lib/schema-org.ts`,
injiceret af `Base.astro`). Undersider får desuden **BreadcrumbList**. Kun gyldige værdier
emittes — uparsbare åbningstider og tomme felter udelades, så structured data altid validerer
(Google Rich Results). `business_type` vælger schema.org-typen (fx `HomeAndConstructionBusiness`
for håndværkere); ukendt værdi falder tilbage til `LocalBusiness`.

## Teknisk note (single-object via `file()`)

Sveltia skriver felterne fladt i roden af `site.yml`. Astros `file()`-loader forventer
entries med id'er, så parseren wrapper objektet som `{ site: <data> }` → ét entry med
id `site`, læst via `getEntry("settings", "site")`.

Se også: [content-model.md](./content-model.md) · [i18n.md](./i18n.md)
