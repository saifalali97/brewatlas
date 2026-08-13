/**
 * Insert YOOF Roastery (Saudi Arabia) + official coffee catalog from yoof.co.
 * Creates listing-shell recipes (null dose/ratio) so roaster pages display products.
 *
 * Pre-insert report is printed first. Usage:
 *   npx tsx scripts/insert-yoof-catalog.mts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type OfficialCoffee = {
  name: string;
  url: string;
  imageUrl: string;
  origin: string | null;
  region: string | null;
  variety: string | null;
  process: string | null;
  altitude: string | null;
  farm: string | null;
  producer: string | null;
  roastLevel: string | null;
  flavorNotes: string[];
  available: boolean;
  handle: string;
};

function loadEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

function slugify(name: string, handle: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\u0600-\u06ff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return (base || `yoof-${handle}`).toLowerCase();
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\b\d+\s*(g|kg|gm|جرام|جم)\b/gi, "")
    .replace(/[^a-z0-9\u0600-\u06ff\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const official = JSON.parse(
    readFileSync("/tmp/yoof-audit/yoof-official-coffees.cleaned.json", "utf8"),
  ) as OfficialCoffee[];

  const env = loadEnv(resolve(process.cwd(), ".env.local"));
  const sb = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const { data: existingRoaster } = await sb
    .from("roasters")
    .select("id, slug, name")
    .eq("slug", "yoof-roastery")
    .maybeSingle();

  let existingCoffeeCount = 0;
  if (existingRoaster) {
    const { count } = await sb
      .from("coffees")
      .select("*", { count: "exact", head: true })
      .eq("roaster_id", existingRoaster.id)
      .eq("published", true);
    existingCoffeeCount = count ?? 0;
  }

  console.log(
    JSON.stringify(
      {
        phase: "pre-insert",
        officialYoofCoffeeCount: official.length,
        existingBrewAtlasYoofCount: existingCoffeeCount,
        missingCount: Math.max(0, official.length - existingCoffeeCount),
        officialNames: official.map((p) => p.name),
      },
      null,
      2,
    ),
  );

  const { data: country } = await sb
    .from("countries")
    .select("id")
    .eq("slug", "saudi-arabia")
    .single();
  if (!country) throw new Error("missing saudi-arabia country");

  const { data: city } = await sb
    .from("cities")
    .select("id")
    .eq("country_id", country.id)
    .eq("slug", "riyadh")
    .maybeSingle();

  const { data: method } = await sb
    .from("brewing_methods")
    .select("id")
    .eq("slug", "v60")
    .single();
  if (!method) throw new Error("missing v60");

  let roasterId = existingRoaster?.id ?? null;
  if (!roasterId) {
    const { data: inserted, error } = await sb
      .from("roasters")
      .insert({
        name: "YOOF Roastery",
        slug: "yoof-roastery",
        country: "Saudi Arabia",
        country_id: country.id,
        city: "Riyadh",
        city_id: city?.id ?? null,
        emirate: null,
        website: "https://yoof.co",
        instagram: "https://instagram.com/yoof.ksa",
        description:
          "Saudi specialty coffee roastery (محمصة يوف) offering carefully selected international coffee crops and drip envelopes through its official online store at yoof.co.",
        specialty: "Specialty single-origin roasting",
        founded_year: null,
        featured: false,
        is_uae: false,
        published: true,
        verified: true,
        logo_url:
          "https://cdn.salla.sa/jZBlwD/lQth2Z08kEAuWdlgqGJwDhsc7pp5CcZLoVrLqIyS.png",
        banner_image_url: "/images/gulf-heritage/countries/saudi-arabia.webp",
      })
      .select("id")
      .single();
    if (error || !inserted) {
      console.error("ROASTER INSERT FAIL", error);
      process.exit(1);
    }
    roasterId = inserted.id;
    console.log("CREATED roaster yoof-roastery", roasterId);
  } else {
    console.log("ROASTER EXISTS", roasterId);
  }

  const { data: existingCoffees } = await sb
    .from("coffees")
    .select("id, name, slug, product_url")
    .eq("roaster_id", roasterId);

  const existingNorm = new Set(
    (existingCoffees ?? []).map((c) => normalizeName(c.name)),
  );
  const existingUrls = new Set(
    (existingCoffees ?? [])
      .map((c) => c.product_url?.replace(/\/$/, "").toLowerCase())
      .filter(Boolean) as string[],
  );
  const existingSlugs = new Set((existingCoffees ?? []).map((c) => c.slug));

  const addedNames: string[] = [];
  for (const product of official) {
    const norm = normalizeName(product.name);
    const urlKey = product.url.replace(/\/$/, "").toLowerCase();
    if (existingNorm.has(norm) || existingUrls.has(urlKey)) {
      console.log("SKIP existing", product.name);
      continue;
    }
    if (!product.imageUrl) {
      console.error("NO IMAGE", product.name);
      continue;
    }

    let slug = slugify(product.name, product.handle);
    let i = 2;
    while (existingSlugs.has(slug)) slug = `${slugify(product.name, product.handle)}-${i++}`;

    const { data: coffee, error: coffeeErr } = await sb
      .from("coffees")
      .insert({
        roaster_id: roasterId,
        name: product.name,
        slug,
        farm: product.farm,
        producer: product.producer,
        variety: product.variety,
        process: product.process,
        altitude: product.altitude,
        roast_level: product.roastLevel,
        region: product.region,
        flavor_notes: product.flavorNotes,
        product_url: product.url,
        product_image_url: product.imageUrl,
        weight_options_grams: null,
        available: product.available,
        published: true,
        recommended_methods: ["V60"],
      })
      .select("id")
      .single();
    if (coffeeErr || !coffee) {
      console.error("COFFEE INSERT FAIL", product.name, coffeeErr?.message);
      continue;
    }

    const recipeSlug = `yoof-roastery-${slug}-v60-hot`.slice(0, 180);
    const { error: recipeErr } = await sb.from("recipes").insert({
      title: `${product.name} V60`,
      slug: recipeSlug,
      description: `Filter coffee from YOOF Roastery: ${product.name}${
        product.origin ? ` (${product.origin})` : ""
      }. Brew recipe not published by the roaster — personalize on BrewAtlas.`,
      cover_image_url: product.imageUrl,
      difficulty: "Intermediate",
      tasting_notes: product.flavorNotes.length
        ? `${product.flavorNotes.join(", ")}.`
        : null,
      featured: false,
      premium_only: false,
      published: true,
      status: "published",
      recipe_kind: "official",
      verification_status: "verified",
      serving_style: "hot",
      roaster_id: roasterId,
      coffee_id: coffee.id,
      country_id: country.id,
      city_id: city?.id ?? null,
      brewing_method_id: method.id,
      brew_method: "V60",
      is_iced: false,
      rating: 4.5,
      coffee_beans: product.name,
      roast_level: product.roastLevel,
      bean_origin: product.origin,
      process: product.process,
      producer: product.producer,
      variety: product.variety,
      coffee_dose: null,
      water_amount: null,
      ratio: null,
      grind_size: null,
      water_temperature: null,
      estimated_brew_time: null,
      total_brew_time: null,
      brewing_tips:
        "Official brew recipe not published. Use personalization controls to set dose, ratio, and pours.",
    });
    if (recipeErr) {
      console.error("RECIPE INSERT FAIL", product.name, recipeErr.message);
      continue;
    }

    existingNorm.add(norm);
    existingUrls.add(urlKey);
    existingSlugs.add(slug);
    addedNames.push(product.name);
    console.log("ADDED", product.name);
  }

  const { count: finalCoffees } = await sb
    .from("coffees")
    .select("*", { count: "exact", head: true })
    .eq("roaster_id", roasterId)
    .eq("published", true);
  const { count: finalRecipes } = await sb
    .from("recipes")
    .select("*", { count: "exact", head: true })
    .eq("roaster_id", roasterId)
    .eq("published", true);

  console.log(
    JSON.stringify(
      {
        phase: "post-insert",
        officialYoofCatalog: official.length,
        alreadyInBrewAtlas: existingCoffeeCount,
        added: addedNames.length,
        addedNames,
        finalBrewAtlasCoffeeCount: finalCoffees,
        finalBrewAtlasRecipeCount: finalRecipes,
        roasterId,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
