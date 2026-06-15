# ITG-968 · STD-3 — Menu/navigation-editor (drag-sortér)

EPIC: ITG-965 (CMS-STD). Bygger på STD-1 (site-settings). **Stacked på STD-8 (#11)** —
deler site-settings-filer; merges i rækkefølge #11 → denne. DoD: ITG-489.

## Mål
Kunden redigerer navigationen selv (menupunkter + rækkefølge) i ITGo Studio uden kode.
Renderes som site-wide header med JS-fri mobil-burger.

## Scope (pass 1)
- **Flad menu** (ingen dropdowns endnu — "evt. dropdowns" = pass 2).
- `menu`-felt i site-settings: liste af `{ label, label_en?, link }` med Sveltia drag-sortér.
- Astro: ren resolver + `SiteHeader`-komponent → header + mobil-burger.
- da/en: `label_en` falder tilbage til `label`; interne links får locale-korrekt URL.
- Dødt internt link → **build-time advarsel** (console.warn), aldrig crash.

## Designbeslutninger
- **link-semantik**: ekstern hvis `http(s):`/`mailto:`/`tel:`/`//`; ellers intern slug
  (`""`/`forside` = forside → `/` el. `/en`; `om-os` → `/om-os` el. `/en/om-os`).
- **dead-link**: kendte slugs = pages-collection + `EXTRA_INTERNAL_ROUTES` (`nyheder`).
- **mobil-burger**: JS-fri checkbox-hack (virker uden JS); desktop = vandret nav fra 640px.
- **aria**: `aria-current="page"` på aktiv, `aria-label` på nav/burger.
- Header renderes kun når der er menupunkter (bagudkompatibelt — sider uden menu uændret).

## Filer
1. `src/content.config.ts` — `menu` i `siteSettingsSchema`.
2. `src/lib/settings.ts` — `menu: []` i DEFAULTS.
3. `studio.config.yml` — `menu` list-felt (label/label_en/link + hints).
4. `src/lib/nav.ts` — `resolveNav()` (ren funktion + dead-link-rapport).
5. `src/components/SiteHeader.astro` — header + nav + burger + scoped CSS.
6. `src/layouts/Base.astro` — render `<SiteHeader>` før `<slot/>`.
7. `src/content/settings/site.yml` — demo-menu.
8. `docs/site-settings.md` — menu-afsnit.

## Verifikation
- [ ] `check:model` · `astro check` · `build` grønne.
- [ ] `dist/` header har menu-links med locale-korrekte hrefs (da `/om-os`, en `/en/om-os`).
- [ ] Aktiv side får `aria-current="page"`.
- [ ] Dødt internt link → console.warn ved build (verificeres med temp-link).

## Out of scope (pass 2)
- Nested dropdowns; live in-context-binding (data-itgo-field) for menu.
