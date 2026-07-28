# Content-model (ITGo Studio-starter)

Dette site er **content-first**: alt synligt indhold lever i `src/content/`, redigeres i **ITGo Studio**
(på `studio.itgo.dk`) og committes via git → auto-deploy. Der er **ingen hardkodede tekster** i
komponenterne og **ingen `/admin` på selve sitet** — redigering sker centralt i ITGo Studio.

## Den bærende konvention: schema ↔ config 1:1

Hver Astro content-collection (`src/content.config.ts`, zod) har en **matchende Sveltia-collection**
i `studio.config.yml`. **Feltnavnene matcher præcist.** Det er det der gør editoren *automatisk*:
Studio genererer redigerings-UI'en ud fra skemaet — vi annoterer aldrig elementer manuelt.

```
src/content.config.ts   (zod schema — sandheden)
        ↕  1:1 (samme feltnavne)
studio.config.yml        (Sveltia/ITGo Studio — auto-genereret editor)
        ↓
src/content/**           (markdown/frontmatter — det kunden redigerer)
```

## Collections

| Collection | Sti | Form | Beskrivelse |
|---|---|---|---|
| `settings` | `src/content/settings/site.yml` | file (ét entry) | Globalt kontrolpanel: firma/kontakt. Læses via `getSiteSettings()`. Se [site-settings.md](./site-settings.md). |
| `pages` | `src/content/pages/<locale>/<slug>.md` | blocks | Sider bygget af **blokke** (se nedenfor). i18n (da/en). |
| `news` | `src/content/news/<slug>.md` | markdown | Nyheder/blog. Flad. Kan slettes. |

## Blok-modellen (kernen)

En side er en **ordnet liste af typede blokke** (`blocks`), ikke fri HTML. Det betyder:
kunden tilføjer/fjerner/omarrangerer sektioner i Studio, og hver blok har præcis de felter den skal.

Blok-typerne (discriminated union på `type`, 1:1 med `@itgo/blocks`):

| `type` | Felter |
|---|---|
| `hero` | heading, subheading, image, cta_label, cta_href |
| `text` | heading, body (markdown) |
| `image_grid` | heading, columns, images[] |
| `faq` | heading, items[] (q/a) |
| `contact_form` | heading, submit_label, form_key, fields[] |
| `testimonials` | heading, items[] (quote/author) |
| `cta` | heading, body, button_label, button_href |
| `footer` | company, address, links[] |
| `services` | heading, items[] (title/description/icon) — PACK-CRAFT (ITG-774) |
| `cases` | heading, items[] (title/image/description/href) — PACK-CRAFT (ITG-774) |
| `match_program` | heading, items[] (date/opponent/home_away/result) — PACK-CLUB (ITG-775) |
| `team_roster` | heading, items[] (name/position/number/image) — PACK-CLUB (ITG-775) |
| `news_feed` | heading, limit — læser `news`-collection direkte, ingen manuel liste — PACK-CLUB (ITG-775) |
| `sponsor_grid` | heading, items[] (logo/name/link) — PACK-CLUB (ITG-775) |
| `member_signup` | heading, intro, submit_label, form_key, fields[] — formular kun (STUDIO-FORMS kobler indsendelse) — PACK-CLUB (ITG-775) |

Sitet renderer blokke generisk (`src/components/blocks/`), så en ny blok-type kræver
**ét** nyt komponent + skema + config-entry — aldrig per-side arbejde.

## Sådan tilføjer du en collection (step-by-step)

1. **Skema** i `src/content.config.ts`: `defineCollection({ loader: glob(...), schema: z.object({...}) })` + tilføj til `export const collections`.
2. **Config** i `studio.config.yml`: tilføj en `- name: <collection>` med `folder`, `format`, og `fields` der **matcher zod-feltnavnene 1:1**.
3. **Rendering**: en Astro-rute (`src/pages/...`) der læser collection'en med `getCollection()`.
4. Verificér 1:1: `npm run check:model` (se nedenfor) fejler hvis felter divergerer.

## Sådan tilføjer du en blok-type

1. Skema: nyt `z.object({ type: z.literal("min_blok"), ... })` + tilføj til `discriminatedUnion`.
2. Config: nyt punkt under `blocks.types` med samme felter.
3. Komponent: `src/components/blocks/MinBlok.astro` + registrér i block-rendereren.

## Hvorfor det skalerer

Editoren er **afledt af skemaet**, ikke håndlavet per site. Et nyt kundesite = klon denne starter →
det har allerede collections + matchende `studio.config.yml` + blokke → **ITGo Studio virker med det samme**.
Per-site arbejde er "fyld indhold + vælg blokke", ikke "byg en editor".

Se også: [branding.md](./branding.md) · [i18n.md](./i18n.md) · [media.md](./media.md)
