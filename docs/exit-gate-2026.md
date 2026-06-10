# C3 exit-gate — edit→commit→deploy (2026-06-10)

Bevis for at hele ITGo Studio-kæden virker end-to-end, FØR kunde-retrofit (Phase E). Ref: ITG-814.

## Kæden

```
studio.itgo.dk (shell)  →  HQ-login (crm.itgo.dk) sætter itgo_session-JWT på .itgo.dk
   → site-vælger (kun dine sites, fra JWT)  →  /admin?site=<slug>
   → shell henter sitets studio.config.yml via gateway + mounter ITGo Studio (Sveltia)
   → redigér indhold  →  Udgiv
   → gateway.studio.itgo.dk validerer JWT + site-tilladelse  →  GitHub Content API (PAT) commit
   → Cloudflare Pages auto-deploy  →  live ~2 min
```

## Hvad er bevist (automatisk, 2026-06-10)

| Trin | Bevis |
|---|---|
| Gateway commit→deploy | C3.v1: gateway PUT → GitHub commit → CF Pages auto-deploy, live < 2 min |
| HQ-login → JWT på .itgo.dk | ITG-831 deployet (crm.itgo.dk login sætter itgo_session + token-redirect) |
| Shell loader per-site config | Playwright: studio.itgo.dk/admin?site=demo → ITGo Studio mounter med demoens collections (Sider: Forside, Om os) |
| Gateway auth + authz | JWT-valideret Bearer; *.itgo.dk + *.pages.dev CORS; 11/11 tests |
| Konvention skalerer | astro-cms-starter studio.config.yml ↔ content.config.ts 1:1 (check:model-gate) |
| Branding | ITGo Studio default i forken; "Powered by Sveltia" skjult |

## Build-tid

CF Pages-build af starteren: ~20–40 sek (< 90 sek-krav). ✓

## Tilbage (MANUELT — kan ikke automatiseres)

C3's DoD kræver disse, som du skal udføre:

- [ ] **Video** af edit→commit→deploy < 2 min (skærmoptagelse af det fulde flow).
- [ ] **Ikke-teknisk bruger-test**: en person uden teknisk baggrund logger ind på studio.itgo.dk, ændrer en tekst-blok, erstatter et billede, klikker Udgiv, og ser ændringen live — uden hjælp. Bekræft at det er intuitivt.
- [ ] **Rigtig login** (jeg testede med injiceret session-cookie; du skal bekræfte email+password→cookie-flowet mod crm.itgo.dk).
- [ ] Ingen JS-fejl i editoren under hele flowet (tjek konsollen).

Når disse er gjort → C3 Done → Phase E (kunde-retrofit) er unblocked.
