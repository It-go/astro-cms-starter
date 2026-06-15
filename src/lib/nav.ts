// Navigation-resolver (STD-3 / ITG-968). Ren funktion: oversæt site-settings `menu`
// til render-klare links (locale-korrekt href + label) og rapportér døde interne links.
export interface MenuItem {
  label: string;
  label_en?: string;
  link: string;
}
export interface ResolvedNavItem {
  label: string;
  href: string;
  external: boolean;
  current: boolean;
}

// Byggede ruter uden for pages-collection (så de ikke fejlagtigt flagges som døde links).
const EXTRA_INTERNAL_ROUTES = new Set(["nyheder"]);

const isExternal = (link: string) => /^(https?:|mailto:|tel:|\/\/)/i.test(link.trim());
const normalizeSlug = (link: string) => link.trim().replace(/^\/+|\/+$/g, "");
const stripTrailing = (p: string) => p.replace(/\/+$/, "") || "/";

export function resolveNav(
  menu: MenuItem[],
  opts: { locale: string; pathname: string; knownSlugs: Set<string> },
): { items: ResolvedNavItem[]; deadLinks: string[] } {
  const { locale, pathname, knownSlugs } = opts;
  const isEn = locale === "en";
  const curPath = stripTrailing(pathname);
  const items: ResolvedNavItem[] = [];
  const deadLinks: string[] = [];

  for (const m of menu ?? []) {
    const label = (isEn && m.label_en ? m.label_en : m.label)?.trim() ?? "";
    if (!label) continue;

    const raw = (m.link ?? "").trim();
    if (isExternal(raw)) {
      items.push({ label, href: raw, external: true, current: false });
      continue;
    }

    const slug = normalizeSlug(raw);
    const isHome = slug === "" || slug === "forside";
    let href: string;
    if (isHome) {
      href = isEn ? "/en" : "/";
    } else if (knownSlugs.has(slug)) {
      // Pages-collection-side: findes pr. locale → locale-præfiks.
      href = isEn ? `/en/${slug}` : `/${slug}`;
    } else {
      // Ikke-lokaliseret rute (fx nyheder) eller ukendt → root-sti uden locale-præfiks.
      href = `/${slug}`;
      if (!EXTRA_INTERNAL_ROUTES.has(slug)) deadLinks.push(slug);
    }

    items.push({ label, href, external: false, current: stripTrailing(href) === curPath });
  }

  return { items, deadLinks };
}
