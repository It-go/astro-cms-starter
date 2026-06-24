/**
 * Lokal-SEO-motor (ITG-1036) — generér kryds-linkede by-/område-landingssider.
 *
 * Læser en service×område-matrix (localseo.config.json, ellers .example) og skriver én
 * markdown-side pr. område til src/content/pages/<locale>/<prefix>-<slug>.md. Hver side får
 * hero + brødtekst + FAQ + områdeliste (links til ALLE andre områder = intern lokal-SEO-graf)
 * + click-to-call + CTA, samt templated SEO-titel/beskrivelse. Siderne er bagefter helt
 * almindelige `pages`-entries → redigerbare i ITGo Studio, og AI kan udfylde teksten (chunk 2).
 *
 * Brug:
 *   npm run generate:localseo                 # bruger localseo.config.json (ellers .example)
 *   npm run generate:localseo -- min.json     # anden config
 *   npm run generate:localseo -- --force      # overskriv eksisterende sider (ellers springes de over)
 *
 * Efter kørsel: `npm run check` + `npm run build`.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify as toYaml } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const force = args.includes("--force");
const explicit = args.find((a) => !a.startsWith("--"));

const configPath = explicit
  ? join(root, explicit)
  : existsSync(join(root, "localseo.config.json"))
    ? join(root, "localseo.config.json")
    : join(root, "localseo.config.example.json");

if (!existsSync(configPath)) {
  console.error(`✗ Fandt ingen config: ${configPath}`);
  process.exit(1);
}

const cfg = JSON.parse(readFileSync(configPath, "utf8"));
const { service, business, phone, areas, locale = "da" } = cfg;

if (!service?.name || !service?.slug_prefix || !Array.isArray(areas) || areas.length === 0) {
  console.error("✗ Config mangler `service.name`, `service.slug_prefix` eller `areas[]`.");
  process.exit(1);
}

const noun = (service.noun || service.name).toLowerCase();
const slugFor = (a) => `${service.slug_prefix}-${a.slug}`;
const pathFor = (a) => `/${slugFor(a)}`;

const outDir = join(root, "src", "content", "pages", locale);
mkdirSync(outDir, { recursive: true });

let written = 0;
let skipped = 0;

for (const area of areas) {
  const others = areas.filter((x) => x.slug !== area.slug);
  const title = `${service.name} i ${area.name}`;

  const frontmatter = {
    title,
    seo: {
      title: `${title} | ${business || service.name}`,
      description:
        area.description ||
        `${business || "Vi"} udfører ${noun} i ${area.name} og omegn. Ring for et uforpligtende tilbud.`,
    },
    blocks: [
      {
        type: "hero",
        heading: title,
        subheading: area.intro || `${service.name} i ${area.name} og omegn — kvalitet og lokalt nærvær.`,
        ...(area.image ? { image: area.image } : {}),
        cta_label: "Få et tilbud",
        cta_href: "#kontakt",
      },
      {
        type: "text",
        heading: title,
        body:
          area.body ||
          `Vi tilbyder ${noun} i hele ${area.name}-området. Kontakt os for en gratis og uforpligtende vurdering — vi kender lokalområdet og kører gerne ud.`,
      },
      {
        type: "faq",
        heading: "Ofte stillede spørgsmål",
        items: area.faq || [
          { q: `Dækker I hele ${area.name}?`, a: `Ja — vi kører i hele ${area.name} og de omkringliggende områder.` },
          { q: "Hvad koster et tilbud?", a: "Et tilbud er altid gratis og uforpligtende." },
        ],
      },
      {
        type: "area_list",
        heading: "Vi dækker også nabobyerne",
        intro: "Bor du i en af nabobyerne? Vi kører i hele området.",
        items: others.map((o) => ({ label: o.name, href: pathFor(o) })),
      },
      ...(phone
        ? [{ type: "click_to_call", heading: "Ring og få en snak", note: "Vi svarer hverdage 7–17", phone, label: "Ring nu", sticky_mobile: true }]
        : []),
      {
        type: "cta",
        heading: `Skal vi hjælpe i ${area.name}?`,
        body: "Send en besked, så vender vi tilbage hurtigt.",
        button_label: "Kontakt os",
        button_href: "#kontakt",
      },
    ],
  };

  const file = join(outDir, `${slugFor(area)}.md`);
  if (existsSync(file) && !force) {
    skipped++;
    console.log(`• springer over (findes): ${slugFor(area)}.md`);
    continue;
  }
  writeFileSync(file, `---\n${toYaml(frontmatter).trimEnd()}\n---\n`);
  written++;
  console.log(`✓ skrev: ${slugFor(area)}.md  →  ${pathFor(area)}`);
}

console.log(
  `\n${written} side(r) skrevet, ${skipped} sprunget over${skipped && !force ? " (brug --force for at overskrive)" : ""}.` +
    `\nKør \`npm run check\` + \`npm run build\` for at verificere.`,
);
