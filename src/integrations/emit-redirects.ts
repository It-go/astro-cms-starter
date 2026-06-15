// Astro-integration (STD-7 / ITG-972): skriv Cloudflare Pages `_redirects` ved build.
// Kører efter build (astro:build:done) og lægger filen i output-roden, så CF Pages håndhæver
// 301/302 fra site-settings. Tom liste → ingen fil.
import type { AstroIntegration } from "astro";
import { writeFileSync } from "node:fs";
import { readRedirects, toRedirectsFile } from "../lib/redirects";

export default function emitRedirects(): AstroIntegration {
  return {
    name: "itgo-emit-redirects",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const { rules, warnings } = readRedirects();
        for (const w of warnings) logger.warn(w);
        if (!rules.length) return;
        writeFileSync(new URL("_redirects", dir), toRedirectsFile(rules));
        logger.info(`skrev _redirects (${rules.length} regel/regler)`);
      },
    },
  };
}
