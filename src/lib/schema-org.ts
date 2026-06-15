// schema.org structured data builders (STD-8 / ITG-973).
// Rene funktioner: afled gyldig JSON-LD fra site-settings (STD-1). Kun gyldige værdier
// emittes — uparsbare/tomme felter udelades, så output altid validerer (Google Rich Results).
import type { SiteSettings } from "../content.config";

// Branche → schema.org @type. Ukendt/tom → LocalBusiness.
const BUSINESS_TYPES = new Set([
  "LocalBusiness",
  "HomeAndConstructionBusiness",
  "GeneralContractor",
  "Electrician",
  "Plumber",
  "RoofingContractor",
  "HVACBusiness",
  "Locksmith",
  "MovingCompany",
  "ProfessionalService",
  "Store",
  "SportsClub",
  "SportsActivityLocation",
]);

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const normalize = (s: string) =>
  s.toLowerCase().trim().replace(/ø/g, "o").replace(/å/g, "a").replace(/æ/g, "ae");

// da/en dag-token (præfiks) → index (man=0 … søn=6).
function dayIndex(token: string): number | null {
  const t = normalize(token);
  if (!t) return null;
  const map: Record<string, number> = {
    man: 0, mon: 0,
    tir: 1, tis: 1, tue: 1,
    ons: 2, wed: 2,
    tor: 3, thu: 3,
    fre: 4, fri: 4,
    lor: 5, sat: 5,
    son: 6, sun: 6,
  };
  return map[t.slice(0, 3)] ?? null;
}

// "Man–tor" / "Weekend" / "Hverdage" / "Mandag" → liste af dag-navne (tom hvis uparsbar).
function parseDays(raw: string): string[] {
  const s = normalize(raw);
  if (!s) return [];
  if (/^weekends?$/.test(s)) return [DAY_NAMES[5], DAY_NAMES[6]];
  if (/^(hverdag|hverdage|weekday|weekdays)$/.test(s)) return DAY_NAMES.slice(0, 5);
  if (/^(alle dage|dagligt|daily|everyday|every day)$/.test(s)) return [...DAY_NAMES];
  const parts = s.split(/[–—-]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length === 2) {
    const a = dayIndex(parts[0]);
    const b = dayIndex(parts[1]);
    if (a == null || b == null) return [];
    const out: string[] = [];
    for (let i = a; out.length <= 7; i = (i + 1) % 7) {
      out.push(DAY_NAMES[i]);
      if (i === b) break;
    }
    return out;
  }
  const single = dayIndex(parts[0] ?? s);
  return single == null ? [] : [DAY_NAMES[single]];
}

// "08–16" / "8-16" / "08:00-16:00" / "08.00 - 16.00" → { opens, closes } i HH:MM, ellers null.
function parseTimeRange(raw: string): { opens: string; closes: string } | null {
  const s = (raw ?? "").toLowerCase().trim();
  if (!s || /(lukket|closed)/.test(s)) return null;
  const times = s.match(/\d{1,2}(?:[.:]\d{2})?/g);
  if (!times || times.length < 2) return null;
  const norm = (t: string) => {
    const [h, m = "00"] = t.split(/[.:]/);
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  };
  return { opens: norm(times[0]), closes: norm(times[1]) };
}

function openingHoursSpec(hours: SiteSettings["opening_hours"]): Array<Record<string, unknown>> {
  const spec: Array<Record<string, unknown>> = [];
  for (const h of hours ?? []) {
    const days = parseDays(h.day ?? "");
    const time = parseTimeRange(h.hours ?? "");
    if (days.length === 0 || !time) continue;
    spec.push({ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens: time.opens, closes: time.closes });
  }
  return spec;
}

// "Eksempelvej 1, 9000 Aalborg" → PostalAddress (løst parset). addressCountry = DK.
function postalAddress(address?: string): Record<string, unknown> | null {
  const a = (address ?? "").trim();
  if (!a) return null;
  const out: Record<string, unknown> = { "@type": "PostalAddress", addressCountry: "DK" };
  const parts = a.split(",").map((p) => p.trim()).filter(Boolean);
  const tail = parts.length > 1 ? parts[parts.length - 1] : "";
  const zipCity = tail.match(/^(\d{4})\s+(.+)$/);
  if (zipCity) {
    out.streetAddress = parts.slice(0, -1).join(", ");
    out.postalCode = zipCity[1];
    out.addressLocality = zipCity[2];
  } else {
    out.streetAddress = a;
  }
  return out;
}

function businessType(raw?: string): string {
  const t = (raw ?? "").trim();
  return BUSINESS_TYPES.has(t) ? t : "LocalBusiness";
}

/** LocalBusiness JSON-LD fra site-settings, eller null hvis intet firmanavn. */
export function localBusinessJsonLd(
  site: SiteSettings,
  opts: { siteUrl: string },
): Record<string, unknown> | null {
  const name = (site.company ?? "").trim();
  if (!name) return null;

  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": businessType(site.business_type),
    name,
    url: opts.siteUrl,
  };
  if (site.phone) ld.telephone = site.phone;
  if (site.email) ld.email = site.email;
  if (site.logo) ld.logo = new URL(site.logo, opts.siteUrl).toString();

  const address = postalAddress(site.address);
  if (address) ld.address = address;

  const lat = Number(site.geo?.latitude);
  const lng = Number(site.geo?.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
    ld.geo = { "@type": "GeoCoordinates", latitude: lat, longitude: lng };
  }

  const sameAs = [site.social?.facebook, site.social?.instagram, site.social?.linkedin]
    .map((u) => (u ?? "").trim())
    .filter(Boolean);
  if (sameAs.length) ld.sameAs = sameAs;

  if (site.price_range) ld.priceRange = site.price_range;

  const hours = openingHoursSpec(site.opening_hours);
  if (hours.length) ld.openingHoursSpecification = hours;

  return ld;
}

/** BreadcrumbList JSON-LD, eller null hvis < 2 trin. */
export function breadcrumbJsonLd(
  items: Array<{ name: string; item: string }>,
): Record<string, unknown> | null {
  const clean = items.filter((i) => i.name && i.item);
  if (clean.length < 2) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: clean.map((i, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: i.name,
      item: i.item,
    })),
  };
}
