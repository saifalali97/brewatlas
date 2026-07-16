#!/usr/bin/env node
/**
 * Production readiness verification — run against local or staging Supabase.
 * Usage: node scripts/verify-production-readiness.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.BREWATLAS_INITIAL_ADMIN_EMAIL?.trim();

const results = [];

function pass(name, detail) {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? `: ${detail}` : ""}`);
}

function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? `: ${detail}` : ""}`);
}

function warn(name, detail) {
  results.push({ name, ok: true, detail, warn: true });
  console.warn(`⚠ ${name}${detail ? `: ${detail}` : ""}`);
}

async function supabaseRpc(fn, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

async function supabaseQuery(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log("\n=== BrewAtlas Production Verification ===\n");

  if (!SUPABASE_URL || !SERVICE_KEY) {
    fail("Supabase credentials", "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required");
    process.exit(1);
  }
  pass("Supabase credentials", "configured");

  if (!ADMIN_EMAIL) {
    warn("BREWATLAS_INITIAL_ADMIN_EMAIL", "not set — bootstrap will use founding-profile fallback only");
  } else {
    pass("BREWATLAS_INITIAL_ADMIN_EMAIL", `set (${ADMIN_EMAIL.replace(/(.{2}).+(@.+)/, "$1***$2")})`);
  }

  // 1. Bootstrap RPC
  const bootstrap = await supabaseRpc("bootstrap_initial_admin", { p_email: ADMIN_EMAIL ?? null });
  if (bootstrap.ok) {
    pass("bootstrap_initial_admin RPC", `returned ${JSON.stringify(bootstrap.data)}`);
  } else {
    fail("bootstrap_initial_admin RPC", `${bootstrap.status} ${JSON.stringify(bootstrap.data)}`);
  }

  // 2. Admin role for bootstrap email
  if (ADMIN_EMAIL) {
    const users = await supabaseQuery(
      `profiles?select=id,role,full_name&email=eq.${encodeURIComponent(ADMIN_EMAIL)}`,
    );
    // profiles may not expose email — try auth admin API via list
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=200`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    });
    if (authRes.ok) {
      const authData = await authRes.json();
      const usersList = authData.users ?? authData;
      const match = Array.isArray(usersList)
        ? usersList.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase())
        : null;
      if (!match) {
        warn("Admin account lookup", `No auth user found for ${ADMIN_EMAIL} — sign up first, then re-run bootstrap`);
      } else {
        const profile = await supabaseQuery(`profiles?select=role,full_name&id=eq.${match.id}`);
        const role = profile.data?.[0]?.role;
        if (role === "admin" || role === "owner") {
          pass("Admin role promotion", `${ADMIN_EMAIL} has role=${role}`);
        } else {
          fail("Admin role promotion", `${ADMIN_EMAIL} has role=${role ?? "unknown"}`);
        }
      }
    } else {
      warn("Admin account lookup", `auth admin API returned ${authRes.status}`);
    }
    void users;
  }

  // 3. Homepage CMS tables
  for (const table of ["homepage_hero_banners", "homepage_featured_recipes", "homepage_sections"]) {
    const q = await supabaseQuery(`${table}?select=id&limit=1`);
    if (q.ok) {
      pass(`CMS table ${table}`, "accessible");
    } else {
      fail(`CMS table ${table}`, `${q.status} — run migrations?`);
    }
  }

  // 4. Hero image CMS query (mirrors getPublishedHomepageHeroImage)
  const hero = await supabaseQuery(
    "homepage_hero_banners?select=image_url,media_assets(public_url)&locale=eq.en&published=eq.true&order=position.asc&limit=1",
  );
  if (hero.ok) {
    const row = hero.data?.[0];
    const asset = row?.media_assets;
    const url = (Array.isArray(asset) ? asset[0]?.public_url : asset?.public_url) ?? row?.image_url;
    pass("Homepage hero CMS query", url ? "published hero found" : "no published hero (static fallback used)");
  } else {
    fail("Homepage hero CMS query", `${hero.status}`);
  }

  // 5. Recipes table
  const recipes = await supabaseQuery("recipes?select=id,title&limit=1");
  if (recipes.ok) pass("Recipe CRUD schema", `recipes table accessible (${recipes.data?.length ?? 0} sample)`);
  else fail("Recipe CRUD schema", `${recipes.status}`);

  // 6. Media assets
  const media = await supabaseQuery("media_assets?select=id,public_url&limit=1");
  if (media.ok) pass("Media library schema", "media_assets accessible");
  else fail("Media library schema", `${media.status}`);

  // 7. Stripe env
  const billing = process.env.BILLING_PROVIDER ?? "manual";
  if (billing === "stripe") {
    const stripeKeys = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"];
    const missing = stripeKeys.filter((k) => !process.env[k]);
    if (missing.length) fail("Stripe configuration", `missing ${missing.join(", ")}`);
    else pass("Stripe configuration", "all keys present");
  } else {
    pass("Stripe configuration", `BILLING_PROVIDER=${billing} (manual mode — subscription UI uses local entitlements)`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== ${failed.length === 0 ? "ALL CHECKS PASSED" : `${failed.length} CHECK(S) FAILED`} ===\n`);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
