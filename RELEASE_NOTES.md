# BrewAtlas Release Notes

## v1.0.0 — Production Release (Phase 25)

**Release date:** July 2026  
**Branch:** `cursor/ai-coach-foundation`

### Highlights

BrewAtlas is production-ready with end-to-end security hardening, performance optimizations, SEO verification, and a full owner analytics suite from Phases 23–25.

### Phase 25 — Final QA, Security, Performance & Production Release

#### Security
- Centralized environment validation (`lib/env.ts`) with startup checks via `instrumentation.ts`
- CSP updated to allow Supabase and Stripe API origins
- In-memory rate limiting for API routes, Stripe webhooks, and auth pages
- CSRF origin verification helper for API routes
- Input sanitization for reviews, contact form, and shared form helpers
- DB trigger preventing users from modifying their own `suspended_at` / `suspension_reason`
- Stripe webhook idempotency via `stripe_webhook_events` table
- Contact form server action with honeypot anti-spam field

#### Performance
- `unstable_cache` wrappers for published recipes and culture content (5-minute TTL)
- Anonymous Supabase client for cache-safe public reads
- Primary navigation link prefetching for high-traffic routes

#### SEO & UX
- Verified sitemap, robots.txt, structured data, canonical URLs, Open Graph, Twitter Cards, hreflang
- Localized `global-error.tsx` (English + Arabic)

#### Quality
- Lint and build verified
- Removed unused `PermissionGuard` component
- Production checklist and release notes added

### Phase 24 — Analytics, Admin Dashboard & Business Tools

- Owner analytics dashboard with KPIs, charts, and recipe leaderboard
- User management (suspend, restore, delete) with audit logging
- Subscription management view
- Recipe view tracking for analytics
- Suspended account middleware enforcement

### Phase 23 — Subscriptions & Premium Access

- Stripe subscriptions (monthly/yearly, 7-day trial)
- Checkout + billing portal
- Webhook sync for subscription state
- Premium recipe gating (server + UI paywall)
- Localized `/premium` and `/account/subscription`

### Earlier phases (summary)

- Full recipe CMS with publishing workflow, media library, and xBloom profiles
- Community features: reviews, likes, follows, badges, notifications
- AI Coach foundation and taste profiles
- Bilingual EN/AR support with RTL layout
- PWA, offline page, and optimized images

### Upgrade notes

1. Run migration `20260713301700_production_hardening.sql`
2. Set all required environment variables (see `PRODUCTION_CHECKLIST.md`)
3. Register Stripe webhook at `/api/stripe/webhook` if using Stripe billing
4. Run `npm run build` before deploy

### Known limitations

- Rate limiting is in-process (resets on cold start); add edge/platform limits for high-traffic production
- Contact form validates and logs messages; email delivery integration is a follow-up
- Lighthouse 95+ should be verified on the production URL after deploy (CDN, caching, and TLS affect scores)
