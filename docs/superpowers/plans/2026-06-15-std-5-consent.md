# ITG-970 · STD-5 — Cookie-consent + script-gating + consent-log

EPIC: ITG-965 (CMS-STD). Aktiverer STD-4's consent-gating. Bygget i isoleret worktree
(parallel-session-hazard). DoD: ITG-489.

## Mål
GDPR-rigtig cookie-consent kunden nemt slår til. Banner med 3 kategorier (nødvendige/
statistik/marketing); STD-4's scripts kører FØRST efter samtykke i deres kategori. Valg
huskes + kan ændres; samtykke logges.

## Designbeslutninger
- **Consent-state** i `localStorage["itgo:consent"]` = `{necessary:true, statistics, marketing, ts, v}`.
  STD-4 læser allerede `c.statistics`/`c.marketing` → 1:1, ingen ændring i STD-4.
- **Banner** (`ConsentBanner.astro`): vises kun når `consent.enabled`. Knapper: Accepter alle ·
  Kun nødvendige · Tilpas (kategori-toggles → Gem). Skjult hvis gyldigt samtykke allerede findes.
- **Hændelse**: ved gem dispatches `window` `itgo:consent-changed` → STD-4 loader straks de
  tilladte scripts. Default (intet samtykke) → intet ikke-nødvendigt loader (accept-krav 1).
- **Genåbn**: footer-knap "Cookie-indstillinger" (`[data-itgo-consent-open]`) → banner igen.
- **Consent-log**: client-log i `localStorage["itgo:consent-log"]` (sidste 50, m. tidsstempel) +
  valgfri `navigator.sendBeacon` til `consent.log_url` hvis sat (server-audit kobles når endpoint findes).
- **i18n**: indbyggede da/en-tekster; `message`/`message_en` + `policy_url` overstyrbare i settings.
- **`@itgo/consent`** = i starteren lokal `src/lib/consent.ts` (typer + default-tekster) + komponent
  (NPM-pakke er aspirational som @itgo/blocks).

## Filer
1. `src/content.config.ts` — `consent`-objekt i `siteSettingsSchema`.
2. `src/lib/settings.ts` — `consent: { enabled: false }` i DEFAULTS.
3. `studio.config.yml` — `consent`-felter (enabled/message/message_en/policy_url/log_url).
4. `src/lib/consent.ts` — typer + default da/en-tekster.
5. `src/components/ConsentBanner.astro` — banner-UI + inline controller.
6. `src/layouts/Base.astro` — render banner + footer "Cookie-indstillinger"-knap.
7. `docs/site-settings.md` — consent-afsnit.

## Verifikation
- [ ] `check:model` · `astro check` · `build` grønne.
- [ ] consent.enabled=false → intet banner (default/demo).
- [ ] enabled + tracking (temp): banner i `dist`, knapper + kategori-toggles til stede;
      INGEN eager tracking-tag (gating intakt fra STD-4).
- [ ] Footer "Cookie-indstillinger"-knap til stede.

## Out of scope (pass 2)
- Server-side consent-audit-log-endpoint (gateway); konfigurerbare kategorier; Consent Mode v2 default-tags.
