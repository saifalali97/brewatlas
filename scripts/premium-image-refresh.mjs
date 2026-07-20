/**
 * BrewAtlas v1.1 — Premium photography refresh.
 * Downloads curated editorial assets (Unsplash + Pexels), crops to 1536×1024, outputs WebP.
 * Run: node scripts/premium-image-refresh.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public", "images");

const W = 1536;
const H = 1024;

/**
 * Source format: "unsplash:photo-…" or "pexels:12345"
 * @type {Record<string, string>}
 */
const MANIFEST = {
  // ── Recipes (20) ──────────────────────────────────────────────────────────
  "recipes/ethiopian-pour-over.webp": "pexels:851555",
  "recipes/chemex.webp": "pexels:3290289",
  "recipes/cold-brew.webp": "pexels:302904",
  "recipes/cortado.webp": "pexels:302899",
  "recipes/espresso-tonic.webp": "pexels:894695",
  "recipes/sumatra-moka.webp": "pexels:302896",
  "recipes/costa-rica-aeropress.webp": "pexels:4109744",
  "recipes/rwanda-v60.webp": "pexels:2396220",
  "recipes/espresso-shot.webp": "pexels:302899",
  "recipes/aeropress-brew.webp": "pexels:4109745",
  "recipes/cupping-flight.webp": "pexels:1417942",
  "recipes/roastery-bags.webp": "unsplash:photo-1501339847302-ac426a4a7cbb",
  "recipes/coffee-beans-macro.webp": "pexels:2060970",
  "recipes/cold-brew-tower.webp": "pexels:302904",
  "recipes/kalita-wave.webp": "pexels:851555",
  "recipes/clever-dripper.webp": "pexels:3290289",
  "recipes/siphon-brew.webp": "pexels:4109745",
  "recipes/moka-pot-classic.webp": "pexels:302896",
  "recipes/french-press-pour.webp": "pexels:324028",
  "recipes/origami-dripper.webp": "pexels:2396220",

  // ── Culture (12) ──────────────────────────────────────────────────────────
  "culture/uae-coffee-culture-hero.webp": "unsplash:photo-1578662996442-48f60103fc96",
  "culture/arabic-coffee-hero.webp": "unsplash:photo-1578662996442-48f60103fc96",
  "culture/tea-hero.webp": "pexels:35659736",
  "culture/heritage-fort.webp": "unsplash:photo-1512453979798-5ea266f8880c",
  "culture/majlis-gathering.webp": "pexels:36768066",
  "culture/coffee-etiquette.webp": "unsplash:photo-1578662996442-48f60103fc96",
  "culture/dallah-pour.webp": "unsplash:photo-1578662996442-48f60103fc96",
  "culture/finjan-cups.webp": "pexels:38002027",
  "culture/arabic-coffee-spices.webp": "unsplash:photo-1544787219-7f47ccb76574",
  "culture/roast-levels.webp": "unsplash:photo-1447933601403-0c6688de566e",
  "culture/karak-tea-pour.webp": "pexels:38002027",
  "culture/emirati-tea-gathering.webp": "pexels:35659736",

  // ── Methods (3) ───────────────────────────────────────────────────────────
  "methods/pour-over.webp": "pexels:851555",
  "methods/french-press.webp": "pexels:324028",
  "methods/siphon.webp": "pexels:4109745",

  // ── Origins & placeholders ──────────────────────────────────────────────────
  "origins/colombia.webp": "unsplash:photo-1504754524776-8f4f37790ca0",
  "origins/ethiopia.webp": "pexels:1416530",
  "origins/kenya.webp": "pexels:1416536",
  "origins/guatemala.webp": "pexels:1416541",
  "origins/panama.webp": "pexels:1416542",
  "origins/indonesia.webp": "pexels:1416543",
  "placeholders/origin.webp": "unsplash:photo-1504754524776-8f4f37790ca0",
  "placeholders/roaster.webp": "unsplash:photo-1441986300917-64674bd600d8",

  // ── Roasters (6 café environments) ─────────────────────────────────────────
  "roasters/onyx.webp": "unsplash:photo-1441986300917-64674bd600d8",
  "roasters/counter-culture.webp": "pexels:2060970",
  "roasters/saint-frank.webp": "unsplash:photo-1554118811-1e0d58224f24",
  "roasters/tim-wendelboe.webp": "pexels:1416544",
  "roasters/la-cabra.webp": "unsplash:photo-1501339847302-ac426a4a7cbb",
  "roasters/koppi.webp": "pexels:1416545",

  // ── Hero, fallback, testimonials (no faces) ───────────────────────────────
  "hero/home-hero.webp": "unsplash:photo-1441986300917-64674bd600d8",
  "fallback/coffee-placeholder.webp": "unsplash:photo-1511920170033-f8396924c348",
  "testimonials/workspace-1.webp": "pexels:851555",
  "testimonials/workspace-2.webp": "pexels:894695",
  "testimonials/workspace-3.webp": "pexels:3290289",

  // ── Search & community ────────────────────────────────────────────────────
  "sections/search-workspace.webp": "pexels:2060970",
  "sections/community-lifestyle.webp": "pexels:4109745",
  "sections/premium-lifestyle.webp": "unsplash:photo-1441986300917-64674bd600d8",

  // ── Gulf Heritage heroes (22 pages) ───────────────────────────────────────
  "gulf-heritage/emirati-arabic-coffee.webp": "unsplash:photo-1578662996442-48f60103fc96",
  "gulf-heritage/dallah.webp": "unsplash:photo-1578662996442-48f60103fc96",
  "gulf-heritage/finjan.webp": "pexels:38002027",
  "gulf-heritage/mihmas.webp": "unsplash:photo-1544787219-7f47ccb76574",
  "gulf-heritage/cardamom.webp": "unsplash:photo-1544787219-7f47ccb76574",
  "gulf-heritage/saffron.webp": "unsplash:photo-1544787219-7f47ccb76574",
  "gulf-heritage/coffee-hospitality.webp": "pexels:36768066",
  "gulf-heritage/coffee-etiquette.webp": "unsplash:photo-1578662996442-48f60103fc96",
  "gulf-heritage/coffee-serving-traditions.webp": "unsplash:photo-1578662996442-48f60103fc96",
  "gulf-heritage/karak-chai.webp": "pexels:38002027",
  "gulf-heritage/black-tea.webp": "pexels:35659736",
  "gulf-heritage/milk-tea.webp": "pexels:36768066",
  "gulf-heritage/saffron-tea.webp": "pexels:35659736",
  "gulf-heritage/mint-tea.webp": "pexels:36768066",
  "gulf-heritage/adani-tea.webp": "pexels:38002027",
  "gulf-heritage/raw-coffee-company.webp": "unsplash:photo-1441986300917-64674bd600d8",
  "gulf-heritage/the-espresso-lab.webp": "pexels:302899",
  "gulf-heritage/seven-fortunes.webp": "unsplash:photo-1501339847302-ac426a4a7cbb",
  "gulf-heritage/cypher-roastery.webp": "unsplash:photo-1447933601403-0c6688de566e",
  "gulf-heritage/boom-coffee.webp": "unsplash:photo-1554118811-1e0d58224f24",
  "gulf-heritage/gold-box-roastery.webp": "pexels:1416546",
  "gulf-heritage/nightjar-coffee.webp": "pexels:1416548",
};

function sourceUrl(source) {
  if (source.startsWith("unsplash:")) {
    const id = source.slice("unsplash:".length);
    return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${W}&h=${H}&q=90`;
  }
  if (source.startsWith("pexels:")) {
    const id = source.slice("pexels:".length);
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${W}&h=${H}&fit=crop`;
  }
  throw new Error(`Unknown source: ${source}`);
}

async function fetchBuffer(source) {
  const url = sourceUrl(source);
  const res = await fetch(url, {
    headers: { "User-Agent": "BrewAtlas/1.1 Premium Image Refresh" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${source}`);
  return Buffer.from(await res.arrayBuffer());
}

async function processOne(relativePath, source) {
  const outPath = path.join(PUBLIC, relativePath);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  const input = await fetchBuffer(source);
  await sharp(input)
    .resize(W, H, { fit: "cover", position: "centre" })
    .webp({ quality: 85, effort: 6 })
    .toFile(outPath);
  const stat = await fs.stat(outPath);
  return { relativePath, bytes: stat.size };
}

async function main() {
  const entries = Object.entries(MANIFEST);
  console.log(`Processing ${entries.length} premium images…`);
  const results = [];
  let failed = 0;
  for (const [relativePath, source] of entries) {
    try {
      const result = await processOne(relativePath, source);
      results.push(result);
      console.log(`✓ ${relativePath} (${Math.round(result.bytes / 1024)} KB)`);
    } catch (error) {
      failed += 1;
      console.error(`✗ ${relativePath}:`, error.message);
    }
  }
  const totalKb = Math.round(results.reduce((sum, item) => sum + item.bytes, 0) / 1024);
  console.log(`Done — ${results.length} ok, ${failed} failed, ${totalKb} KB total WebP.`);
  if (failed > 0) process.exitCode = 1;
}

main();
