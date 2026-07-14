# BrewAtlas — Project Audit Report

**Audit type:** Read-only inspection. No source code, configuration, or dependencies were modified to produce this report.
**Stack observed:** Next.js `16.2.10` (App Router, Turbopack), React `19.2.4`, TypeScript `5.9.3` (strict), Tailwind CSS `4`, Supabase (`@supabase/ssr` + `@supabase/supabase-js`), `lucide-react`.
**Note:** `AGENTS.md`/`CLAUDE.md` explicitly warn that this Next.js version has breaking changes vs. training-data assumptions — confirmed as a real, current concern for any future work on this repo.

---

## 1. Executive Summary

**Overall maturity:** Mid-to-late-stage prototype with a genuinely production-grade data/security layer, but an incomplete "last mile" (billing, real AI, legal pages, some CTAs) that separates it from a public launch.

**Current development stage:** Feature-complete marketing site + working authenticated product shell (recipes, dashboard, community, culture) on top of a very mature Supabase schema (~40 tables, RLS everywhere). Several backend subsystems (personal taste profiles, brew logs, recipe insights, AI recommendations, xBloom profiles, coach history) are **fully built at the data/action layer but not yet wired to any UI** — the team has been building forward faster than wiring backward.

**Overall architecture quality:** High. Consistent adapter pattern for every "not-yet-real" integration (LLM, billing, translation), a real Recipe Intelligence engine, a genuinely rule-based (non-random) recipe converter with 16 device-specific rule modules, strict TypeScript, and an i18n system with 1:1 English/Arabic key parity. Code comments are unusually disciplined about stating what is real vs. groundwork.

**Estimated production readiness:** ~55–65%. The core browsing/auth/recipe/dashboard experience could go live today content-wise, but marketing claims ("AI Coach"), missing legal pages, a non-functional contact form, and no billing integration are real blockers.

**Main strengths:**
- Mature, RLS-secured Postgres schema with consistent ownership/admin patterns and a security-definer admin check.
- Real Supabase Auth (email/password + Google/Apple OAuth), PKCE callback, defense-in-depth route protection.
- Full bilingual (EN/AR) coverage with RTL, cookie-based switching, and no missing keys between dictionaries.
- Deterministic, well-documented recipe conversion engine (16 device profiles) and recipe-analysis/coaching engine — genuinely useful logic, not filler.
- Strong security headers/CSP, PWA (manifest, offline page, versioned service worker), and SEO (sitemap, robots, hreflang).

**Main weaknesses:**
- "AI Coach" and related AI features are 100% rule-based mocks — there is no LLM call anywhere in the repo. This is an accuracy/marketing risk if presented to users as AI.
- Several backend-complete features have zero UI (brew logs, taste profiles, coffee setup, brew profiles, recipe-insight recalculation, AI recommendations, and the original Premium-gated "analyze my recipe" coach flow, which is now orphaned dead code after the Phase 19 rebuild).
- No billing integration (Premium is a manual/DB-only concept) and no tests of any kind.
- Footer links to Blog/Careers/Press/Help Center/Privacy Policy/Terms/Cookies pages that do not exist (`href="#"`) — a real legal/compliance gap for public launch.
- Contact form and "Convert Recipe" apply button are both non-functional by design (previews-only / local-state-only).

---

## 2. Project Structure

```
brewatlas/
├── app/
│   ├── (site)/                # Route group — all public + authed pages (no URL impact)
│   │   ├── page.tsx            # Homepage
│   │   ├── recipes/, methods/, origins/, roasters/, devices/, culture/, community/, premium/, about/, contact/
│   │   ├── coach/               # AI Coach tools page
│   │   ├── login/, signup/, forgot-password/, reset-password/
│   │   ├── dashboard/           # Authenticated area (profile, recipes CRUD, favorites, brew-history, xbloom)
│   │   └── layout.tsx           # Site chrome: nav, footer, ambient background
│   ├── auth/callback/route.ts   # Supabase PKCE code exchange
│   ├── icons/*/route.tsx        # Generated PWA icon PNGs
│   ├── components/              # All reusable UI (see §4)
│   ├── hooks/use-media-query.ts
│   ├── layout.tsx, loading.tsx, error.tsx, not-found.tsx
│   └── manifest.ts, robots.ts, sitemap.ts, apple-icon.tsx
├── lib/
│   ai/            # Coach engine, coach-tools engine, recommendation/discovery/similarity engines, LLM/coach adapters
│   converter/     # Deterministic recipe conversion engine + 16 device rule modules
│   intelligence/  # Pure recipe-analysis heuristics (ratio, extraction risk, sensory)
│   supabase/      # Client/server/middleware factories + ~20 "*-actions.ts" Server Action files
│   data/          # Repository layer (static + Supabase-backed) consumed by pages
│   i18n/          # Dictionary system, locale resolution, translation context/adapter
│   membership/    # Plan/feature access helpers
│   billing/       # Billing adapter (stub)
│   seo/, security/, branding/, pwa/, utils/, constants/
├── data/homepage.ts             # Canonical English static marketing content (recipes/methods/origins/FAQs)
├── types/                       # Domain type definitions (one file per domain)
├── supabase/migrations/         # ~64 SQL migrations (schema + seed data)
├── proxy.ts                     # This Next.js version's middleware equivalent (session refresh, locale, route protection)
└── public/                      # Images, manifest icon, sw.js
```

**Entry points:** `app/layout.tsx` (root HTML/providers) → `app/(site)/layout.tsx` (nav/footer chrome) → route pages. `proxy.ts` runs before every matched request.

**Feature organization:** Feature-oriented under `app/components/<feature>/` (`coach/`, `converter/`, `recipes/`, `profile/`) plus a generic `ui/` primitive layer and `cards/`/`sections/` for content presentation.

**Shared libraries/utilities:** `lib/utils/arrays.ts`, `lib/utils/slugify.ts`, `lib/constants/styles.ts` (shared Tailwind class tokens), `lib/i18n/format.ts`.

**Configuration files:** `next.config.ts` (security headers, image remote patterns, server action body limit), `eslint.config.mjs`, `tsconfig.json` (strict), `postcss.config.mjs`, `supabase/config.toml`.

---

## 3. Existing Pages

| URL | Purpose | Data Source | Status |
|---|---|---|---|
| `/` | Marketing homepage (hero, recipes, methods, origins, roasters, testimonials, pricing, FAQ) | Static i18n content | Complete |
| `/recipes` | Searchable recipe library | Static + Supabase (merged) | Complete |
| `/recipes/[slug]` | Recipe detail | Static (summary + "unlock" CTA) or Supabase (full detail, favorites, owner edit/delete) | Complete (DB) / Partial (static) |
| `/methods` | Brewing methods grid | Static home content | Complete |
| `/origins` | Coffee origins grid | Static home content | Complete |
| `/roasters` | Roasters grid | Static home content | Complete |
| `/devices` | Device listing + xBloom callout | Static home content | Complete |
| `/devices/xbloom` | xBloom models + profile explainer | Static constants + i18n | Complete (no live device API) |
| `/coach` | Diagnose / Generate / Improve recipe tools | Client-side rule engine (mock) | Partial (functionally complete UI, but not real AI) |
| `/community` | Top brewers + highest-rated recipes | Supabase | Complete |
| `/premium` | Pricing plans + FAQ | Static home content | Partial (no checkout; CTAs → `/login`/`/contact`) |
| `/culture` | Culture hub sections | Supabase | Complete |
| `/culture/[section]` | Section topic list | Supabase | Complete |
| `/culture/[section]/[topic]` | Culture article | Supabase | Complete |
| `/culture/guide` | Emirati Coffee Guide index | Supabase + curated map | Complete (shows "Coming soon" for unpublished topics — intentional empty state) |
| `/about` | About copy, stats, CTAs | Static i18n + hardcoded marketing numbers | Partial (stats like "12,400+" are placeholders, not real metrics) |
| `/contact` | Support info + contact form | Client local state only | Partial (form does not submit anywhere — no API/email) |
| `/login` | Email + OAuth login | Supabase Auth | Complete (not in main nav) |
| `/signup` | Registration + OAuth | Supabase Auth | Complete (not in main nav) |
| `/forgot-password` | Password reset request | Supabase Auth | Complete |
| `/reset-password` | Set new password (recovery session) | Supabase Auth (gated) | Complete |
| `/offline` | PWA offline fallback | Static EN dictionary | Complete (intentional; `robots.ts` disallows) |
| `/dashboard` | Authed home: profile, recipes, favorites, quick links | Supabase | Complete |
| `/dashboard/favorites` | Saved recipes | Supabase | Complete |
| `/dashboard/profile` | Edit profile | Supabase | Complete |
| `/dashboard/recipes` | Manage own recipes | Supabase | Complete |
| `/dashboard/recipes/new` | Create recipe | Supabase | Complete |
| `/dashboard/recipes/[id]/edit` | Edit own recipe | Supabase | Complete |
| `/dashboard/brew-history` | Brew logs list | Supabase | Complete (read-only; no create UI on this page) |
| `/dashboard/xbloom` | User's xBloom profiles | Supabase | Complete |
| `/auth/callback` | PKCE code exchange → redirect | Supabase Route Handler | Complete (not a page) |

**Referenced but missing routes (linked from the footer as `href="#"`, no page exists):** Blog, Careers, Press, Help Center, Privacy Policy, Terms, Cookies, and social links (Instagram/Twitter/YouTube/RSS). These render as dead stub links, not broken `<Link>`s to nonexistent App Router paths — so the build doesn't fail, but the UX/legal gap is real.

**Orphan pages (implemented, but not reachable from primary navigation):** `/login`, `/signup`, and the entire `/dashboard` tree are absent from `SiteNav` and the footer (only reachable via CTAs, post-auth redirects, or the PWA manifest shortcuts). A `settings` label exists in `site-nav.tsx`'s defaults but there is no `/settings` route — dead label, not a dead page.

---

## 4. Components

*(Reusability scored 1–5, 5 = most generic/reusable. "Used In" counts are distinct importers found via search, not including the file's own tests.)*

### Core UI primitives (`app/components/ui/`) — highest reuse tier
| Component | Purpose | Used In | Reusability |
|---|---|---|---|
| `SectionFrame` | Section layout shell + scroll-reveal | ~20+ pages/sections | 5 |
| `PageHeader` | Page-level title/eyebrow/description block | ~15+ pages | 5 |
| `RippleLink` | Interactive link with ripple effect | Nav, pages, many cards | 5 |
| `MetaTile` | Icon + label + value tile | Cards, recipe detail, coach | 5 |
| `GhostCtaLink` | Secondary/ghost CTA link | 6+ cards | 5 |
| `SectionIntro` | Eyebrow/title/description for sections | Most home/UAE sections | 5 |
| `DifficultyIndicator` | Dot-meter difficulty display | `MethodCard`, recipe detail | 4 |
| `FaqAccordion` | Expandable FAQ list | `FaqSection`, `/premium` | 4 |
| `RevealOnScroll` | Scroll-reveal wrapper | `SectionFrame`, `SiteFooter` | 4 |
| `AnimatedStat` | Count-up stat display | `/about` only | 3 (underused) |
| `PremiumImage` | `next/image` + overlay + fallback | `TestimonialsSection` only | 3 (underused) |
| `TiltCard` | Pointer-tilt wrapper | `TestimonialsSection` only | 3 |
| `UaePatternDivider` | Decorative brand divider | 2 places | 2 |

### Domain cards (`app/components/cards/`)
| Component | Used In | Reusability | Notes |
|---|---|---|---|
| `RecipeCard` | Explorer, dashboard, favorites, home | 4 | Most-reused domain card |
| `MethodCard`, `OriginCard`, `RoasterCard`, `PricingCard` | Home section + matching listing page each | 3 | Near-identical shell pattern |
| `CultureSectionCard`, `CultureTopicCard` | `/culture`, `/culture/[section]` | 2–3 | Mirrors `OriginCard` layout |
| `UaeCoffeeGuideEntryCard` | `/culture/guide` | 2 | |
| `UaeRoasterCard`, `UaeHeritageHighlightCard`, `UaeCoffeeMapLocationCard` | **0 live consumers** | 1 | Dead — see §15 |

### Feature shells
| Component | Purpose | Location | Used In | Reusability |
|---|---|---|---|---|
| `AiCoachTools` | Orchestrates coach tabs/form/response | `coach/ai-coach-tools.tsx` | `/coach` | 1 |
| `CoachResponseCard`, `CoachToolForm`, `CoachToolTabs` | Coach sub-widgets | `coach/*` | Inside `AiCoachTools` | 2 |
| `RecipeConverterButton` / `RecipeConverterModal` | Recipe→device conversion UI | `converter/*` | `/recipes/[slug]` only | 2 |
| `DeviceSelector`, `ConversionPreferences`, `ConversionWarnings`, `ConverterPreview` | Converter modal internals | `converter/*` | Inside `RecipeConverterModal` | 2–3 |
| `ConfidenceIndicator` | Filled-dot confidence meter | `converter/`, `CoachResponseCard` | 3 | Visual twin of `DifficultyIndicator` |
| `RecipeForm` | Create/edit recipe | `recipes/recipe-form.tsx` | New + edit dashboard pages | 2 |
| `FavoriteButton`, `DeleteRecipeButton` | Recipe actions | `recipes/*` | Explorer, detail, dashboard | 3 |
| `ProfileForm` | Edit profile | `profile/profile-form.tsx` | `/dashboard/profile` | 1 |
| `SiteNav`, `SiteFooter`, `LanguageSwitcher`, `FloatingActions`, `PageLoader`, `client-chrome`, `ServiceWorkerRegistration`, `JsonLd` | App-wide chrome/singletons | `layout/`, `pwa/`, `seo/` | Root/site layout | 1–3 |

### Home sections (`app/components/sections/`)
`HeroSection`, `FeaturedRecipesSection`, `BrewingMethodsSection`, `CoffeeOriginsSection`, `TopRoastersSection`, `PricingSection`, `TestimonialsSection`, `FaqSection`, `FeatureSpotlightSection` — all homepage-only (reusability 1–3 by design), composed via `lib/dynamic-sections.ts` (`next/dynamic` code-splitting wrappers, not a content system).

### Dead component cluster (`app/components/sections/uae/`)
`CoffeeHeritageSection`, `FeaturedUaeCoffeeSection`, `FeaturedUaeRoastersSection`, `UaeCoffeeCultureSection` — all fully built but **zero consumers**; prepared for a UAE homepage integration that never shipped. See §15.

---

## 5. Features

| Feature | Status | Evidence |
|---|---|---|
| Homepage | Complete | Static, fully localized, all sections wired |
| Recipes (browse) | Complete | Merges static + published DB recipes |
| Recipe Detail | Complete (DB) / Partial (static) | DB recipes get full detail + favorites + owner tools; static recipes show summary + "unlock" CTA |
| Recipe Search/Filters | Complete | Client-side filtering in `recipes-explorer.tsx` |
| Recipe Converter | Partial | Live rule-based preview across 16 devices; "Convert/Apply" action intentionally disabled ("later phase") |
| AI Coach | Partial (mock) | Real deterministic engine + full bilingual UI; **no LLM**, not premium-gated (unlike the older orphaned coach flow) |
| Authentication | Complete | Email/password + Google/Apple OAuth, PKCE, password reset |
| User Profiles | Complete | Profile CRUD + avatar upload to Supabase Storage |
| Favorites | Complete | DB-backed, toggled from cards and detail pages |
| Membership/Premium | Partial | DB-backed plans/features/trials; **no billing processor wired** (manual only) |
| Pricing | Complete (display only) | Static plan content; CTAs don't checkout |
| Devices | Complete | Static catalog + xBloom callout |
| Brewing Methods | Complete | Static catalog |
| Origins | Complete | Static catalog |
| Roasters | Complete | Static catalog |
| Coffee Culture | Complete | Fully DB-backed hub/section/topic hierarchy |
| Community | Complete | Leaderboards (top brewers, highest-rated recipes) from Supabase |
| Dashboard | Complete | Profile snapshot, own recipes, favorites, quick links |
| Brew History / Brew Logs | Planned (backend-complete, minimal UI) | `user_brew_logs` table + full action file exist; dashboard page only lists, no logging UI found |
| Personal Taste Profile / Coffee Setup | Planned (backend-complete, no UI) | Tables + actions exist (`lib/data/personal.ts`); not referenced anywhere in `app/` |
| Recipe Insights (recalculate) | Planned (backend-complete, no UI trigger) | `recipe-intelligence-actions.ts` comments confirm "UI does not call these yet" |
| AI Recommendations/Discovery/Similarity | Planned (backend-complete, no UI) | `lib/ai/recommendation-engine.ts` etc. + `lib/data/ai.ts` wired to DB, zero page consumers |
| Localization (EN/AR) | Complete | 54 namespaces, ~930 keys, 0 diffs between locales |
| Language Switcher | Complete | Cookie-based, instant, no reload required |
| RTL | Complete | `dir="rtl"` driven by locale, verified in browser testing |
| PWA | Complete | Manifest, icons, offline page, versioned service worker |
| SEO | Partial | Sitemap/robots/hreflang/site-level JSON-LD complete; **no per-recipe Recipe/HowTo structured data**; sitemap excludes DB/user recipes |
| Analytics (tracking) | Not Started | No GA/Segment/PostHog/etc. found anywhere; `advanced_analytics` is an unused internal membership feature flag, not a tracking integration |
| Supabase | Complete (infrastructure) | ~40-table RLS-secured schema, real client/server/middleware setup |
| Contact Form | Placeholder | Sets local `submitted` state only; no email/API call |
| Community Follows/Likes/Reviews/Badges | Complete (backend) / Partial (UI) | Actions and tables are real and used by community page/leaderboards, but no dedicated review-writing or follow-management UI was found |

---

## 6. Database

**Client setup:** `@supabase/ssr` browser client (`lib/supabase/client.ts`) and cookie-bound server client (`lib/supabase/server.ts`); no service-role key used anywhere in application code (publishable key only) — a good security practice.

**Tables (from 64 migrations, RLS enabled on all):**

| Table | Purpose |
|---|---|
| `profiles` | User profile + `role` (user/admin) |
| `brewing_methods`, `devices`, `origins`, `roasters`, `grinders`, `filter_types`, `water_profiles`, `tags` | Lookup/editorial tables (public read, admin write) |
| `coffees` | Coffee bean catalog |
| `recipes`, `recipe_pours`, `recipe_images`, `recipe_tags` | Core recipe + children |
| `favorites` | Saved recipes (owner-only) |
| `brew_devices`, `brew_profiles`, `brew_profile_steps` | "Smart brew engine" — built, not UI-wired |
| `xbloom_devices`, `xbloom_profiles`, `xbloom_profile_steps` | xBloom device modeling |
| `recipe_insights`, `recipe_insight_warnings` | Recipe Intelligence engine output persistence |
| `culture_sections`, `culture_topics` | Coffee culture hub content |
| `user_coffee_setups`, `user_taste_profiles`, `user_taste_profile_processes`, `user_brew_logs` | Personal experience — built, minimally UI-wired |
| `user_follows`, `recipe_likes`, `recipe_reviews`, `recipe_review_helpful_votes`, `badges`, `user_badges`, `user_community_stats`, `user_activities`, `user_notifications` | Community/social graph |
| `recipe_feature_vectors`, `ai_user_profiles`, `ai_coach_analyses` | AI recommendation/coach persistence |
| `recipe_translations`, `coffee_translations`, `device_translations`, `origin_translations`, `brewing_method_translations`, `ai_content_translations` | Database-level i18n (separate from the app's static dictionary system) |
| `uae_heritage_highlights`, `uae_coffee_map_locations` | UAE brand content |
| `subscriptions`, `subscription_history`, `plan_permissions`, `trial_usage`, `feature_access` | Membership/billing state |

**Views:** `recipe_rating_summary` (aggregated ratings).

**Functions:** `set_updated_at()`, `is_admin()` (SECURITY DEFINER), `prevent_role_escalation()` (trigger), `handle_new_user()` (trigger on `auth.users`), `recipe_favorites_count()`, `refresh_user_community_stats()`, `trending_recipes/coffees/roasters/brewing_methods()`, `create_notification()`, `evaluate_and_award_badges()`.

**Enums:** No native Postgres enums — all constrained via `CHECK` on text columns (`profiles.role`, `recipes.difficulty`, `xbloom_profiles.device_model`, membership `plan`/`status`, etc.).

**Storage:** `avatars` and `recipe-images` buckets, both public-read with `INSERT/UPDATE/DELETE` scoped to `auth.uid()`-prefixed paths.

**RLS policy pattern:** Consistent five-shape model — public-read lookups, owner-scoped CRUD, recipe-visibility-inherited children, public-read/self-write community tables, and RPC-only writes for aggregated stats.

**Server Actions (`lib/supabase/*.ts`, ~20 files):** All perform **real** Supabase queries — no mock/stub action files exist. Several are explicitly commented as "groundwork" with no UI caller yet: `coffee-setup-actions.ts`, `taste-profile-actions.ts`, `brew-log-actions.ts` (partially used), `brew-profile-actions.ts`, `xbloom-actions.ts` (partially used), `recipe-intelligence-actions.ts`, `ai-actions.ts`, `ai-coach-actions.ts` (now orphaned, see §15).

**`lib/data/*.ts` data sources:**

| File | Source |
|---|---|
| `recipes.ts` | Static (`data/homepage.ts`) |
| `db-recipes.ts`, `culture.ts`, `community.ts`, `membership.ts`, `personal.ts`, `uae-brand.ts`, `xbloom.ts`, `ai.ts`, `ai-coach.ts`, `brew-engine.ts`, `translations.ts`, `recipe-insights.ts` | Supabase |

**Required environment variables** (`.env.local.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` only — no service-role key or direct DB URL committed.

---

## 7. Authentication

- **Login:** Email/password via `signInWithPassword` (Server Action in `lib/supabase/actions.ts`), plus Google/Apple OAuth via `signInWithOAuth`, both real Supabase provider calls (not stubs).
- **Signup:** `signUp` Server Action; `handle_new_user()` DB trigger creates a `profiles` row, with `ensureProfile()` as an application-level fallback.
- **Session:** Cookie-based via `@supabase/ssr`, refreshed on nearly every request by `updateSession()` in `lib/supabase/middleware.ts`, invoked from root `proxy.ts` (this Next.js version's middleware-equivalent entry point).
- **Middleware/Proxy:** `proxy.ts` handles session refresh, locale-cookie resolution, and redirects unauthenticated visitors away from protected prefixes.
- **Protected routes:** `PROTECTED_PATH_PREFIXES = ["/dashboard"]`. There's no `dashboard/layout.tsx` gate; each dashboard page also independently calls `getUser()` and redirects — deliberate defense-in-depth, confirmed in `app/(site)/dashboard/page.tsx`.
- **User roles:** `profiles.role` (`user`/`admin`) exists in the DB and is used by `is_admin()` inside **RLS policies**, but application code (`app/`, `lib/supabase/*`) never checks `role` for UI/route gating — admin capability is DB-level only today.
- **Authorization flow (membership):** `lib/membership/access.ts` defines `isPremium`, `canUseAI`, `canAccessRecipe`, `canCreateCollection`, `hasRemainingUsage`. Only `canUseAI` is actually called anywhere (`lib/supabase/ai-coach-actions.ts`) — and that action file is itself orphaned (no UI caller). The live public `/coach` page has **no** membership gate at all. `canAccessRecipe`/`canCreateCollection`/`hasRemainingUsage` are defined but never invoked.
- **OAuth configuration:** Code is real and complete; whether Google/Apple providers are actually enabled in the live Supabase project cannot be verified from the repository — **not enough evidence to determine**.

---

## 8. Internationalization

- **Dictionary structure:** `Dictionary` type in `lib/i18n/types.ts` with **54 top-level namespaces** (`nav`, `common`, `auth`, `coachTools`, `recipeConverter`, `metadata`, etc.), loaded server-side via `getDictionary(locale)` and exposed client-side through `TranslationProvider` + `useTranslations().t("ns.key")`.
- **Separate homepage content system (by design, not duplication):** `getHomeContent()` loads `lib/i18n/home-content/{en,ar}.ts` for large structured marketing content (recipes, methods, FAQs), keeping enum-like keys in English (via `home-labels.ts`) so URLs/slugs stay locale-stable while display text is translated.
- **Supported languages:** `en` (default), `ar`, defined in `SUPPORTED_LOCALES` (`types/i18n.ts`).
- **RTL:** `directionFor(locale)` sets `<html lang dir>` in `app/layout.tsx` — `ar` renders `dir="rtl"`. Verified visually via browser testing (see Phase 19 session).
- **Language switcher:** `LanguageSwitcher` posts a Server Action that sets a 1-year `brewatlas_locale` cookie and revalidates — instant, no manual refresh needed. `proxy.ts` resolution order: `?lang=` query → existing cookie → `Accept-Language` header → `en` default.
- **Key parity:** Both dictionaries expose the same 54 namespaces and ~930 leaf keys with **zero key-path differences** between `en.ts` and `ar.ts` (enforced structurally — both are typed as `Dictionary`, so a mismatch is a compile-time error).
- **Missing translations:** None found in the primary product surface.
- **Hardcoded strings found** (all isolated to the currently-unwired UAE homepage section cluster, plus a handful of minor exceptions):

| File | String | Context |
|---|---|---|
| `app/components/sections/uae/uae-coffee-culture-section.tsx` | "Deep Dive", "UAE Coffee Culture", description | `SectionIntro` props (component not wired to any page) |
| `app/components/sections/uae/coffee-heritage-section.tsx` | "Emirati Coffee Heritage" / "Coffee Heritage" + blurb | Same — unwired |
| `app/components/sections/uae/featured-uae-roasters-section.tsx` | "Roasted in the Emirates" / "UAE Featured Roasters" + blurb | Same — unwired |
| `app/components/sections/uae/featured-uae-coffee-section.tsx` | Brand story text, "Explore the Emirati Coffee Guide" | Partly from an English-only `UAE_BRAND_STORY` constant; a translated `culturePage.guideCta` key already exists but isn't used here |
| `app/components/cards/uae-heritage-highlight-card.tsx` | "Read the full story" | CTA text |
| `app/components/cards/uae-roaster-card.tsx` | "Location" / "United Arab Emirates" / "Website" / "Visit site" / "Visit Roaster" | Labels/CTA |
| `app/components/cards/uae-coffee-map-location-card.tsx` | "Location" | Label |
| `app/components/coach/coach-tool-form.tsx` | "Medium-Fine" (grind size placeholder) | Minor, locale-neutral example text |
| `app/auth/callback/route.ts` | "Missing or invalid confirmation code." | Error query param, not rendered as page copy |

None of these are on any live, linked page except the coach placeholder and the auth callback error string, both minor. The bulk of the finding is entirely inside dead code (§15).

---

## 9. Recipe System

- **Static recipes:** `lib/data/recipes.ts` wraps `featuredRecipes` from `data/homepage.ts` — the canonical, locale-stable English recipe catalog (used for the homepage, marketing pages, and `generateStaticParams`).
- **Database recipes:** `lib/data/db-recipes.ts` is a full Supabase repository: `getPublishedDbRecipes`, `getDbRecipeDetailBySlug`, `getUserRecipes`, `getUserFavoriteRecipes`, slug-uniqueness checks against the static catalog, and lookup-option fetchers for the recipe form.
- **Rendering:** `/recipes` merges static + published DB recipes into one filterable list (`recipes-explorer.tsx`, client component). `/recipes/[slug]` branches: a static slug renders `StaticRecipeView` (summary content + "unlock" CTA, no favorites/edit/delete); any other slug resolves via `getDbRecipeDetailBySlug` into `DbRecipeView` (full parameters, pours, coffee info, favorites, owner edit/delete, xBloom compatibility badge).
- **Recipe metadata:** Built inline per-page via `buildLocalizedMetadata`; `lib/seo/metadata.ts` only provides site-wide metadata helpers, not recipe-specific structured data generators.
- **Recipe cards:** `RecipeCard` is the single shared card used across explorer, dashboard, favorites, and homepage.
- **Recipe detail pages:** Show device compatibility (including xBloom when a linked profile exists), full brewing parameters, and (for DB recipes) owner tools.
- **Recipe converter integration:** `RecipeConverterButton`/`Modal` appear only on `/recipes/[slug]` (both static and DB views) — not on the explorer/listing page.
- **Data flow:** Dashboard create/edit uses `RecipeForm` → `createRecipeAction`/`updateRecipeAction` (`lib/supabase/recipe-actions.ts`) → Supabase; delete uses `DeleteRecipeButton` → `deleteRecipeAction`. This path is DB-backed end-to-end.
- **Gap:** `app/sitemap.ts` only includes `getAllRecipeSlugs()` from the **static** catalog — published DB/user recipes are publicly viewable but excluded from the sitemap. There is also no per-recipe `Recipe`/`HowTo` JSON-LD structured data (only site-level Organization/WebSite schema).

---

## 10. AI System

**Verdict:** No live third-party LLM integration exists anywhere in this repository. Every "AI" feature is a deterministic, rule-based engine that simulates AI-style output; several are explicitly documented in code comments as intentionally non-random and non-LLM.

| Module | Category | Evidence |
|---|---|---|
| `lib/ai/coach-engine.ts` | **Mock / real deterministic implementation** | Pure scoring over Recipe Intelligence metrics; doc comment: "no I/O… no external API" |
| `lib/ai/coach-messages.ts` | **Mock (deterministic copy)** | Template strings generated from metrics; "nothing here is randomized or LLM-generated" |
| `lib/ai/coach-utils.ts` | Real implementation (helpers) | Scoring/label utilities |
| `lib/ai/coach-adapter.ts` | **Architecture-only + mock default** | `RuleBasedCoachAdapter` works; OpenAI/Anthropic/Gemini adapters throw `CoachAdapterNotConfiguredError`; no `fetch` calls |
| `lib/ai/coach-prompts.ts` | **Architecture-only** | Prompt-building scaffolding for a future model; not sent anywhere in the live UI path |
| `lib/ai/coach-tools-engine.ts` | **Mock implementation** | Explicitly documented as "mock reasoning (Phase 19)"; powers Diagnose/Generate/Improve |
| `lib/ai/coach-tools-adapter.ts` | **Architecture-only + mock default** | `MockCoachToolsAdapter` is the live default; provider stubs throw `CoachToolsAdapterNotConfiguredError` |
| `lib/ai/llm-adapter.ts` | **Architecture-only / not implemented** | Every `complete`/`embed` method throws `LLMNotConfiguredError`; TODO for Anthropic embeddings |
| `lib/ai/discovery-engine.ts` | **Mock (rule-based NL parsing)** | Keyword/regex filters; comment: "do NOT call external APIs yet" |
| `lib/ai/feature-vectors.ts` | Mock/real heuristic | Deterministic sensory vectors; notes future embeddings hook |
| `lib/ai/recommendation-engine.ts` | Real deterministic implementation | Weighted scoring, no I/O |
| `lib/ai/similarity-engine.ts` | Real deterministic implementation | Cosine/Euclidean taste similarity |
| `lib/data/ai.ts` / `ai-coach.ts` | Real orchestration + Supabase | Wires the above engines to the database; no LLM calls |
| `lib/supabase/ai-actions.ts` / `ai-coach-actions.ts` / `recipe-intelligence-actions.ts` | Real Server Actions (groundwork) | Comments confirm "nothing in the UI calls these yet" (the coach one is additionally now fully orphaned) |
| `lib/intelligence/recipe-analysis.ts` | Real deterministic implementation | Heuristic ratio/strength/extraction/sensory calculations |
| `app/(site)/coach/page.tsx` + `app/components/coach/*` | **Mock UI (working)** | Calls `runCoachTool` from the client-side mock engine directly — not the LLM adapter, not the Supabase-backed coach-history flow |

**Already implemented:** Recipe Intelligence heuristics, the AI Coach's rule-based scoring/messaging, the recipe converter's device rules, recommendation/similarity/discovery engines (DB-wired, UI-unused).
**Mock implementation:** Everything the user actually sees on `/coach` today.
**Architecture only:** OpenAI/Anthropic/Gemini adapters for both the coach and generic LLM use cases, prompt builders.
**Not implemented:** Any real external AI API call, of any kind, anywhere in the codebase.

---

## 11. xBloom Integration

- **Current implementation:** Full internal data model — `xbloom_devices`, `xbloom_profiles`, `xbloom_profile_steps` tables; `lib/data/xbloom.ts` repository; `lib/supabase/xbloom-actions.ts` Server Actions (real Supabase writes, documented as UI groundwork beyond the dashboard listing).
- **Supported devices:** `xBloom Studio`, `xBloom Original`, `xBloom Lite`, `xBloom Omni` (canonical list in `types/xbloom.ts` and seed data).
- **Recipe conversion:** Studio, Omni, and Original each have a dedicated rule module under `lib/converter/rules/` and are selectable targets in the converter UI. **`xBloom Lite` has no converter rule** and is not in `CONVERTER_DEVICES`.
- **Device abstraction:** `/devices/xbloom` is static marketing copy; `/dashboard/xbloom` lists the signed-in user's real profiles; recipe detail pages show an xBloom-compatible badge when a linked profile exists.
- **Limitations:** Explicitly documented as **not** a live xBloom hardware/cloud API integration — this is internal modeling of brewing parameters only. No device sync, export-to-machine flow, or third-party xBloom SDK usage was found anywhere in the repo.

---

## 12. Production Readiness

| Category | Score (0–10) | Rationale |
|---|---|---|
| Architecture | 8 | Consistent adapter pattern, clean layering (data → actions → pages), strong typing |
| Performance | 6 | Turbopack + `optimizePackageImports` + cache headers are good; no measured Core Web Vitals/bundle audits found in-repo |
| Accessibility | 5 | `aria-hidden` used on icons, skip link present; no dedicated a11y audit evidence (no axe/lighthouse artifacts in repo) |
| SEO | 7 | Sitemap/robots/hreflang/site JSON-LD are solid; missing per-recipe structured data and DB-recipe sitemap coverage |
| Security | 8 | RLS everywhere, strict CSP/HSTS/security headers, role-escalation trigger, storage path scoping, publishable-key-only client |
| Scalability | 6 | Schema is well-normalized; no caching/CDN strategy beyond Next defaults evident; no load-testing artifacts |
| Maintainability | 7 | Very well-commented code with explicit "why", consistent naming; some duplicated grind/time-parsing logic (§14) |
| Testing | 0 | No test framework installed, no test files found anywhere in the repository |
| Responsive Design | 7 | Tailwind responsive classes used pervasively across pages/components; not independently device-verified in this audit |
| UX | 6 | Polished visual design; several dead-end CTAs (contact form, converter apply button, footer legal links) hurt real UX |
| Code Quality | 8 | Strict TypeScript, no `console.log` debug leftovers, consistent Server Action conventions |
| Documentation | 4 | `README.md` is untouched `create-next-app` boilerplate; real documentation lives only in code comments (extensive, but not centralized) |

---

## 13. Missing Features

Based strictly on repository evidence — no speculative feature suggestions:

- Real payment/billing processor integration (Stripe/Apple Pay/Google Pay) — architecture exists, no implementation.
- Real third-party LLM integration for the AI Coach — architecture exists, no implementation.
- Working contact form submission (currently local-state only).
- "Apply/save" action for the recipe converter (preview works; the actual conversion-apply step is disabled by design).
- Privacy Policy, Terms of Service, Cookies, Help Center, Blog, Careers, Press pages (all linked from the footer but not built).
- Any UI for: personal coffee setup, taste profile editor, structured brew-profile builder, recipe-insight recalculation trigger, and AI recommendation/discovery surfaces (all backend-complete).
- Web analytics/tracking integration (no GA/Segment/PostHog/etc.).
- Automated tests of any kind (unit, integration, or E2E).
- Admin-facing UI for `role`-gated actions (the `is_admin()` DB function exists only for RLS; no admin dashboard was found).
- Converter support for `xBloom Lite`.

---

## 14. Duplicate Logic

| Case | Verdict | Evidence |
|---|---|---|
| `coach-engine.ts` vs `coach-tools-engine.ts` | **Intentional layering, not duplication** | The latter imports `analyzeRecipeForCoaching` from the former and `DEVICE_RULES` from the converter — metric math is shared, not reimplemented. |
| Grind-scale labeling across `lib/converter/grind-scale.ts`, `lib/intelligence/recipe-analysis.ts`, `lib/ai/coach-utils.ts` | **True parallel implementation (mild–medium smell)** | Two different scales (0–10 microns-based vs. 1–7 exact-key map) and two different parsing strategies for what is conceptually the same "grind size" concept. |
| `parseTimeToSeconds` in `lib/converter/time.ts` vs. `lib/intelligence/recipe-analysis.ts` | **Duplicate with divergent behavior** | Converter version supports `H:MM:SS`; intelligence version supports `"N hr"` phrasing instead — genuinely different input formats handled by two separate parsers. |
| `clamp()` reimplemented in `coach-utils.ts`, `recipe-analysis.ts`, `converter/time.ts` | Trivial duplication — low priority | One-line utility, not worth extracting urgently. |
| `data/homepage.ts` vs `lib/i18n/home-content/{en,ar}.ts` vs `lib/dynamic-sections.ts` | **Not duplicates — distinct roles** | First is the canonical English structural/slug data; second is the locale-content loader (EN re-exports the first, AR is a translated overlay); third is purely a `next/dynamic` code-splitting helper with no content at all. |
| `recipes.ts` vs `db-recipes.ts` vs `recipe-insights.ts` | Intentional separation | Static slugs, DB recipe repository, and intelligence-output persistence are three genuinely distinct concerns. |
| `buildRecipeAnalysisInputForRecipe` (`recipe-insights.ts`) vs. the coach source-row loader (`ai-coach.ts`) | **True duplication at the data-access layer** | Both fetch nearly identical recipe joins (dose/water/grind/pours/xBloom) with separately hand-written select/map logic rather than a shared query builder. |

---

## 15. Dead Code

**Unused components (zero live route consumers):**
- `UaeCoffeeMapLocationCard`, `CoffeeHeritageSection`, `FeaturedUaeCoffeeSection`, `FeaturedUaeRoastersSection`, `UaeCoffeeCultureSection`, `UaeHeritageHighlightCard`, `UaeRoasterCard` — a fully-built UAE homepage section cluster (7 files) prepared but never integrated into any page.

**Unused Server Actions:**
- `analyzeRecipeAction` and `getCoachHistoryAction` (`lib/supabase/ai-coach-actions.ts`) — the original Premium-gated "analyze my saved recipe" AI Coach flow. Confirmed via repo-wide search: **zero importers**. This became orphaned when the Phase 19 rebuild replaced the old coach demo UI with the new mock-tools UI, which never calls this file.

**Unused membership/access helpers:**
- `canAccessRecipe`, `canCreateCollection`, `hasRemainingUsage` (`lib/membership/access.ts`) — defined, exported, never called from any route or component.
- `advanced_analytics` feature flag — defined in `types/membership.ts`, seeded in `plan_permissions`, never checked via `hasFeature()` anywhere in the app.

**Mildly dead export surface (only used internally, re-exported but no external caller):**
- `formatSecondsAsTime`, `grindIndexToLabel`, `grindIndexToMicrons` — called only by sibling functions within the converter module, not by any consumer outside it.

**Unused pages/routes:** None found — every `page.tsx` under `app/` is reachable by at least one link, redirect, or PWA shortcut (see §3 for the orphan-from-nav distinction, which is a discoverability issue, not literal dead code).

**Unused assets:** None found — every file under `public/` is referenced by static content, seed data, or the service worker precache list.

**Unused types/hooks:** No unused hook files or type modules were identified; `use-media-query.ts` has exactly one consumer (`TiltCard`) but is not dead.

---

## 16. Technical Debt

- **AI-branding risk:** Presenting a fully deterministic rule engine as an "AI Coach" without any disclosure is a real user-trust/accuracy risk if this ships as-is to production, independent of code quality.
- **Orphaned premium-gated feature:** The only place `canUseAI`/Premium gating was ever enforced (`ai-coach-actions.ts`) is dead code; the feature that replaced it in the UI (`/coach`) has no gating at all. This is a silent regression in access control between two versions of the same feature area.
- **Divergent time/grind parsing:** Two independent time-string parsers and two independent grind scales create a real risk of subtle inconsistency (e.g., a value that parses correctly in the converter failing silently in the coach engine, or vice versa) as the codebase grows.
- **Data-access duplication:** The near-identical recipe-join loaders in `recipe-insights.ts` and `ai-coach.ts` will drift if the `recipes` schema changes and only one is updated.
- **No automated tests:** Given the amount of numeric/business logic (conversion rules, coaching heuristics, membership limits), the complete absence of unit tests is a genuine scalability/maintainability risk as more device rules or coaching logic are added.
- **`server-only` package usage without a corresponding dependency entry:** `import "server-only"` appears in `lib/i18n/get-dictionary.ts`, `locale.ts`, and `get-home-content.ts`, but `server-only` is not listed in `package.json`. This should be confirmed/resolved before any dependency-strict CI or clean install, since it currently appears to work only incidentally (e.g., via a transitive install) — **not enough evidence from the repo alone to determine why current builds succeed.**
- **Manual billing without reconciliation UI:** Membership plan changes are applied directly in `lib/supabase/membership-actions.ts` with no billing-provider webhook path — acceptable pre-launch, but a scaling risk if any real payments start flowing through an ad hoc process.
- **No admin UI despite admin-aware schema:** `is_admin()` and `role` exist purely for RLS; any real content moderation or plan overrides currently require direct DB access.

---

## 17. Dependencies

| Package | Version | Confirmed Used? |
|---|---|---|
| `@supabase/ssr` | `^0.12.0` | Yes — client/server/middleware factories |
| `@supabase/supabase-js` | `^2.110.2` | Yes — ~17 files across `lib/data`/`lib/supabase` |
| `lucide-react` | `^1.24.0` | Yes — 39 files; also tree-shaken via `optimizePackageImports` |
| `next` | `16.2.10` | Yes — ~63 files |
| `react` / `react-dom` | `19.2.4` | Yes (react) / indirect peer only (react-dom, no direct imports found) |
| `@tailwindcss/postcss`, `tailwindcss` | `^4` | Yes — PostCSS pipeline + `app/globals.css` |
| `typescript`, `eslint`, `eslint-config-next`, `@types/*` | dev only | Yes — build/lint tooling |

**Potentially missing/implied dependency:** `server-only` is imported in three files but not declared in `package.json` (see §16).

**No unused declared dependencies were found** — every package in `package.json` has confirmed real usage.

**Intentionally not installed (by design, per code comments):** Any LLM SDK (`@anthropic-ai/sdk`, Google Generative AI, OpenAI), any billing SDK (Stripe, etc.), any test framework (Jest/Vitest/Playwright), any analytics SDK.

**Potentially outdated/bleeding-edge:** `next@16.2.10` and `react@19.2.4` are very recent major versions; the repo's own `AGENTS.md` flags this as a non-standard Next.js with breaking changes relative to typical training data — a genuine ongoing risk for anyone (human or AI) working on this code without checking `node_modules/next/dist/docs/` first.

---

## 18. Roadmap Recommendation

Based only on what already exists in the repository, in a safe dependency order (no rebuilding, no duplicate work):

1. **Wire up what's already built:** Connect the existing, fully-functional backend groundwork to real UI — brew logging, taste profile/coffee setup editors, recipe-insight recalculation triggers, and the AI recommendation/discovery surfaces. This is the highest-leverage work since the hard part (schema + Server Actions) is done.
2. **Resolve the AI Coach access-control regression:** Decide whether the new mock `/coach` tools should be Premium-gated like the old flow, and either wire `canUseAI` into it or formally retire `analyzeRecipeAction`/`getCoachHistoryAction` and the associated `ai_coach_analyses` table read path.
3. **Consolidate grind-scale and time-parsing logic** into single canonical utilities before adding more converter devices or coaching metrics, to avoid compounding the existing divergence.
4. **Wire or remove the UAE homepage section cluster** (7 dead files) — either finish the integration it was clearly built for, or remove it to reduce maintenance surface.
5. **Build the missing legal/company pages** (Privacy Policy, Terms, Cookies, Help Center) referenced by the footer — required before any public launch for compliance reasons, independent of feature completeness.
6. **Make the contact form functional** and finish the recipe converter's "apply" step, since both currently present a working-looking UI that silently does nothing.
7. **Introduce a test framework** and cover the deterministic engines first (converter rules, coach scoring, membership access helpers) — these are pure functions and the cheapest, highest-value place to start testing.
8. **Only after the above:** evaluate real billing (Stripe) and real LLM integration, since both already have adapter seams ready and were clearly designed to be added last.

---

## 19. Launch Checklist

**Already Complete**
- Supabase Auth (email/password + Google/Apple OAuth), password reset, session middleware
- RLS-secured schema, security headers/CSP, storage policies
- Full EN/AR localization with RTL and 0 missing keys
- PWA (manifest, offline page, versioned service worker)
- SEO fundamentals (sitemap, robots, hreflang, site-level JSON-LD)
- Recipe browsing/detail (static + DB), dashboard CRUD, favorites, community leaderboards
- Deterministic recipe converter (16 devices) and recipe-coaching engine

**Needs Work**
- AI Coach access-control consistency (see §16/§18)
- Per-recipe structured data + DB recipes in sitemap
- Consolidating duplicated grind/time-parsing logic
- Wiring already-built brew-log/taste-profile/insights/recommendation backends to real UI
- Main navigation discoverability for `/login`, `/signup`, `/dashboard`

**Critical Before Launch**
- Build real Privacy Policy, Terms of Service, and Cookies pages (footer currently links to nothing)
- Make the contact form actually send/submit somewhere
- Decide and disclose the true nature of "AI Coach" (rule-based vs. real AI) to avoid misrepresenting the feature
- Replace placeholder marketing statistics on `/about` with real numbers or remove them
- Add at least a minimal automated test suite for financial/limit logic (membership) and conversion math before real users depend on it

**Optional Improvements**
- Real billing processor integration (Stripe) — architecture is ready
- Real LLM integration for AI Coach — adapters are ready
- Admin UI for the existing `is_admin()`/`role` schema
- Web analytics integration
- Wire or remove the dead UAE homepage section cluster
- Add `xBloom Lite` converter support for catalog parity

---

## 20. Final Verdict

**Overall project score:** 68 / 100 — a well-architected, security-conscious codebase with a genuinely mature database layer, let down by an incomplete "final mile" (billing, real AI, legal pages, a few dead-end CTAs) and zero test coverage.

**Production readiness percentage:** ~60%.

**Estimated effort remaining before public launch:** Moderate — primarily integration and compliance work rather than new architecture. The highest-effort remaining items (real billing, real LLM) are optional for a first launch; the truly blocking items (legal pages, contact form, AI-Coach disclosure/gating fix) are comparatively small.

**Top 20 highest-priority remaining tasks:**

1. Build Privacy Policy, Terms of Service, and Cookies pages (footer links are currently dead).
2. Make the `/contact` form actually submit somewhere (email/API).
3. Resolve the AI Coach premium-gating inconsistency between the old (orphaned) and new (ungated) coach flows.
4. Add clear, honest framing of the AI Coach as rule-based guidance rather than implying an LLM, or implement a real LLM via the existing adapter seam.
5. Add `/login`, `/signup`, and `/dashboard` to primary navigation for discoverability.
6. Include published DB/user recipes in `app/sitemap.ts` (currently static-only).
7. Add per-recipe `Recipe`/`HowTo` JSON-LD structured data.
8. Replace hardcoded marketing statistics on `/about` with real or removed figures.
9. Decide the fate of the dead UAE homepage section cluster (finish wiring or delete 7 files).
10. Consolidate the two divergent grind-scale representations and two `parseTimeToSeconds` implementations.
11. Consolidate the duplicated recipe-join loader between `recipe-insights.ts` and `ai-coach.ts`.
12. Remove or repurpose the orphaned `analyzeRecipeAction`/`getCoachHistoryAction` and the unused `canAccessRecipe`/`canCreateCollection`/`hasRemainingUsage`/`advanced_analytics` surfaces.
13. Introduce a test framework and cover the recipe converter and coach-scoring engines first.
14. Finish or explicitly disable the recipe converter's "Apply/Convert" action (currently a dead-looking button).
15. Wire the already-built brew log, taste profile, and coffee setup Server Actions to real dashboard UI.
16. Wire the already-built recipe-insight recalculation action to a real trigger point (e.g., on recipe save).
17. Wire the already-built AI recommendation/discovery/similarity engines to a real "recommended for you" surface.
18. Confirm and formally declare the `server-only` package dependency (currently used without an explicit `package.json` entry).
19. Add `xBloom Lite` to the recipe converter for full catalog parity.
20. Integrate a real billing processor (Stripe) using the existing `lib/billing/billing-adapter.ts` seam once the above are resolved.

---

*This report reflects only what is verifiable in the repository at the time of inspection. No code, configuration, dependencies, or version control state were altered in the course of producing it.*
