# astro-cms-starter

ITGo Studio starter-template til kunde-sites. **Astro + content collections, da/en i18n, SEO.**
Indhold redigeres i **ITGo Studio** (Sveltia på `studio.itgo.dk`) og committes via git → Cloudflare
Pages auto-deployer. **Der er bevidst INGEN `/admin` i dette repo** — editoren er central.

> Status: C1 / ITG-812 (Phase C). Blocks er pt. vendored lokalt under `src/components/blocks/`;
> de erstattes af NPM-pakken `@itgo/blocks` i Wave 2 (C2 / ITG-813).

## Quickstart

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/  (statisk, klar til Cloudflare Pages)
npm run check    # astro check (typecheck)
```

## Struktur

```
src/
  content.config.ts        # content-model: pages-collection + blocks-union (zod)
  content/pages/
    da/forside.md          # dansk forside (frontmatter = title + seo + blocks)
    en/forside.md          # engelsk pendant (samme slug → hreflang-par)
  components/blocks/        # 8 core-blocks (Hero, Text, ImageGrid, Faq, ContactForm,
                            #   Testimonials, Cta, Footer) + Blocks.astro dispatcher
  layouts/Base.astro        # <head> SEO + canonical + hreflang + global styles
  pages/[...slug].astro     # router: da forside→"/", en→"/en", øvrige → /<locale>/<slug>
public/robots.txt
studio.config.yml           # ITGo Studio (Sveltia) collections — matcher blocks-union
```

## Sådan bruges den (onboarding, Phase B)

1. Klon denne template → nyt kunde-repo i It-go-org.
2. Sæt `site` i `astro.config.mjs` til kundens domæne.
3. Udfyld `backend` i `studio.config.yml` (git-gateway, sættes af ITGo Studio onboarding).
4. Brand via `@itgo/design-system` (Wave 2).
5. Kunden logger ind på `studio.itgo.dk`, redigerer, udgiver → live < 1 min.

## Leverance (design → byg → aflever)

Den fulde leverancemodel — Claude Design-prompt til at designe sitet, byg, organisk SEO og en
afleverings-prompt der genererer en kunde-præsentation — ligger i:

- **`docs/itgo-studio-site-playbook.md`** — komplet runbook (6 trin + onboarding + gotchas +
  deploy + SEO + Prompt-skabelon A & B).
- **`docs/byggeproces-og-aflevering.md`** — kort overblik + generisk afleverings-deck-prompt.

Det er de samme to prompts, som CRM-ens site-wizard (Sites → "+ Tilføj site") indlejrer på
trin 1 (Design) og trin 6 (Aflevering).

## Indholds-model

Hver side er en markdown-fil med frontmatter. `blocks` er en ordnet, typet liste — feltnavne og
typer matcher 1:1 `src/content.config.ts`, `src/components/blocks/*` og `studio.config.yml`.
Tilføj en blok-type ét sted → tilføj den de tre steder.

## i18n

`da` er default (på roden), `en` ligger under `/en`. Hold samme filnavn på tværs af `da/`+`en/` for
korrekte `hreflang`-par. SEO (`canonical`, `og:*`, `sitemap`) genereres automatisk.
