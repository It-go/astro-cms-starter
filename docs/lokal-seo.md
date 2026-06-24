# Lokal-SEO-motor (ITG-1036)

Håndværkere og service­virksomheder vindes på lokal søgning — *"tømrer Aalborg"*, *"murer i Hobro"*.
Motoren genererer en **landingsside pr. by/område** med korrekt struktur, intern linking og SEO,
så ét site dækker mange byer uden at hånd­skrive hver side.

## Sådan virker det

1. Beskriv din **service × område-matrix** i `localseo.config.json`
   (kopiér `localseo.config.example.json`).
2. Kør `npm run generate:localseo`.
3. For hvert område skrives `src/content/pages/<locale>/<prefix>-<slug>.md` med blokkene:
   **hero → brødtekst → FAQ → områdeliste → click-to-call → CTA**.
4. `npm run check && npm run build` — siderne er nu live på `/<prefix>-<slug>`.

Siderne er bagefter helt almindelige `pages`-entries → **redigerbare i ITGo Studio** som alt andet.

## Hvorfor det rykker på lokal SEO

- **Områdeliste-blokken** (`area_list`) linker hver by-side til *alle* de andre →
  en intern link-graf der signalerer geografisk dækning til Google.
- **Templated, men unik** SEO-titel + beskrivelse pr. by (`{service} i {by} | {firma}`).
- Hver side arver sitets **LocalBusiness-schema** (STD-8: branche, geo, prisniveau).
- **Click-to-call** + CTA på hver side → siden konverterer, ikke bare rangerer.

## Config-felter

| Felt | Påkrævet | Note |
|---|---|---|
| `service.name` / `service.slug_prefix` / `service.noun` | ja | fx `Tømrer` / `tomrer` / `Tømrerarbejde` |
| `business`, `phone`, `locale` | nej | `phone` sat → click-to-call tilføjes; `locale` default `da` |
| `areas[].name` / `areas[].slug` | ja | fx `Aalborg` / `aalborg` → `/tomrer-aalborg` |
| `areas[].intro` / `body` / `description` / `image` / `faq` | nej | udeladt = templated dansk standardtekst |

`--force` overskriver eksisterende sider (ellers springes de over, så manuelle/Studio-redigerede sider bevares).

## Næste (chunk 2)

AI udfylder `intro`/`body`/`faq` pr. by ud fra service + by + virksomhedens tone
(genbruger CRM'ens AI-endpoint, ITG-936), så teksten bliver unik og lokalt forankret
uden at håndværkeren skal skrive 30 sider.
