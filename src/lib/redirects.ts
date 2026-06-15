// Redirects-læser (STD-7 / ITG-972). Læser `redirects` fra site.yml og bygger et
// Cloudflare Pages `_redirects`-indhold. Ren node-funktion (fs+yaml) — bruges af build-integrationen.
import { readFileSync } from "node:fs";
import { parse } from "yaml";

export interface RedirectRule {
  from: string;
  to: string;
  status: number;
}

export function readRedirects(file = "src/content/settings/site.yml"): {
  rules: RedirectRule[];
  warnings: string[];
} {
  let data: Record<string, unknown> = {};
  try {
    data = (parse(readFileSync(file, "utf8")) as Record<string, unknown>) ?? {};
  } catch {
    return { rules: [], warnings: [] };
  }
  const raw = Array.isArray(data.redirects) ? (data.redirects as Array<Record<string, unknown>>) : [];
  const rules: RedirectRule[] = [];
  const warnings: string[] = [];
  for (const r of raw) {
    const from = String(r?.from ?? "").trim();
    const to = String(r?.to ?? "").trim();
    if (!from || !to) continue;
    if (!from.startsWith("/")) warnings.push(`redirect 'from' bør starte med '/': ${from}`);
    const status = r?.permanent === false ? 302 : 301;
    rules.push({ from, to, status });
  }
  return { rules, warnings };
}

export function toRedirectsFile(rules: RedirectRule[]): string {
  if (!rules.length) return "";
  return rules.map((r) => `${r.from} ${r.to} ${r.status}`).join("\n") + "\n";
}
