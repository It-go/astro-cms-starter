/**
 * check:model — håndhæver B3-konventionen: studio.config.yml ↔ src/content.config.ts (1:1).
 * Fejler (exit 1) hvis collections eller blok-typer divergerer, så editoren ikke stille
 * kommer ud af sync med skemaet. Kør i CI + før commit.
 */
import { readFileSync } from "node:fs";
import { parse } from "yaml";

const cfg = parse(readFileSync("studio.config.yml", "utf8"));
const schema = readFileSync("src/content.config.ts", "utf8");
const errors = [];

const sortJoin = (a) => [...a].sort().join(", ");

// 1) Collections matcher
const cfgCols = cfg.collections.map((c) => c.name);
const schemaCols = (schema.match(/export const collections = \{([^}]*)\}/)?.[1] ?? "")
  .split(",")
  .map((s) => s.trim().split(":")[0].trim())
  .filter(Boolean);
if (sortJoin(cfgCols) !== sortJoin(schemaCols)) {
  errors.push(`collections: config=[${sortJoin(cfgCols)}] schema=[${sortJoin(schemaCols)}]`);
}

// 2) Blok-typer matcher (discriminated union ↔ list.types)
const cfgBlocks = (
  cfg.collections.find((c) => c.name === "pages")?.fields?.find((f) => f.name === "blocks")?.types ?? []
).map((t) => t.name);
const schemaBlocks = [...schema.matchAll(/type: z\.literal\("([a-z_]+)"\)/g)].map((m) => m[1]);
if (sortJoin(cfgBlocks) !== sortJoin(schemaBlocks)) {
  errors.push(`blok-typer: config=[${sortJoin(cfgBlocks)}] schema=[${sortJoin(schemaBlocks)}]`);
}

if (errors.length) {
  console.error("✗ content-model drift (studio.config.yml ↔ content.config.ts):\n  " + errors.join("\n  "));
  process.exit(1);
}
console.log(`✓ studio.config.yml matcher content.config.ts — collections [${sortJoin(cfgCols)}] + ${cfgBlocks.length} blok-typer`);
