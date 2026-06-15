// GROWTH-4 (ITG-981): publicerings-logik for nyheder/blog — rene, testbare helpers.
// Statisk site: "planlagt" = indlægget bliver synligt ved næste build efter publishAt
// (Cloudflare Pages cron-rebuild). Bruges af nyheds-listen, [slug]-siden og RSS-feedet.
import type { CollectionEntry } from "astro:content";

export type NewsEntry = CollectionEntry<"news">;

// Publiceret = ikke kladde OG (ingen publishAt ELLER publishAt <= nu).
export function isPublished(data: { draft?: boolean; publishAt?: Date }, now: Date = new Date()): boolean {
  if (data.draft) return false;
  if (data.publishAt && data.publishAt.getTime() > now.getTime()) return false;
  return true;
}

// Kun publicerede, nyeste først.
export function publishedSorted(entries: NewsEntry[], now: Date = new Date()): NewsEntry[] {
  return entries
    .filter((e) => isPublished(e.data, now))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
