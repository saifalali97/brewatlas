/**
 * Licensed editorial heroes for Gulf Heritage country cards (non-UAE).
 * Run: node scripts/gulf-country-heroes.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "images", "gulf-heritage", "countries");

const MANIFEST = {
  "saudi-arabia.webp": "pexels:1365425", // Riyadh skyline, Saudi Arabia
  "oman.webp": "pexels:3601426", // Muscat, Oman
  "kuwait.webp": "pexels:931018", // Kuwait City towers
  "qatar.webp": "pexels:325185", // Doha skyline, Qatar
  "bahrain.webp": "pexels:257904", // Manama skyline, Bahrain
};

function sourceUrl(id) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2500`;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const [filename, source] of Object.entries(MANIFEST)) {
    const pexelsId = source.slice("pexels:".length);
    const res = await fetch(sourceUrl(pexelsId), {
      headers: { "User-Agent": "BrewAtlas/VisualCompleteness" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${filename}`);
    const input = Buffer.from(await res.arrayBuffer());
    const output = await sharp(input)
      .resize(1536, 1024, { fit: "cover", position: "centre" })
      .modulate({ brightness: 1.05, saturation: 0.84 })
      .linear(1.03, -8)
      .webp({ quality: 86, effort: 6 })
      .toBuffer();
    await fs.writeFile(path.join(OUT_DIR, filename), output);
    console.log(`✓ ${filename}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
