# Branding

Kunden ser **ITGo Studio** — aldrig Sveltia eller GitHub. Branding styres via `studio.config.yml`
(ingen kode-ændringer).

## Editor-branding (`studio.config.yml`)

```yaml
app_title: ITGo Studio          # navnet i editor-toppen + login-skærm
logo:
  src: /studio-logo.svg         # vises i editor-header; pr.-kunde-logo lægges i public/
  show_in_header: true
```

- `app_title` — overstyr pr. kunde hvis de skal se deres eget navn (fx "Dit Firma — Studio").
- `logo.src` — peg på en fil i kundens `public/` (svg/png). Default = ITGo-mærket.
- Defaults (når intet sættes) er allerede ITGo Studio + ITGo-logo (sat i forken, ikke Sveltia).

## Site-branding (selve hjemmesiden)

Sitets udseende (farver, fonte) styres i `src/styles/` (Tailwind/CSS-variabler) — **ikke** i CMS'et.
Det er bevidst: kundens *design* er fastlagt af os; kunden redigerer kun *indhold*. En accent-farve
kan eksponeres som en CSS-variabel hvis en kunde skal kunne skifte den.

## Onboarding-checklist (pr. kunde)

1. Klon starteren → nyt repo `It-go/<kunde>`.
2. Læg kundens logo i `public/studio-logo.svg` (+ evt. favicon).
3. Sæt `app_title` hvis de skal se eget navn.
4. Backend (git-gateway) + site-registrering i HQ sættes i Phase B (ikke i config'en her).
