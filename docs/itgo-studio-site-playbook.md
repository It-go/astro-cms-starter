# ITGo Studio — komplet site-playbook (skabelon)

Master-skabelon for at bygge, registrere og aflevere et kunde-site på ITGo Studio.
Genbrugelig på tværs af sites — udfyld `{{pladsholdere}}` pr. projekt. Bor i `astro-cms-starter`,
så den følger hver klon.

Pipeline: **1) Claude Design → 2) Claude Code → 3) iterér → 4) SEO/marketing → 5) iterér →
6) aflevering (Claude Design-deck)**. Kortere overblik: `byggeproces-og-aflevering.md`.

> Prompt-skabelon A og B nederst er de samme to prompts, som CRM-ens site-wizard
> (Sites → "+ Tilføj site") indlejrer på trin 1 (Design) og trin 6 (Aflevering).

---

## Trin 1 — Claude Design designer sitet
Brief Claude Design (claude.ai/design). Eksportér handoff-bundle (gzip-tar fra
`api.anthropic.com/v1/design/h/<token>`: README + chats + project/*.dc.html). **Prompt-skabelon A** nederst.

## Trin 2 — Claude Code bygger til ITGo Studio
1. Opret tomt repo `It-go/{{repo}}` (typisk `{{domæne}}` fx `firma.dk`).
2. Klon `astro-cms-starter` → byg sitet: Astro + content collections + typede blocks +
   `studio.config.yml` (Sveltia) + settings-singleton (`src/content/settings/site.json`).
   **Ingen `/admin` i repo'et.**
3. Sæt `site:` i `astro.config.mjs` til kundens domæne.
4. Indlejr ITGo Watch-tracking i `<head>` (key fra Watch/CRM).
5. `npm run build` skal være grøn + `npx astro check` = 0/0/0.

## Trin 3 — Registrér sitet i CRM under "Sites"  ← KERNE-ONBOARDING
**Forudsætning:** kunden findes i CRM (fanen **Kunder**) — alt kobles til en kunde (fakturering).

`crm.itgo.dk/admin` → **🌍 Sites** → **+ Tilføj site** (guidet wizard):

| Felt | Værdi | Note |
|---|---|---|
| Kunde * | `{{kunde}}` | påkrævet |
| Domæne | `{{domæne}}` (fx `firma.dk`) | |
| Slug | `{{slug}}` (fx `firma`) | **bruges i `?site=` + studio-URL** |
| Repo | `It-go/{{repo}}` | **UDEN `.git`!** gateway kalder `api.github.com/repos/<repo>/contents` |
| Branch | `main` | |
| Config-sti | `studio.config.yml` | (monorepo: `apps/web/studio.config.yml`) |
| Type | `static` | |

→ **Gem** (CMS-løsning tændes automatisk). Derefter:
1. **Log ud + ind** på `crm.itgo.dk/admin/login` — sites-listen ligger som et *snapshot* i din
   login-token (`itgo_session` JWT). Den opdateres kun ved nyt login.
2. Klik **"Redigér i Studio ↗"** på site-kortet (→ `studio.itgo.dk/admin?site={{slug}}`).

> API-alternativ (superadmin): `POST /sites` med `{ customer_id, domain, slug, repo, branch, config_path, site_type }`.

## Trin 4 — Deploy (Cloudflare Pages, git-forbundet)
1. CF Pages → **Connect to Git** → `It-go/{{repo}}`. Build: `npm run build`, output: `dist`.
   Auto-deploy ved push til `main`.
2. URL bliver `{{repo-med-bindestreger}}.pages.dev` — **Cloudflare laver `.` → `-`**
   (fx `firma.dk` → `firma-dk.pages.dev`).
3. Sæt i `studio.config.yml`:
   - `display_url: "https://{{repo-med-bindestreger}}.pages.dev"` — ellers viser Studio-previewet
     studio.itgo.dk-landingen i stedet for sitet.
   - `preview_path: "{{slug}}"` på `pages`-collection (+ `omit_default_locale_from_preview_path: true`)
     så previewet følger den redigerede side. Tilføj `public/_redirects`: `/forside / 301`
     (forsiden bor på `/` men har slug "forside").

## Trin 5 — Marketing / organisk SEO
- **Structured data** (settings-drevet): `HomeAndConstructionBusiness`/relevant LocalBusiness-type
  med NAP (navn, adresse, tlf), CVR (`vatID`/`taxID`), `geo`, `areaServed` (alle byer), `makesOffer`,
  åbningstider, `sameAs`. **Ingen fake review-schema.**
- **FAQ**-sektion (+ `FAQPage`-schema).
- **Performance**: billeder → WebP, ret-størrelse (CWV/mobil).
- **Landingssider**: en pr. ydelse + lokale "[ydelse] i [by]"-sider — unikt indhold, internt
  link-net, breadcrumbs. Undgå tynde doorway-sider.
- **NAP** i footer (navn/adresse/CVR) = lokal SEO-tillidssignal.
- **Permanent ITGo Studio-credit** hardkodet i footer (ikke et redigerbart felt).

## Trin 6 — Aflevering
Send **Prompt-skabelon B** til Claude Design → flot kunde-præsentation (PowerPoint-stil) i
kundens brand. Fed leverance.

## Off-site (kundens ansvar, efter go-live)
Peg det rigtige domæne på Pages · Google Search Console (indsend sitemap) · Google Business
Profile (kategori + NAP) · Google-anmeldelser · citations (Krak/De Gule Sider/Trustpilot).
Det er de største lokale ranking-faktorer.

---

## Gotchas (samlet — sparer timer)
- **Repo-felt i CRM Sites UDEN `.git`** (ellers 404 i editoren).
- **Log ud/ind efter Sites-registrering** (token-claim er et snapshot).
- **Gateway-PAT skal have adgang til det nye (private) repo** — tilføj repo til den fine-grained
  PAT's repo-scope, ellers "Kunne ikke indlæse editoren (HTTP 404)".
- **Udfyld IKKE `backend:` i `studio.config.yml`** — shell injicerer backend fra JWT (`load_config_file:false`).
- **`display_url` skal pege på det deployede site** (`.dk` → `-dk` på pages.dev).
- **`JWT_SECRET` deles CRM ↔ gateway** (mismatch = 401/login-loop).
- **ASCII-slugs** for æøå (fx `norresundby`, `bronderslev`, `hjorring`, `saeby`, `skorping`).
- **Site-repo `node_modules` kan have korrupt workerd-binær** → `rm -rf node_modules && npm i`
  før `astro build`, hvis build fejler mystisk.

---

## Prompt-skabelon A — Claude Design (design sitet)

```text
Design en moderne, konverterings-fokuseret hjemmeside (HTML/CSS/JS) til {{firma}} — en
{{branche}} i {{by/område}}. Målet er at skabe leads/kontakter. Sprog: DANSK. Skal bruges i
ITGo Studio bagefter (content-first, redigerbare sektioner).

BRAND
- Primær accentfarve: {{primær farve}}. Mørke flader: {{mørk farve}}. Lyse: {{lys/sand}}.
- Overskrifts-font: {{display-font}}. Brødtekst: {{body-font}}.
- Stemning/stil: {{fx industriel/robust / let/elegant / ...}}.

INDHOLD/SEKTIONER (tilpas pr. branche)
- Sticky header + tydelig "{{CTA}}" + telefon altid synlig.
- Hero med stærkt værdiløfte + dual CTA.
- {{antal}} ydelser som kort.
- Et interaktivt element der sælger (fx beregner / før-efter-slider / galleri).
- Referencer, kundeudtalelser, "om {{indehaver}}".
- Kontaktformular (validering + kvittering) + dækningsområde.
- Footer med {{evt. link til gammel side}} + "Webdesign af ITGo Studio".

Hvis noget er uklart: spørg før du bygger. Lever som ét sammenhængende design i brandet.
```

## Prompt-skabelon B — Claude Design (afleverings-præsentation)

```text
Lav en PROFESSIONEL PRÆSENTATION (PowerPoint-stil, 16:9) på dansk til vores kunde {{firma}}.
Det er en LEVERANCE/AFLEVERING af den nye hjemmeside, vi netop har bygget. Letforståelig,
sælgende — ingen teknisk jargon.

OM KUNDEN
- {{firma + evt. tidligere navn}}. {{kort om virksomhed, område, evt. siden-år, certificeringer}}.
  Tlf {{telefon}} · CVR {{cvr}}.

BRAND (brug konsekvent på alle slides)
- Accent {{primær farve}}, mørk {{mørk farve}}, lys {{lys farve}}, hvid.
- Overskrifter: {{display-font}}. Brødtekst: {{body-font}}. Stil: {{stemning}}.

HVAD VI HAR BYGGET (indhold til slides)
1. Ny professionel hjemmeside{{ + evt. rebrand fra X → Y}}.
2. Lead-fokuseret forside: {{hero, ydelser, interaktivt element, referencer, FAQ, kontakt}}.
3. Kunden kan selv redigere ALT i ITGo Studio (tekster, priser, billeder) uden kode — live på
   under et minut.
4. Organisk SEO: {{antal}} sider — forside + side pr. ydelse + lokale "[ydelse] i [by]"-sider —
   så de findes på Google ved fx "{{eksempel-søgning}}".
5. Bygget til at blive fundet: korrekt Google-opsætning (virksomheds-/ydelses-/FAQ-data),
   lynhurtig, 100% mobilvenlig.
6. Klar til at toppe Google lokalt: Google Business Profile + anmeldelser.

SLIDES (ca. 10-12): forside · {{evt. rejsen/rebrand}} · den nye forside · hvordan den skaber
kontakter · {{interaktivt salgsværktøj}} · {{evt. før/efter}} · "du styrer det selv" (ITGo
Studio) · fundet på Google (sider/by-sider) · teknisk styrke i klartekst · næste skridt (GBP +
anmeldelser) · afslutning + "Webdesign af ITGo Studio".

FORM: rene 16:9-slides (eksporterbar til PowerPoint/PDF), ikoner + tal + korte punkter, tone:
stolt, konkret, sælgende.
```
