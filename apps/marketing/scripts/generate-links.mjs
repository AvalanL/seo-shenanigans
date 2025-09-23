/**
 * Läser interlinks.yaml och skapar JSON med internlänkar för build-steget.
 * Körs före build: `node ./scripts/generate-links.mjs`
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import yaml from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function run() {
  const source = path.join(root, "data", "interlinks.yaml");
  const outputDir = path.join(root, "src", "content", "shared");
  const output = path.join(outputDir, "interlinks.json");

  const raw = await readFile(source, "utf-8");
  const parsed = yaml.parse(raw);

  if (!parsed?.links || typeof parsed.links !== "object") {
    throw new Error("interlinks.yaml saknar fältet 'links'.");
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(output, JSON.stringify(parsed.links, null, 2), "utf-8");
  console.log(`Skapade interlänksdata → ${output}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
