# BrewAtlas v1.0 — Release Candidate Changelog

Release candidate for the first public production deployment of BrewAtlas.

---

## Major Features

### Coffee discovery & content
- Public recipe catalog with search, filters, and localized EN/AR metadata
- Culture hub with section/topic pages and Gulf Heritage editorial pipeline
- Origins atlas, coffee journey, and UAE brand storytelling sections
- AI Coach (authenticated, `noIndex` for crawlers)
- PWA manifest, service worker, and offline-friendly public shell

### Accounts & membership
- Email/password registration with PKCE OAuth (Google, Apple when enabled)
- Password reset via Supabase recovery flow
- User profiles, favorites, recipe reviews, and notifications
- Premium membership with manual billing (default) or Stripe subscriptions
- Owner/admin dashboard: users, recipes, subscriptions, analytics, CMS, audit log

### Localization
- English and Arabic with cookie/`?lang=` switching, RTL layout, and localized metadata
- Localized error pages (`not-found`, `error`, `global-error`)

### Contact & support
- Contact form with server-side persistence, CSRF, honeypot, and rate limiting (5 submissions/hour/IP)

---

## Security Improvements

- **Membership RLS hardening** (`20260713302300`): removed client-writable policies on `subscriptions`, `feature_access`, and `trial_usage`; admin-only direct writes
- **Owner RPC guards**: `SECURITY DEFINER` owner functions require authenticated admin context
- **Stripe billing integrity**: manual plan changes blocked when Stripe is the billing provider; webhook idempotency preserved
- **CSRF protection** on contact form and Stripe checkout/portal API routes (same-origin verification)
- **Rate limiting** on API routes, Stripe webhook, auth flows, and contact form
- **Input sanitization** for user-generated text (reviews, contact messages)
- **Security headers** via Next.js config (CSP, HSTS, frame options)
- **Contact inbox isolation**: `contact_messages` RLS — admin read only; inserts via service role (no public PostgREST write)

---

## Performance Improvements

- Removed unnecessary `"use client"` from static atlas/motion section wrappers
- Request-scoped deduplication via `React.cache()` for locale, dictionary, and home content
- Cross-request caching via `unstable_cache` for public dictionaries and home content
- Cache tag invalidation on recipe publish/update and UAE brand CMS changes (`updateTag`)
- Dynamic import for `NotificationsBell` to reduce main layout bundle weight

---

## SEO Improvements

- Expanded Recipe JSON-LD (duration, yield, nutrition hints, equipment, AggregateRating)
- Article/BlogPosting JSON-LD on culture and Gulf Heritage pages
- BreadcrumbList JSON-LD on recipe, culture, search, and Gulf Heritage routes
- WebSite schema with `inLanguage` and popular destination hints
- Dynamic sitemap: DB recipes, culture topics, verified Gulf Heritage articles only
- `robots.txt` disallows `/ai-coach`, `/api/`, auth, account, and dashboard paths
- `noIndex` for Gulf Heritage pending articles and AI Coach
- Localized Open Graph with article `publishedTime` / `modifiedTime` where applicable

---

## Observability & Quality

- Structured server logging (`logInfo`, `logError`) replacing ad-hoc console usage in server paths
- Server error capture via `instrumentation.ts` `onRequestError` hook
- Client error reporting from `error.tsx` and `global-error.tsx`
- Optional `ERROR_REPORTING_WEBHOOK_URL` for external alerting (Slack, PagerDuty, etc.)
- Vitest test suite (33 tests): CSRF, rate limits, sanitization, permissions, Stripe guards, SEO duration parsing
- GitHub Actions CI: `npm install` → `npm run lint` → `npm test` → `npm run build`

---

## Known Limitations

- **Billing default is manual** — Stripe requires full env configuration and webhook registration
- **Apple Sign In** disabled by default (`NEXT_PUBLIC_AUTH_APPLE_ENABLED=false`) until configured in Supabase + Apple Developer Console
- **No E2E browser tests** — coverage is unit/integration level only
- **Contact form** stores messages in Supabase; no email notification pipeline (admin reads via dashboard/DB)
- **AI Coach** requires authenticated session; not indexed for search engines
- **Gulf Heritage pending articles** are hidden from sitemap and carry `noIndex`
- **npm audit**: 2 moderate advisories in PostCSS dependency chain (via Next.js 16.2.10) — no fix available upstream yet
- **Error webhook** is fire-and-forget; no retry queue or dead-letter handling

---

## Migration Requirements

Apply Supabase migrations **in order** before deploying the application code:

| Order | Migration | Purpose |
|-------|-----------|---------|
| 1 | `20260713302300_membership_security_hardening.sql` | Lock down membership table writes; guard owner RPCs |
| 2 | `20260713302400_create_contact_messages.sql` | Contact form inbox table + RLS |

**Pre-migration:** ensure prior migrations through `20260713302200_profiles_owner_insert_policy.sql` are already applied.

**Post-migration verification:**
- Authenticated users cannot INSERT/UPDATE `subscriptions`, `feature_access`, or `trial_usage` via PostgREST
- `contact_messages` exists with RLS enabled; only `is_admin()` can SELECT
- Contact form submissions succeed when `SUPABASE_SERVICE_ROLE_KEY` is set

---

## Deployment Notes

### Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL          # HTTPS canonical URL
SUPABASE_SERVICE_ROLE_KEY     # contact form, webhooks, admin bootstrap
BREWATLAS_INITIAL_ADMIN_EMAIL # idempotent admin promotion on boot
```

When `BILLING_PROVIDER=stripe`, also set all Stripe keys and price IDs (see `.env.local.example`).

### Supabase Auth templates

Confirm email templates use `token_hash` (not `ConfirmationURL` alone) for signup and password reset. See `PRODUCTION_CHECKLIST.md`.

### Deploy sequence

1. Apply migrations `20260713302300` and `20260713302400` to production Supabase
2. Set production environment variables on host (Vercel or equivalent)
3. Deploy application (commit RC branch first if deploying from CI)
4. Verify: homepage, login, recipe detail, contact form submission, premium page
5. If Stripe enabled: confirm webhook delivery at `/api/stripe/webhook`
6. Monitor logs for 30 minutes post-deploy

### Rollback

- **Application:** redeploy previous release artifact
- **Migration `20260713302400`:** `DROP TABLE IF EXISTS public.contact_messages;` (loses contact inbox data)
- **Migration `20260713302300`:** restore prior RLS policies from git history before `9ac9b39` — coordinate with application version; do not roll back app without rolling back policies

---

*Generated for BrewAtlas v1.0 Release Candidate — July 2026*
