// Tillad kun http(s)/relative/anchor/mailto/tel i href/src (Astro escaper tekst,
// men ikke javascript:-URLs). Vendored fra @itgo/blocks (integreres fuldt i Wave 2).
export function safeUrl(u?: string | null): string {
  if (!u) return "#";
  const s = String(u).trim();
  if (/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(s)) return s;
  return "#";
}
