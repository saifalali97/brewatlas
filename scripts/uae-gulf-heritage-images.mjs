/**
 * BrewAtlas v1.4 — True UAE Editorial Identity.
 * Every source is Pexels-tagged Dubai or Abu Dhabi, UAE — rejected if ambiguous
 * (Morocco, Levant-only, generic Middle East, non-UAE stock).
 *
 * Run: node scripts/uae-gulf-heritage-images.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public", "images");

const SOURCE_W = 2500;
const OUT_W = 1536;
const OUT_H = 1024;

/**
 * Unique Pexels IDs — location verified Dubai/Abu Dhabi, UAE.
 * Rejected v1.3: 36799066, 35659736, 31122158, 7303787, 1416550–1416559,
 * 30557237, 16065372, 3796810, 4109745, 30339561, 16961809, 29250093,
 * 6205484, 15998897 (generic / non-UAE editorial).
 */
const MANIFEST = {
  // Arabic coffee — hospitality & experiences (culture > objects)
  "gulf-heritage/emirati-arabic-coffee.webp":
    "pexels:8484853", // Bab Al Shams courtyard hospitality, Dubai
  "gulf-heritage/dallah.webp":
    "pexels:34838579", // Qasr Al Hosn heritage guard, Abu Dhabi
  "gulf-heritage/finjan.webp":
    "pexels:28497767", // Historic Dubai alley, twilight majlis doors
  "gulf-heritage/mihmas.webp":
    "pexels:28515826", // Dubai spice souq (explicitly Dubai)
  "gulf-heritage/cardamom.webp":
    "pexels:30168756", // Meal spread, Dubai café context
  "gulf-heritage/saffron.webp":
    "pexels:37436518", // Outdoor dining, Dubai garden
  "gulf-heritage/coffee-hospitality.webp":
    "pexels:31462401", // Abu Dhabi evening gathering, palms
  "gulf-heritage/coffee-etiquette.webp":
    "pexels:28566979", // Old Dubai street, warm heritage light
  "gulf-heritage/coffee-serving-traditions.webp":
    "pexels:28497765", // Al Shindagha traditional architecture, Dubai

  // Karak & tea — everyday UAE life
  "gulf-heritage/karak-chai.webp":
    "pexels:4669256", // Dubai brunch café, authentic street dining
  "gulf-heritage/black-tea.webp":
    "pexels:13220587", // Dubai café façade, Arabic signage, night
  "gulf-heritage/milk-tea.webp":
    "pexels:36249730", // Dubai café dishes & service
  "gulf-heritage/saffron-tea.webp":
    "pexels:28669139", // Dubai desert group, golden hour
  "gulf-heritage/mint-tea.webp":
    "pexels:21856218", // Saadiyat Beach Club, Abu Dhabi
  "gulf-heritage/adani-tea.webp":
    "pexels:19965890", // Abu Dhabi fountain & skyline, twilight
  "gulf-heritage/karak-chai-step-simmer.webp":
    "pexels:28916060", // Dubai café preparation display
  "gulf-heritage/karak-chai-step-milk.webp":
    "pexels:15293961", // Glass Pods dining, Dubai Marina

  // Roasters — always people & community (never empty cafés)
  "gulf-heritage/raw-coffee-company.webp":
    "pexels:1260599", // Patron at chic Dubai café
  "gulf-heritage/the-espresso-lab.webp":
    "pexels:11221206", // Pedestrians at Shazz Café, Dubai
  "gulf-heritage/seven-fortunes.webp":
    "pexels:4579127", // Passengers on abra, Dubai Creek
  "gulf-heritage/cypher-roastery.webp":
    "pexels:28449836", // Heritage district, person in frame
  "gulf-heritage/boom-coffee.webp":
    "pexels:28705867", // Desert camp gathering, Dubai
  "gulf-heritage/gold-box-roastery.webp":
    "pexels:32801027", // Bustling Dubai street with people
  "gulf-heritage/nightjar-coffee.webp":
    "pexels:34838594", // Traditional Emirati guard, Abu Dhabi fort

  // Culture heroes & editorial
  "culture/uae-coffee-culture-hero.webp":
    "pexels:31864684", // Al Fahidi historical neighbourhood
  "culture/arabic-coffee-hero.webp":
    "pexels:35756450", // Al Fahidi warm daylight
  "culture/majlis-gathering.webp":
    "pexels:21856165", // Al Seef heritage café architecture
  "culture/heritage-fort.webp":
    "pexels:31386384", // Wind tower, Al Seef, Dubai
  "culture/coffee-etiquette.webp":
    "pexels:30282379", // Al Fahidi lane, Dubai
  "culture/dallah-pour.webp":
    "pexels:15594914", // Sheikh Zayed Grand Mosque, Abu Dhabi
  "culture/finjan-cups.webp":
    "pexels:19212313", // Dubai Marina evening, waterfront café life
  "culture/arabic-coffee-spices.webp":
    "pexels:28291742", // Date palms, Dubai harvest
  "culture/roast-levels.webp":
    "pexels:30965659", // Dubai Marina & Ain Dubai skyline
  "culture/karak-tea-pour.webp":
    "pexels:35308598", // Dubai Creek heritage waterfront
  "culture/emirati-tea-gathering.webp":
    "pexels:12565201", // Sheikh Zayed Grand Mosque reflected pool
};

function sourceUrl(source) {
  const id = source.slice("pexels:".length);
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${SOURCE_W}`;
}

async function fetchBuffer(source) {
  const res = await fetch(sourceUrl(source), {
    headers: { "User-Agent": "BrewAtlas/1.4 UAE Editorial Identity" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${source}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  const maxEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
  if (maxEdge < 2500) {
    console.warn(`⚠ ${source}: source ${meta.width}×${meta.height} below 2500px long edge`);
  }
  return buf;
}

/** Warm golden-hour editorial grade — soft contrast, natural skin tones. */
async function processImage(input) {
  return sharp(input)
    .resize(OUT_W, OUT_H, { fit: "cover", position: "centre" })
    .modulate({ brightness: 1.05, saturation: 0.84 })
    .linear(1.03, -8)
    .webp({ quality: 86, effort: 6 })
    .toBuffer();
}

async function main() {
  const entries = Object.entries(MANIFEST);
  const sources = entries.map(([, s]) => s);
  const unique = new Set(sources);
  if (unique.size !== sources.length) {
    const dupes = sources.filter((s, i) => sources.indexOf(s) !== i);
    throw new Error(`Duplicate sources in manifest: ${[...new Set(dupes)].join(", ")}`);
  }

  console.log(`UAE v1.4 editorial refresh — ${entries.length} images (${SOURCE_W}px source → ${OUT_W}×${OUT_H} WebP)`);
  let total = 0;
  const hashes = new Map();

  for (const [relativePath, source] of entries) {
    const outPath = path.join(PUBLIC, relativePath);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    const input = await fetchBuffer(source);
    const output = await processImage(input);
    const hash = crypto.createHash("md5").update(output).digest("hex");
    if (hashes.has(hash)) {
      throw new Error(`Duplicate output hash: ${relativePath} matches ${hashes.get(hash)}`);
    }
    hashes.set(hash, relativePath);
    await fs.writeFile(outPath, output);
    total += output.length;
    console.log(`✓ ${relativePath} ← ${source} (${Math.round(output.length / 1024)} KB)`);
  }

  console.log(`Done — ${Math.round(total / 1024)} KB total, ${hashes.size} unique outputs`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
