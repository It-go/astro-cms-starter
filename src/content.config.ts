// ITGo Studio — content-model (C1 / ITG-812).
// Sider lever som markdown med frontmatter i src/content/pages/<locale>/<slug>.md.
// `blocks` = ordnet, typet liste (discriminated union på `type`) — 1:1 med @itgo/blocks
// og Sveltia-collections (studio.config.yml). Redigeres i ITGo Studio, committes via git.
import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";
import { parse as parseYaml } from "yaml";

const seo = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    og_image: z.string().optional(),
  })
  .optional();

// ── Block-skemaer (matcher @itgo/blocks manifest) ────────────────────────────
const hero = z.object({
  type: z.literal("hero"),
  heading: z.string().optional(),
  subheading: z.string().optional(),
  image: z.string().optional(),
  cta_label: z.string().optional(),
  cta_href: z.string().optional(),
});
const text = z.object({
  type: z.literal("text"),
  heading: z.string().optional(),
  body: z.string().optional(), // richtext (HTML/markdown)
});
const image_grid = z.object({
  type: z.literal("image_grid"),
  heading: z.string().optional(),
  columns: z.number().min(1).max(6).default(3),
  images: z.array(z.object({ src: z.string(), alt: z.string().optional() })).default([]),
});
const faq = z.object({
  type: z.literal("faq"),
  heading: z.string().optional(),
  items: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
});
const contact_form = z.object({
  type: z.literal("contact_form"),
  heading: z.string().optional(),
  submit_label: z.string().default("Send"),
  form_key: z.string().default("contact"),
  fields: z
    .array(
      z.object({
        name: z.string(),
        label: z.string().optional(),
        type: z.enum(["text", "email", "tel", "textarea"]).default("text"),
        required: z.boolean().default(false),
      }),
    )
    .default([]),
});
const testimonials = z.object({
  type: z.literal("testimonials"),
  heading: z.string().optional(),
  items: z.array(z.object({ quote: z.string(), author: z.string().optional() })).default([]),
});
const cta = z.object({
  type: z.literal("cta"),
  heading: z.string().optional(),
  body: z.string().optional(),
  button_label: z.string().optional(),
  button_href: z.string().optional(),
});
// Konverterings-blocks (GROWTH-10 / ITG-987) — service-virksomheders leads.
const click_to_call = z.object({
  type: z.literal("click_to_call"),
  heading: z.string().optional(),
  note: z.string().optional(), // fx "Vi svarer hverdage 7-17"
  phone: z.string().optional(),
  label: z.string().default("Ring nu"),
  sticky_mobile: z.boolean().default(true), // fast bund-bar på mobil
});
const reviews = z.object({
  type: z.literal("reviews"),
  heading: z.string().optional(),
  show_rating: z.boolean().default(true),
  items: z
    .array(
      z.object({
        author: z.string(),
        rating: z.number().min(1).max(5).default(5),
        text: z.string().optional(),
        source: z.string().optional(), // fx "Google"
      }),
    )
    .default([]),
});
const footer = z.object({
  type: z.literal("footer"),
  company: z.string().optional(),
  address: z.string().optional(),
  links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
});
// Lokal-SEO (ITG-1036): intern linking til nabo-områder/by-sider — styrker lokal SEO
// (område-dækning + intern link-graf). Genereres af scripts/generate-area-pages.mjs.
const area_list = z.object({
  type: z.literal("area_list"),
  heading: z.string().optional(),
  intro: z.string().optional(),
  items: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
});
// Håndværker-pakke (PACK-CRAFT / ITG-774): generelle blocks til service-virksomheder
// (valideres på JM Tømrer, sælges bredt). `reviews` findes allerede (GROWTH-10 / ITG-987).
const services = z.object({
  type: z.literal("services"),
  heading: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(), // fx et emoji — intet ikon-bibliotek nødvendigt
      }),
    )
    .default([]),
});
const cases = z.object({
  type: z.literal("cases"),
  heading: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string(),
        image: z.string().optional(),
        description: z.string().optional(),
        href: z.string().optional(), // valgfrit link til fx en større sag/galleri
      }),
    )
    .default([]),
});

// Sportsklub-pakke (PACK-CLUB / ITG-775): generel klub-pakke (valideres på Terndrup IF,
// sælges til andre danske klubber). `member_signup` renderer kun selve formularen — samme
// mønster som `contact_form` (data-st-form-hook); den faktiske indsendelse→HQ Leads-kobling
// er STUDIO-FORMS (ITG-771), et andet lag/repo, ikke bygget her.
const match_program = z.object({
  type: z.literal("match_program"),
  heading: z.string().optional(),
  items: z
    .array(
      z.object({
        date: z.coerce.date(),
        opponent: z.string(),
        home_away: z.enum(["hjemme", "ude"]).default("hjemme"),
        result: z.string().optional(), // fx "3-1" — tomt = ikke spillet endnu
      }),
    )
    .default([]),
});
const team_roster = z.object({
  type: z.literal("team_roster"),
  heading: z.string().optional(),
  items: z
    .array(
      z.object({
        name: z.string(),
        position: z.string().optional(),
        number: z.number().optional(),
        image: z.string().optional(),
      }),
    )
    .default([]),
});
// Trækker direkte fra `news`-collection (GROWTH-4 / ITG-981) i stedet for en dubleret
// manuel liste — én sandhed for nyheder, RSS-feedet og denne blok.
const news_feed = z.object({
  type: z.literal("news_feed"),
  heading: z.string().optional(),
  limit: z.number().min(1).max(12).default(3),
});
const sponsor_grid = z.object({
  type: z.literal("sponsor_grid"),
  heading: z.string().optional(),
  items: z
    .array(
      z.object({
        logo: z.string().optional(),
        name: z.string(),
        link: z.string().optional(),
      }),
    )
    .default([]),
});
const member_signup = z.object({
  type: z.literal("member_signup"),
  heading: z.string().optional(),
  intro: z.string().optional(),
  submit_label: z.string().default("Tilmeld"),
  form_key: z.string().default("member-signup"),
  fields: z
    .array(
      z.object({
        name: z.string(),
        label: z.string().optional(),
        type: z.enum(["text", "email", "tel", "textarea"]).default("text"),
        required: z.boolean().default(false),
      }),
    )
    .default([]),
});

const block = z.discriminatedUnion("type", [
  hero,
  text,
  image_grid,
  faq,
  contact_form,
  testimonials,
  cta,
  click_to_call,
  reviews,
  footer,
  area_list,
  services,
  cases,
  match_program,
  team_roster,
  news_feed,
  sponsor_grid,
  member_signup,
]);

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    seo,
    blocks: z.array(block).default([]),
  }),
});

// Nyheder/blog — flad collection (markdown-body renderes). Demo-scaffold; kunder kan slette.
const news = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    // GROWTH-4 (ITG-981): kladde + planlagt publicering. draft=true skjuler altid;
    // publishAt i fremtiden = skjult indtil næste build efter tidspunktet (cron-rebuild).
    draft: z.boolean().default(false),
    publishAt: z.coerce.date().optional(),
  }),
});

// ── Site-settings (STD-1 / ITG-966) ──────────────────────────────────────────
// Globalt kontrolpanel (firma/kontakt) — ÉT entry pr. site. Sveltia skriver felterne
// fladt i roden af site.yml; file()-parseren wrapper det som { site: data } → ét entry
// med id "site". Alle felter er valgfri (.default/.optional), så et manglende/tomt felt
// ALDRIG giver build-crash (jf. accept-krav). Holdes 1:1 med studio.config.yml (check:model).
export const siteSettingsSchema = z.object({
  company: z.string().default(""),
  // Virksomhed (ITG-1006): juridisk navn (ApS) — bruges som legalName i JSON-LD. cvr findes nedenfor.
  legal_name: z.string().optional(),
  // GROWTH-9 (ITG-986): visuelt tema (token-pakke) — sættes på <html data-theme>. Default = uændret look.
  theme: z.enum(["minimal-sort", "varm-haandvaerk", "klassisk-blaa"]).default("minimal-sort"),
  // Brand-farver (labelisér chunk 4 / ITG-1035): kunde-specifikke farver der overrider det
  // valgte temas --st-*-vars via inline style på <html>. Tom = temaets farver bruges uændret.
  brand: z
    .object({
      color_primary: z.string().optional(), // → --st-color-brand (CTA/accent/links)
      color_on_primary: z.string().optional(), // → --st-color-on-brand (tekst på brand-flader)
      color_heading: z.string().optional(), // → --st-color-heading (overskrifter)
    })
    .default({}),
  cvr: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  opening_hours: z
    .array(z.object({ day: z.string().default(""), hours: z.string().default("") }))
    .default([]),
  social: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      linkedin: z.string().optional(),
    })
    .default({}),
  // Brand-assets (ITG-1005): logo (header/footer/JSON-LD), favicon (<head>), default OG-billede.
  logo: z.string().optional(),
  favicon: z.string().optional(),
  og_image_default: z.string().optional(),
  // SEO / schema.org (STD-8): branche-type + geo + prisniveau → LocalBusiness JSON-LD.
  business_type: z.string().optional(),
  geo: z
    .object({ latitude: z.string().optional(), longitude: z.string().optional() })
    .default({}),
  price_range: z.string().optional(),
  // Navigation (STD-3): flad menu, drag-sorteret i Studio. label_en valgfri (fallback = label).
  menu: z
    .array(
      z.object({
        label: z.string().default(""),
        label_en: z.string().optional(),
        link: z.string().default(""),
      }),
    )
    .default([]),
  // Scripts & tags (STD-4): consent-gated tracking-id'er. Presence = on/off.
  tracking: z
    .object({
      ga4_id: z.string().optional(),
      gtm_id: z.string().optional(),
      meta_pixel_id: z.string().optional(),
    })
    .default({}),
  // Cookie-consent (STD-5): banner slås til via enabled; tekst/policy/log valgfri.
  consent: z
    .object({
      enabled: z.boolean().default(false),
      message: z.string().optional(),
      message_en: z.string().optional(),
      policy_url: z.string().optional(),
      log_url: z.string().optional(),
    })
    .default({}),
  // SEO-defaults (labelisér chunk 5): fallback-beskrivelse + søgemaskine-verifikations-tags.
  seo_defaults: z
    .object({
      default_description: z.string().optional(),
      google_site_verification: z.string().optional(),
      bing_site_verification: z.string().optional(),
    })
    .default({}),
  // 301/302-redirects (STD-7): emitteres til Cloudflare Pages _redirects ved build.
  redirects: z
    .array(
      z.object({
        from: z.string().default(""),
        to: z.string().default(""),
        permanent: z.boolean().default(true),
      }),
    )
    .default([]),
  // Privacy-venlig statistik (STD-9): cookieløs Cloudflare Web Analytics-token.
  analytics: z.object({ cf_web_analytics_token: z.string().optional() }).default({}),
});

const settings = defineCollection({
  loader: file("src/content/settings/site.yml", {
    parser: (text) => ({ site: (parseYaml(text) as Record<string, unknown>) ?? {} }),
  }),
  schema: siteSettingsSchema,
});

export const collections = { pages, news, settings };
export type Block = z.infer<typeof block>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
