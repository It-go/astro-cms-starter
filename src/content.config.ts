// ITGo Studio — content-model (C1 / ITG-812).
// Sider lever som markdown med frontmatter i src/content/pages/<locale>/<slug>.md.
// `blocks` = ordnet, typet liste (discriminated union på `type`) — 1:1 med @itgo/blocks
// og Sveltia-collections (studio.config.yml). Redigeres i ITGo Studio, committes via git.
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

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
const footer = z.object({
  type: z.literal("footer"),
  company: z.string().optional(),
  address: z.string().optional(),
  links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
});

const block = z.discriminatedUnion("type", [
  hero,
  text,
  image_grid,
  faq,
  contact_form,
  testimonials,
  cta,
  footer,
]);

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    seo,
    blocks: z.array(block).default([]),
  }),
});

export const collections = { pages };
export type Block = z.infer<typeof block>;
