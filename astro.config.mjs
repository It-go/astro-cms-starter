// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// ITGo Studio Astro CMS starter (C1 / ITG-812).
// Statisk output → Cloudflare Pages. SSR-adapter (@astrojs/cloudflare) tilføjes
// først når der er server-behov (forms-endpoint, Phase D). Indhold = git via
// content collections; redigeres i ITGo Studio (Sveltia) — IKKE /admin her.
//
// site: erstattes pr. kunde ved klon (driver sitemap + canonical/hreflang).
export default defineConfig({
  site: "https://example.itgo.dk",
  i18n: {
    defaultLocale: "da",
    locales: ["da", "en"],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
