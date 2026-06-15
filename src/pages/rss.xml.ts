// GROWTH-4 (ITG-981): hånd-rullet RSS 2.0-feed for nyheder (ingen ekstra dependency).
// Prerenders til /rss.xml ved build. Kun publicerede indlæg, nyeste 50.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { publishedSorted } from "../lib/news";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string);

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href || "https://example.itgo.dk/").replace(/\/$/, "");
  const items = publishedSorted(await getCollection("news")).slice(0, 50);
  const xmlItems = items
    .map((n) => {
      const url = `${base}/nyheder/${n.id}`;
      return (
        `<item><title>${esc(n.data.title)}</title>` +
        `<link>${esc(url)}</link><guid isPermaLink="true">${esc(url)}</guid>` +
        `<pubDate>${n.data.date.toUTCString()}</pubDate>` +
        (n.data.summary ? `<description>${esc(n.data.summary)}</description>` : "") +
        `</item>`
      );
    })
    .join("");
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0"><channel>` +
    `<title>Nyheder</title><link>${esc(base + "/nyheder")}</link>` +
    `<description>Seneste nyt</description><language>da-DK</language>` +
    xmlItems +
    `</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
};
