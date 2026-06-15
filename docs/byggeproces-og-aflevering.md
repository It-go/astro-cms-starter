# ITGo Studio — byggeproces & aflevering

Kort, genbrugelig model for at levere et kunde-site. Den fulde runbook (onboarding, gotchas,
deploy, SEO) ligger i `itgo-studio-site-playbook.md`.

## Pipeline (6 trin)

1. **Claude Design designer sitet** — HTML/CSS/JS-mockup med kundens brand (farver, fonte,
   tone). Eksporteres som handoff-bundle (`api.anthropic.com/v1/design/h/<token>`).
2. **Claude Code bygger hjemmesiden til ITGo Studio** — porteres til Astro + content
   collections + Sveltia-config (`studio.config.yml`), opdelt i typede, redigerbare blocks.
   Ingen `/admin` i repo'et; editoren er central på `studio.itgo.dk`. Deploy via
   git-forbundet Cloudflare Pages.
3. **Vi retter til** — iterationer på design, indhold og responsivt layout (mobil).
   Verificeres i rigtig browser (Playwright + headless screenshots), 0 overflow, 0 fejl.
4. **Vi bygger alt marketing (organisk SEO)** — structured data (LocalBusiness + Service +
   FAQPage + BreadcrumbList), FAQ, performance (WebP, lette billeder), NAP-konsistens, og
   **dedikerede service-/by-landingssider**. Indhold migreres + forbedres fra evt. gammel side.
5. **Vi retter til** — endnu en iterationsrunde på indhold/SEO/visuelt.
6. **Aflevering: prompt til rapport via Claude Design** — vi sender en prompt til Claude
   Design, der genererer en **kunde-præsentation (PowerPoint-stil)** om hvad der er bygget.
   Fed aflevering der gør kunden tryg og stolt. Prompten ligger nedenfor.

## Off-site (kundens ansvar, efter aflevering)
Google Business Profile, Google-anmeldelser, citations (Krak/De Gule Sider/Trustpilot),
Google Search Console (indsend sitemap). De største lokale ranking-faktorer.

---

## Trin 6 — prompt til Claude Design (afleverings-præsentation)

Indsæt nedenstående i Claude Design (claude.ai/design). Udfyld `{{pladsholdere}}` pr. projekt.
Outputtet er flotte 16:9-slides (kan eksporteres/printes til PowerPoint/PDF). Dette er den samme
prompt som CRM-wizard'ens trin 6 (Aflevering) genererer med kunde-/brand-felterne injiceret.

```text
Lav en PROFESSIONEL PRÆSENTATION (PowerPoint-stil, 16:9) på dansk til vores kunde {{firma}}.
Det er en LEVERANCE/AFLEVERING af den nye hjemmeside, vi netop har bygget. Den skal på en
letforståelig, sælgende måde vise kunden, hvad de har fået, og hvorfor det skaber flere kunder.
Ingen teknisk jargon — tal til kundens fag.

OM KUNDEN
- {{firma + evt. tidligere navn}}. {{kort om virksomhed, område, evt. siden-år, certificeringer}}.
  Tlf {{telefon}} · CVR {{cvr}}.

BRAND / VISUEL STIL (brug den konsekvent på alle slides)
- Accent {{primær farve}}, mørke flader {{mørk farve}}, lyse {{lys/sand}}, hvid.
- Overskrifter: {{display-font}}. Brødtekst: {{body-font}}.
- Stil: {{stemning — fx industriel/robust / let/elegant}}.

HVAD VI HAR BYGGET (indhold til slides)
1. Ny professionel hjemmeside{{ + evt. rebrand fra X → Y}}.
2. Lead-fokuseret forside: {{hero, ydelser, interaktivt element, referencer, FAQ, kontakt}}.
3. Kunden kan selv redigere ALT i ITGo Studio (tekster, priser, billeder) uden kode —
   ændringer er live på under et minut.
4. Komplet organisk SEO: {{antal}} sider — forside + en dedikeret side pr. ydelse + lokale
   "[ydelse] i [by]"-sider — så kunden bliver fundet på Google ved fx "{{eksempel-søgning}}".
5. Bygget til at blive fundet: korrekt Google-opsætning (virksomheds-, ydelses- og FAQ-data),
   lynhurtig (billeder gjort ~98% lettere), 100% mobilvenlig.
6. Klar til at toppe Google lokalt: kobles til Google Business Profile + kundeanmeldelser.

SLIDE-STRUKTUR (ca. 10-12 slides)
1. Forside: "{{firma}} — din nye hjemmeside" + undertitel + dato.
2. {{evt. rejsen/rebrand: fra gammelt navn → nyt navn}}.
3. Den nye forside (vis layout/sektioner).
4. Sådan skaber siden kontakter: hero, tydelige CTA'er, kontaktformular, ring-nu på mobil.
5. {{interaktivt salgsværktøj — fx beregner / før-efter-slider}}.
6. {{evt. ekstra produkt-/galleri-slide}}.
7. "Du styrer det selv" — ITGo Studio: ret tekster/priser/billeder, live på 1 minut,
   ingen udvikler nødvendig.
8. Fundet på Google: {{antal}} sider, lokale by-sider, ydelses-sider.
9. Teknisk styrke i klartekst: hurtig, mobilvenlig, korrekt sat op til Google (uden jargon).
10. Næste skridt for at toppe Google: Google Business Profile + anmeldelser.
11. Afslutning: kontakt + "Webdesign af ITGo Studio".

FORM
Rene, flotte slides i 16:9 (kan eksporteres/printes til PowerPoint/PDF). Brug ikoner, tal og
korte punkter — ikke lange tekstblokke. Tone: stolt, konkret og sælgende — en aflevering
kunden bliver glad og tryg af.
```
