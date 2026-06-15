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

## Scripts & tags (STD-4)

Feltet `tracking` (GA4 / GTM / Meta Pixel-id) lader kunden tilføje analytics/marketing uden
kode. **Presence = on/off**: udfyldt felt = aktivt, tomt = intet script. Scripts injiceres
**consent-gated** af `src/components/TrackingScripts.astro` — hvert script loader først når dets
kategori har samtykke (`localStorage["itgo:consent"]` = `{statistics, marketing}`; GA4 = statistik,
GTM/Pixel = marketing). Uden samtykke loader intet (GDPR-safe default); cookie-banneret der sætter
samtykket kommer i **STD-5** og dispatcher `itgo:consent-changed`. Oplagt forkert id-format giver
en build-advarsel.

## Cookie-consent (STD-5)

Feltet `consent` styrer et GDPR cookie-banner (`src/components/ConsentBanner.astro`,
tekster i `src/lib/consent.ts`). Slås til med `consent.enabled`. Banneret giver tre kategorier
(nødvendige altid til; statistik; marketing) og tre valg: Accepter alle · Kun nødvendige · Tilpas.
Valget gemmes i `localStorage["itgo:consent"]` og dispatcher `itgo:consent-changed`, så **STD-4's
scripts loader først efter samtykke** i deres kategori. Intet samtykke → kun nødvendige.
Valget kan ændres igen via "Cookie-indstillinger" i footeren. Samtykke logges lokalt
(`itgo:consent-log`) + sendes valgfrit til `consent.log_url` (sendBeacon). Tekst (`message`/
`message_en`) og `policy_url` kan overstyres i settings; ellers bruges indbyggede da/en-tekster.

## Privatlivspolitik (STD-6)

En da/en privatlivs-/cookiepolitik genereres automatisk ud fra site-settings
(`src/lib/privacy.ts` + `PrivacyPolicy.astro`) på `/privatlivspolitik` og `/en/privacy-policy`.
Den udfyldes med firmainfo (STD-1) og et cookie-afsnit afledt af de aktive tracking-værktøjer
(STD-4) + samtykke-kategorier (STD-5), så den altid matcher hvad sitet faktisk gør. Footer og
cookie-banneret linker automatisk til den (eller til `consent.policy_url` hvis sat).

Vil kunden redigere den selv, opretter de bare en side med slug `privatlivspolitik` (da) /
`privacy-policy` (en) i Studio — så **vinder deres redigerbare side** over den genererede
(ingen dublet-rute). Politikken er en **skabelon, ikke juridisk rådgivning** (disclaimer i bunden).

## Redirects + 404 (STD-7)

Feltet `redirects` (liste af `{ from, to, permanent }`) lader kunden/ITGo styre 301/302-
viderestillinger. Ved build skriver en integration (`src/integrations/emit-redirects.ts` via
`src/lib/redirects.ts`) en Cloudflare Pages `_redirects`-fil i output-roden (`<from> <to> 301|302`);
`permanent: false` → 302. Tom liste → ingen fil.

`src/pages/404.astro` er en pæn 404 med navigation-forslag fra menuen (STD-3). Vil kunden have
sin egen tekst, opretter de en side med slug `404` i Studio — så renderes deres (redigerbare)
indhold i stedet. Cloudflare Pages serverer `dist/404.html` ved ukendt URL. Auto-redirect ved
slug-ændring kobler til STD-2 (sidestyring) og kommer dér.

## Besøgsstatistik (STD-9)

Feltet `analytics.cf_web_analytics_token` aktiverer **cookieløs Cloudflare Web Analytics**
(`Analytics.astro`) — en beacon der indlæses når token er sat. Da den er cookieløs kræver den
**intet samtykke** og er derfor adskilt fra STD-4's consent-gatede scripts (loader altid).
Tom token → ingen beacon. Selve dashboardet (besøg, top-sider, kilder) vises i HQ/Studio via
Cloudflares Analytics API — det hører i CRM-siden (pass 2), ikke i den statiske starter.

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
