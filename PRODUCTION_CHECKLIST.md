# BrewAtlas Production Checklist

Use this checklist before every production deployment.

## Environment variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — anon/publishable key
- [ ] `NEXT_PUBLIC_SITE_URL` — canonical HTTPS URL (e.g. `https://brewatlas.app`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — required for contact form, admin ops, Stripe webhooks, owner moderation
- [ ] `ERROR_REPORTING_WEBHOOK_URL` (optional) — POST JSON alerts for server/client errors
- [ ] `BILLING_PROVIDER` — `manual` (default) or `stripe`
- [ ] When `BILLING_PROVIDER=stripe`:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_PRICE_PREMIUM_MONTHLY`
  - [ ] `STRIPE_PRICE_PREMIUM_YEARLY`

Run `npm run build` locally with production env to confirm `lib/env.ts` validation passes.

## Database & RLS

- [ ] Apply all Supabase migrations through `20260713302400_create_contact_messages.sql`
- [ ] Verify membership hardening migration `20260713302300` — users cannot self-write `subscriptions`, `feature_access`, or `trial_usage`
- [ ] Verify `contact_messages` table exists; RLS enabled; only admins can read (writes via service role only)
- [ ] Verify RLS is enabled on all user-owned tables (`profiles`, `recipes`, `recipe_reviews`, `favorites`, etc.)
- [ ] Confirm `is_admin()` gates owner dashboard tables (`admin_audit_log`, `recipe_views` reads, `contact_messages`)
- [ ] Confirm `prevent_role_escalation` trigger blocks non-admin role changes
- [ ] Confirm `prevent_suspension_self_modification` trigger blocks self-unsuspension
- [ ] Test suspended user cannot access `/account/*` (middleware redirect)

## Supabase Auth (email + PKCE)

- [ ] Site URL: `https://brewatlas.app` (no `www`, match `NEXT_PUBLIC_SITE_URL` exactly)
- [ ] Redirect URLs include `https://brewatlas.app/auth/callback` and `https://brewatlas.app/auth/callback?next=*`
- [ ] **Confirm sign up** email template uses `token_hash` (not `ConfirmationURL` alone):
  ```html
  <a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=signup">Confirm email</a>
  ```
- [ ] **Reset password** email template uses `token_hash`:
  ```html
  <a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery">Reset password</a>
  ```
- [ ] Sign-up and OAuth run in the browser (`createBrowserClient`) so OAuth PKCE verifiers live in cookies on the initiating device
- [ ] After email confirm, user lands on `/account` (not `/login?error=PKCE...`)

## Security

- [ ] Security headers active via `next.config.ts` (`CSP`, `HSTS`, `X-Frame-Options`, etc.)
- [ ] CSP `connect-src` includes Supabase origin and Stripe API
- [ ] Stripe webhook validates `stripe-signature` header
- [ ] Stripe webhook idempotency table (`stripe_webhook_events`) populated on replay
- [ ] Rate limiting on `/api/*`, Stripe webhook, auth page POSTs (proxy), and contact form (5/hour/IP)
- [ ] Server Actions use Next.js built-in CSRF protection; API routes verify origin when applicable
- [ ] Upload MIME validation in `lib/media/constants.ts` enforced in media library actions
- [ ] User text sanitized via `lib/security/sanitize.ts` (reviews, contact form)

## Performance

- [ ] Public recipe list cached (`getCachedPublishedDbRecipes`, 5 min TTL); cache tags invalidated on recipe publish/update
- [ ] Culture pages cached (`getCachedCultureSections`, section/topic by slug)
- [ ] Locale/dictionary/home content cached per request + cross-request (`React.cache` + `unstable_cache`)
- [ ] Images served via `OptimizedImage` / Next.js Image with AVIF/WebP
- [ ] Primary nav links prefetch high-traffic routes
- [ ] Run Lighthouse on `/`, `/recipes`, `/recipes/[slug]` — target 95+ Performance, 100 Accessibility/Best Practices/SEO

## SEO

- [ ] `/sitemap.xml` returns all public routes + DB recipe slugs + culture topics
- [ ] `/robots.txt` disallows auth, account, dashboard, `/ai-coach`, and `/api/` paths
- [ ] JSON-LD on recipe pages (Recipe + AggregateRating + BreadcrumbList when reviews exist)
- [ ] JSON-LD on culture and Gulf Heritage article pages (Article/BlogPosting + BreadcrumbList)
- [ ] Gulf Heritage pending articles use `noIndex`; only verified articles appear in sitemap
- [ ] Canonical URLs and hreflang alternates via `buildLocalizedMetadata`
- [ ] Open Graph + Twitter Card metadata on all public pages
- [ ] Custom `not-found.tsx` and `error.tsx` (localized EN/AR)
- [ ] `global-error.tsx` localized EN/AR

## Quality assurance

- [ ] `npm run lint` — zero errors
- [ ] `npm test` — all tests pass (Vitest)
- [ ] `npm run build` — zero TypeScript errors
- [ ] GitHub Actions CI passes (lint, test, build)
- [ ] Responsive layout verified (mobile, tablet, desktop)
- [ ] Dark mode consistent across public + account + dashboard
- [ ] Arabic RTL layout verified (`lang=ar`, cookie + `?lang=ar`)
- [ ] English localization verified (`?lang=en`)

## Stripe (when enabled)

- [ ] Checkout session completes and syncs subscription to `profiles`
- [ ] Billing portal opens for existing subscribers
- [ ] Webhook endpoint registered in Stripe Dashboard → `/api/stripe/webhook`
- [ ] Test `customer.subscription.updated` and `invoice.payment_failed` events

## Owner dashboard

- [ ] `/dashboard/analytics` loads KPIs and charts
- [ ] `/dashboard/users` suspend/restore/delete writes audit log
- [ ] `/dashboard/subscriptions` lists premium members
- [ ] Review moderation writes audit log entries

## Deployment

- [ ] Deploy to production host (Vercel or equivalent)
- [ ] Verify health: homepage, login, recipe detail, premium page
- [ ] Verify Stripe webhook delivery (if billing enabled)
- [ ] Monitor error logs for first 30 minutes post-deploy

## Post-release

- [ ] Tag release in git
- [ ] Update `RELEASE_NOTES.md` with deployment date
- [ ] Announce to stakeholders
