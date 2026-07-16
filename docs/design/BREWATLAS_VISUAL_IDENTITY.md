# BrewAtlas Visual Identity
## Creative Direction & Design System Strategy

**Version:** 1.1 (Strategy — refined, pre-implementation)  
**Role:** Lead Product Design / Creative Direction  
**Status:** Approved in principle — implementation not yet authorized  
**Commit baseline:** `c40b969`

---

## 1. Brand Essence

### What BrewAtlas is
BrewAtlas is not a coffee shop, a recipe app, or a SaaS dashboard.

It is an **editorial atlas of specialty coffee** — a luxury publication you travel through, not a website you browse.

**Category ambition:** BrewAtlas must become a **category-defining product** — the reference point for how specialty coffee is experienced digitally. Not the best coffee website. The platform that makes every other coffee site feel like a catalog.

### Creative north star
> *"Monocle meets Aman Resorts in a majlis overlooking the desert at golden hour."*

### Brand attributes
| Attribute | Expression |
|-----------|------------|
| **Editorial** | Magazine pacing, typographic hierarchy, photography-led |
| **Atlas** | Geography, routes, origins, discovery — movement through worlds |
| **Hospitality** | Generous space, calm welcome, unhurried rhythm (Emirati majlis) |
| **Precision** | Ratios, altitude, process — quiet confidence, never clinical |
| **Timeless** | No trends, no startup gradients, no Dribbble tropes |

### Recognition test
Remove the logo. The experience should still be identifiable through:
- Limestone-to-espresso tonal journey
- Instrument Serif display at monumental scale
- Full-bleed cinematic photography with pearl-warm highlights
- Horizontal “atlas” scrolls and chapter dividers (dune curves)
- Brass hairline accents — never thick gold borders

---

## 2. Design Audit (Current State)

### 2.1 What improved (v3 partial work)
- Homepage moved toward editorial flow (hero → manifesto → bento → magazine feature → journey → atlas strip)
- Light-first palette replaced heavy dark-brown default
- Duplicate homepage sections removed
- Instrument Serif + Geist pairing established

### 2.2 What still feels generic (must fix)

#### Systemic
| Issue | Evidence | Why it fails |
|-------|----------|--------------|
| **Dual identity** | Homepage editorial vs `/recipes`, `/origins`, `/premium` still use card grids | Same brand, two products |
| **“Premium coffee template” tokens** | `premiumShell`, `rounded-[1.25rem]`, uniform borders on every surface | Reads as Tailwind UI kit |
| **Dark espresso as default mood** | Listing pages render dark; hero + footer bookend everything in brown | Monotonous, not a journey |
| **Legacy UAE aliases** | `uae-warm-gold`, `uae-dark-coffee` still in codebase | Unfinished migration, inconsistent |
| **RevealOnScroll hides content** | `opacity-0` until IO on desktop; breaks screenshots, feels broken on fast scroll | Not luxury — feels broken |
| **SectionFrame = page template** | Eyebrow + H1 + description + grid on every route | SaaS landing page pattern |

#### Homepage
| Issue | Evidence |
|-------|----------|
| Chapters still **named like landing sections** (“Featured Recipes”, “Brewing Methods”) |
| Bento discover grid still **reads as card grid** with rounded rectangles |
| **No true emotional transitions** — hard cuts between sand / ivory / espresso |
| Coffee journey reuses **methods content** without narrative arc (bean → roast → brew → cup) |
| Premium closing still **lists benefits** like a pricing page |

#### Recipes (`/recipes`)
| Issue | Evidence |
|-------|----------|
| 3-column **RecipeCard grid** — identical chrome on every item |
| Filter chips = **every coffee startup** |
| Guest paywall = **gold-bordered promo box** |
| No magazine cover, no issue/archive metaphor |

#### Origins (`/origins`)
| Issue | Evidence |
|-------|----------|
| **OriginCard 3×2 grid** — opposite of “interactive atlas” |
| No map, no routes, no country-as-destination storytelling |
| Homepage atlas strip ≠ listing page (split experience) |

#### Premium (`/premium`)
| Issue | Evidence |
|-------|----------|
| **Three pricing cards** — Stripe/SaaS canonical pattern |
| FAQ accordion in bordered boxes |
| No invitation, no ceremony, no members-club narrative |

#### Photography
| Issue | Evidence |
|-------|----------|
| Same **stock-style** brew shots reused across sections |
| Identical treatment (dark overlay + scale hover) everywhere |
| No art direction per chapter (origin vs method vs recipe) |

#### Typography
| Issue | Evidence |
|-------|----------|
| Geist is **correct but anonymous** for luxury editorial |
| Display sizes inconsistent across pages |
| Eyebrows all identical (`0.8125rem`, `0.18em` tracking) — robotic |

---

## 3. The New Visual Language — **Atlas Canon**

Internal codename for the design system: **Atlas Canon** (the authoritative visual grammar of BrewAtlas).

### 3.1 Concept pillars (UAE-inspired, zero cliché)

Heritage is expressed through **architecture of space** — proportion, rhythm, materials, light — never through symbols or ornament. See §21 for full architectural translation.

| Pillar | Design translation | Avoid |
|--------|-------------------|-------|
| **Dune** | Flowing section transitions, asymmetric layouts, soft horizontal rhythm | Pyramid shapes, camel silhouettes |
| **Pearl** | Luminous neutrals, inner glow, iridescent subtle texture | Glossy fake pearls, jewelry ads |
| **Majlis** | Generous negative space, content low in frame, hospitality copy tone | Ornate arabesque frames |
| **Brass** | Hairline rules, thin outline buttons, muted copper accents | Heavy gold gradients, bling |
| **Palm** | Single restrained green accent for “origin/living” contexts only | Palm tree icons |
| **Limestone** | Primary light surfaces — warm, matte, architectural | Cold gray SaaS white |
| **Route** | Lines connecting origins, scroll-spatial layouts, chapter numbers | Airplane, passport stamps |
| **Geometric rhythm** | 8pt grid, aligned baselines, intentional asymmetry (proportion principle, not decoration) | Tessellation backgrounds |

---

## 4. Color System

Replace v3 palette with **Atlas Canon Color Architecture**.

### 4.1 Core palette

| Token | Hex | Role |
|-------|-----|------|
| `--ac-limestone` | `#F7F3EC` | Primary page ground — warm architectural white |
| `--ac-pearl` | `#FDFBF7` | Elevated surfaces, cards-on-light (rare) |
| `--ac-sand` | `#E8DCC8` | Secondary ground, desert midtone |
| `--ac-dune` | `#D4C4A8` | Tertiary sand, dividers on light |
| `--ac-espresso` | `#1A1410` | Primary dark — ink, night chapters |
| `--ac-walnut` | `#3D2E24` | Secondary dark text on light |
| `--ac-copper` | `#A67B4A` | Primary accent — brass/copper (interactive) |
| `--ac-gold` | `#C4A574` | Highlight accent — sparingly (1 per viewport) |
| `--ac-palm` | `#4A5D52` | Origin/nature accent — never for UI chrome |
| `--ac-mist` | `#E5E0D8` | Borders on light — limestone shadow |

### 4.2 Semantic roles (never use raw hex in components)

```
surface.page          → limestone
surface.chapter-light → pearl | sand (alternate)
surface.chapter-dark  → espresso (+ subtle radial warmth)
text.primary          → espresso on light / pearl on dark
text.secondary        → walnut @ 72%
text.muted            → walnut @ 48%
accent.primary        → copper
accent.highlight      → gold (max 1 element per screen)
accent.origin         → palm (origins/atlas contexts only)
border.subtle         → mist @ 60%
border.emphasis       → copper @ 25%
```

### 4.3 Chapter rhythm (homepage & long pages)

Pages breathe through **five tonal modes**, not random section themes:

1. **Night** — espresso + photography (hero, premium invite)
2. **Dawn** — limestone + pearl (manifesto, reading)
3. **Sand** — sand gradient (discovery, travel)
4. **Day** — pearl flat (detail, lists on light)
5. **Dusk** — walnut + copper accents (transitions to night)

**Rule:** Never two `Night` chapters adjacent without a `Dawn` or `Sand` bridge.

---

## 5. Typography

### 5.1 Typefaces

| Role | Face | Weight | Usage |
|------|------|--------|-------|
| **Display** | Instrument Serif | 400 | H1, chapter titles, country names |
| **UI / Body** | Geist Sans | 400, 500 | Body, nav, forms, metadata |
| **Arabic** | System / Noto Naskh Arabic (future) | 400 | `ar` locale — match serif warmth |

**Do not add a third Latin face.** Hierarchy comes from scale and spacing, not font proliferation.

### 5.2 Scale (modular, 1.25 ratio, base 16px)

| Token | Size | Line height | Use |
|-------|------|-------------|-----|
| `display-xl` | 80–112px | 0.98 | Hero only |
| `display-lg` | 56–72px | 1.02 | Chapter openers |
| `h1` | 40–48px | 1.06 | Page titles |
| `h2` | 32–36px | 1.10 | Section titles |
| `h3` | 24–28px | 1.20 | Subsections |
| `body-lg` | 18–20px | 1.75 | Lead paragraphs |
| `body` | 16–17px | 1.70 | Default |
| `caption` | 13px | 1.50 | Metadata |
| `eyebrow` | 11px | 1.40 | **Copper**, tracking 0.20em, uppercase |

### 5.3 Typography rules
- **One display line per viewport** — never two competing serifs above fold
- Eyebrows always copper, never gold
- Max line length: 38em for body, 22em for lead
- Arabic: increase line-height +4%, maintain RTL alignment discipline

---

## 6. Spacing & Grid

### 6.1 Spatial philosophy — **Majlis Spacing**
Luxury is expressed through **withholding**. Default to 2× current padding on editorial pages.

### 6.2 Base unit
**8px grid** with 4px half-steps for fine typography alignment only.

| Token | Value | Use |
|-------|-------|-----|
| `space-xs` | 8px | Tight inline |
| `space-sm` | 16px | Component internal |
| `space-md` | 24px | Related groups |
| `space-lg` | 48px | Section sub-blocks |
| `space-xl` | 80px | Section padding (mobile) |
| `space-2xl` | 128px | Section padding (desktop) |
| `space-3xl` | 192px | Chapter breaks |

### 6.3 Grid — **Editorial 12**

| Zone | Columns | Use |
|------|---------|-----|
| **Monument** | 8–10 | Hero imagery + display type |
| **Margin** | 2 | Notes, metadata, chapter numbers |
| **Split** | 6 + 6 | Recipe feature, journey panels |
| **Rail** | 4 + 8 | Atlas scroll + sticky map |
| **Full bleed** | 12 | Photography, transitions |

**No centered 3-column card grids on marketing pages.**

---

## 7. Composition Philosophy — **Beyond Cards**

### The problem
“Card” implies interchangeable, equal-weight UI boxes. BrewAtlas sells **stories and places**, not widgets. Even “card alternatives” fail if they repeat the same rectangular container grammar.

### Primary composition modes (use these, not cards)

| Mode | Description | Spatial signature |
|------|-------------|-------------------|
| **Spread** | Two-page magazine layout — image left, prose right (or inverted) | 55/45 or 60/40 split, baseline-aligned |
| **Panel** | Full-viewport immersive surface — one subject, one mood | Edge-to-edge, no border, typographic anchor in lower third |
| **Folio** | Index row — thumbnail at margin scale + title + metadata | Hairline dividers only; no enclosing box |
| **Cover** | Single hero subject at magazine scale | Portrait or landscape dominant; type minimal |
| **Marginalia** | Data as sidebar notes — altitude, ratio, time | Narrow column, caption scale, never 2×2 tiles |
| **Rail** | Horizontal scroll of destinations or editions | Oversized type, peek of next item |
| **Letter** | Prose-first invitation or narrative block | Max-width 28em, brass rules between paragraphs |
| **Plate** | Functional bordered surface | Auth, checkout, account settings only |

### Deprecated patterns (zero tolerance on public marketing pages)
- Grids of equal-weight bordered rectangles
- `premiumShell`, shadow + border combos
- Filter chip rows as primary navigation
- 2×2 or 3×3 metadata tiles
- Testimonial cards in a row
- Pricing columns

### Surface rules
- **No border + shadow combo** on editorial objects
- **No default border-radius** on content — architecture uses **planes**, not boxes
- Shadows only on **functional** UI (dropdowns, modals)

---

## 8. Radius, Borders, Shadows

| Token | Value | Use |
|-------|-------|-----|
| `radius.none` | 0 | Atlas panels, journey splits |
| `radius.sm` | 4px | Inputs, chips |
| `radius.arch` | 2px 2px 24px 24px | Subtle Emirati arch echo — portals only |
| `radius.full` | 9999px | Pills, avatars |

**Borders:** 1px hairline only. Color: `border.subtle` or copper @ 20%.  
**Shadows:** Maximum one level on light (`shadow.plate`: 0 8px 40px -12px rgba(26,20,16,0.08)).

---

## 9. Motion & Interaction

### Philosophy — **Motion Serves Story**
Motion exists to **orient the traveller**, not to impress. Every animation must answer: *What chapter am I entering? What am I being shown next?*

Inspired by Apple product storytelling: the scroll **reveals narrative**, it does not decorate it.

| Token | Duration | Easing | Narrative role |
|-------|----------|--------|----------------|
| `motion.instant` | 120ms | standard | Confirm interaction (focus, toggle) |
| `motion.calm` | 400ms | `cubic-bezier(0.22, 1, 0.36, 1)` | State change within a chapter |
| `motion.reveal` | 900ms | same | Enter a new beat within a chapter |
| `motion.passage` | 1200ms | same | Cross chapter boundary — tonal shift |
| `motion.atlas` | 1600ms | same | Origin/route line draw, map pan |

### Storytelling motion (permitted)
- **Chapter crossfade** — background tone shifts as user crosses section boundary
- **Route draw** — hairline SVG path animates origin → port (Origins only)
- **Edition turn** — horizontal folio shift when changing recipe issue (Recipes only)
- **Depth parallax** — desktop only, ≤8px, photography layers on hero/atlas panels
- **Sticky rail sync** — country name in margin updates as destination panel scrolls into register

### Decorative motion (forbidden)
- Bounce, spring, elastic easing
- Scale-on-hover on photography > 1.02
- Staggered cascade on list items (reads as “app loading”)
- Ripple effects, particle effects, shimmer except skeleton loading
- Parallax on mobile
- Auto-playing carousels
- Generic fade-up on every block (`RevealOnScroll` opacity-0 pattern)

### Rules
- Content **visible by default** — motion enhances, never gates (SEO, a11y, SSR)
- One motion type per viewport — do not combine crossfade + parallax + stagger
- `prefers-reduced-motion`: instant cuts, no translate

### Hover
- Links: copper underline grows from center
- Panels: image brightness +3%, never scale
- Buttons: background shift only, no lift shadow

---

## 10. Buttons & Forms

### Button hierarchy

| Variant | Appearance | Use |
|---------|------------|-----|
| **Primary** | Espresso fill, pearl text, full radius | One per viewport |
| **Secondary** | Hairline copper border, transparent | Alternate action |
| **Ghost** | Text + arrow only | Editorial CTAs |
| **Invitation** | Copper border, letter-spaced label, wide padding | Premium |

**Never:** gold fill buttons, gradient buttons, shadow lift.

### Forms
- Inputs: limestone bg, mist border, no shadow
- Focus: 1px copper ring inset
- Labels: caption size, walnut @ 70%

---

## 11. Photography Direction — **The BrewAtlas Lens**

### Mandate
Every image must look like it was shot by **one photographer, one day, one light setup** — even when assets come from many sources. Incoherent photography is the fastest way to read as “template.”

### The BrewAtlas Lens (master spec)

| Parameter | Specification |
|-----------|---------------|
| **Color temperature** | 4800–5200K effective — always warm, never clinical blue |
| **Exposure** | Slightly underexposed (−⅓ to −1 stop) — luxury reads dark, not blown |
| **Contrast** | Soft rolloff in highlights; lifted shadows with warm tint (not gray) |
| **Saturation** | −10% global; greens desaturated except origin contexts |
| **Grain** | Fine film grain overlay @ 3–5% opacity on dark chapters only |
| **Black point** | Warm espresso (#1A1410), never pure #000 |

### Subject hierarchy (what we photograph)
1. **Human ritual** — hands, pour, steam (not faces as stock portraits)
2. **Material surfaces** — ceramic, linen, brass, stone, wood
3. **Origin landscape** — terrain, plant, process (not tourist landmarks)
4. **Tool as object** — brewer, grinder as still-life (Devices/workshop)
5. **The cup** — crema, context, table — never isolated on white

### Forbidden subjects
- Generic latte art hearts on every hero
- Smiling stock baristas
- Coffee beans scattered as decoration
- White-background product shots
- Identical dark-vignette overlay on every image

### Page-specific grade profiles

| Page | Grade name | Treatment | Subject matter |
|------|------------|-----------|----------------|
| Home — Prologue | `lens.night` | −20% exposure, +amber lift, vignette 15% | Ritual, arrival |
| Home — Discovery | `lens.dawn` | Neutral-warm, open shadows | Portals, worlds |
| Recipes | `lens.library` | Soft, intimate, −5% contrast | Cup, table, context |
| Origins | `lens.earth` | Natural, palm-tint in greens | Landscape, cherry, beds |
| Devices | `lens.workshop` | Higher contrast, cooler shadows | Tools, metal, precision |
| Roasters | `lens.directory` | Documentary neutral | Space, bag, portrait env |
| Premium | `lens.gallery` | Dark, single-source light feel | One object, museum |

### Crop discipline

| Format | Ratio | Use |
|--------|-------|-----|
| Cinematic | 21:9 | Hero, panel backgrounds |
| Editorial | 3:2 | Spreads, covers |
| Portrait cover | 4:5 | Recipe cover feature only |
| Square | 1:1 | Never on marketing pages |

### Implementation (no new photos required initially)
- CSS: unified `photo-grade-{profile}` utilities — **mandatory** on all `<img>` in public routes
- Replace identical overlays with profile-specific gradients
- Lazy blur placeholders tinted to page ground (limestone, sand, or espresso)
- Asset audit: flag any image used on 2+ pages with different grades — resolve or replace

---

## 12. Iconography
- **Lucide** at 1.25px stroke — never filled icons in editorial zones
- Copper @ 80% on light, pearl @ 70% on dark
- No coffee cup favicon-style icons in body content

---

## 13. Page Strategies

### 13.1 Homepage — **The Atlas Journey**

Not sections. **Chapters.**

| Ch | Title | Tone | Layout | Emotion |
|----|-------|------|--------|---------|
| 0 | Prologue | Night | Full viewport cinematic hero | Arrival |
| 1 | The Map | Dawn | Manifesto typography + stats rail | Purpose |
| 2 | Six Worlds | Sand | Asymmetric portals (not equal bento) | Choice |
| 3 | The Cover | Day→Night | Single recipe magazine spread | Desire |
| 4 | The Route | Sand | Horizontal atlas preview (origins strip) | Wander |
| 5 | The Craft | Night | One method, full bleed — not four | Mastery |
| 6 | The Table | Dawn | Typographic recipe folio (3 items max) | Belonging |
| 7 | The Circle | Night | Premium invitation — letter, not grid | Membership |

**Remove:** duplicate content, filter chips, benefit grids, testimonial cards.

**Transitions:** Dune SVG curves + background crossfade between chapters.

---

### 13.2 Recipes — **The Archive**

| Zone | Layout |
|------|--------|
| Header | Issue-style — “Archive / Vol. I” + search as editorial index |
| Featured | Rotating **Cover** (one recipe, full width) |
| Browse | **Folio** list — horizontal rules, no card boxes |
| Filters | Text-based index (A–Z, method) — not pill chips |
| Paywall | **Invitation** inset — not gold promo box |

---

### 13.3 Origins — **The Coffee Atlas**

| Zone | Layout |
|------|--------|
| Hero | World silhouette line art (abstract, not mapbox cliché) |
| Navigation | Sticky country rail + scroll-spy |
| Destinations | Full-viewport **Destination** panels (one country at a time on scroll) |
| Detail | Route line connecting origin → port → roaster (SVG hairline) |
| Data | Altitude/process as marginalia, not 2×2 meta tiles |

**No OriginCard grid.**

---

### 13.4 Premium — **The Circle**

| Zone | Layout |
|------|--------|
| Prologue | Night — “An invitation” letter prose |
| Benefits | Vertical prose list with brass rules — not 4 boxes |
| Testimonial | Single pull quote — not 3 cards |
| Access | One membership tier emphasized — others as footnotes |
| FAQ | Inline prose accordion — no bordered panels |
| CTA | “Request membership” ceremony — not “Subscribe” button grid |

---

### 13.5 Devices — **The Craft Workshop**

| Zone | Layout | Signature |
|------|--------|-----------|
| Hero | Single tool as still-life — workshop bench surface | `lens.workshop`, high contrast |
| Browse | Vertical **tool registry** — name, maker, method as spec sheet rows | Monospace-adjacent metadata, no images in grid |
| Feature | One device **spread** — exploded diagram feel via photography + marginalia specs | Split 50/50 |
| Detail | Prose + spec column — like a Leica product page | No card chrome |

**Emotion:** Precision, craft, respect for the instrument.  
**Layout signature:** Spec-sheet rows + still-life photography — **never** a product card grid.

---

### 13.6 Roasters — **The Global Directory**

| Zone | Layout | Signature |
|------|--------|-----------|
| Hero | Typographic — “Directory of Roasters” at display scale, world count as marginalia | No hero image required |
| Index | Alphabetical **registry** — name, city, country, year founded | Folio rows, hairline dividers |
| Feature | One roaster **portrait spread** — environment photography + story prose | Rotating monthly |
| Map | Abstract dot matrix or hairline continent outlines — not Google Maps embed | Copper dots on limestone |

**Emotion:** Documentary, authoritative, global.  
**Layout signature:** Text-first directory with occasional portrait spreads — **never** roaster card grid.

---

## 14. Component Migration Map

| Current | Fate | Replacement |
|---------|------|---------------|
| `RecipeCard` | Deprecated on public marketing | `Cover`, `Folio` |
| `OriginCard` | Deprecated on `/origins` | `Destination` |
| `MethodCard` | Deprecated on Devices | Spec registry row |
| `RoasterCard` / `uae-roaster-card` | Deprecated on `/roasters` | Registry row, portrait spread |
| `PricingCard` | Deprecated | `Invitation` + prose tier |
| `premiumShell` | Remove token | `surface.plate` (functional only) |
| `SectionFrame` + `PageHeader` | Restrict to account/admin | Page-specific identity wrapper |
| `RevealOnScroll` (opacity hide) | Fix | Visible by default; story motion only |
| `WorldPortal` | Evolve | Asymmetric `Portal` panel |
| `filterChips` | Remove from marketing | Text index, compass rail |

---

## 15. Implementation Roadmap

**Principle:** Strategy first, then one chapter at a time. No parallel page hacks.

### Phase 0 — Foundation (Week 1)
- [ ] Atlas Canon tokens in `globals.css` + `lib/design-system/atlas-canon.ts`
- [ ] Remove legacy `uae-*` / `ba-*` dual tokens
- [ ] Fix `RevealOnScroll` SSR visibility
- [ ] `Chapter`, `Portal`, `Folio`, `Cover`, `Destination`, `Invitation` primitives
- [ ] Photography grade utilities

### Phase 1 — Homepage journey (Week 2)
- [ ] Re-chapter homepage per §13.1
- [ ] Dune transition system between chapters
- [ ] Remove remaining card patterns

### Phase 2 — Recipes Archive (Week 3)
- [ ] `/recipes` folio + cover
- [ ] Recipe detail editorial pass (marginalia layout)

### Phase 3 — Origins Atlas (Week 4)
- [ ] `/origins` destination scroll experience
- [ ] Align homepage origins strip with atlas language

### Phase 4 — Premium Circle (Week 5)
- [ ] `/premium` invitation experience
- [ ] Account subscription pages aligned

### Phase 5 — System sweep (Week 6)
- [ ] Devices workshop + Roasters directory per §13.5–13.6
- [ ] Auth, search, culture, account — `Plate` surfaces only
- [ ] Admin untouched (functional)
- [ ] Visual regression + `visual-proof/` refresh
- [ ] First-visit journey validation (§22)

---

## 16. Success Criteria

See **§23 Revised Success Criteria (v1.1)** for the authoritative checklist.

---

## 17. Immediate Next Step

**Implementation is not authorized.** Strategy refinement (Part II) must be reviewed before Phase 0 begins.

When authorized, first task: create `lib/design-system/atlas-canon.ts` and composition primitives — then rebuild homepage Prologue as the reference implementation.

---

# Part II — Atlas Canon Refinement (v1.1)

*Extension approved in principle. Governs all future implementation.*

---

## 18. Category Definition — Travel, Not Catalog

### The distinction

| Catalog mindset | Atlas mindset |
|-----------------|---------------|
| User searches, filters, compares | User **departs**, **arrives**, **explores** |
| Content is inventory | Content is **territory** |
| Pages are categories | Pages are **places with their own climate** |
| Navigation is a menu | Navigation is a **compass** |
| Success = find item | Success = **feel transported** |

### Design implications

1. **No page opens with a filter bar.** Discovery begins with narrative, not faceted search.
2. **Every link is a departure.** CTAs read as journeys (“Enter Ethiopia”, “Open the Archive”, “Enter the Workshop”) — not “View all” or “Learn more”.
3. **Scroll is locomotion.** Vertical scroll = forward travel. Horizontal scroll = crossing territory (atlas rail, edition browse). Sticky elements = instruments (compass rail, spec margin).
4. **Depth over breadth on first visit.** Show fewer things with more space — the opposite of catalog density.
5. **Return visits unlock density.** Folio indexes and directory registries serve the returning traveller; first visit is always immersive.

### Anti-patterns (instant catalog failure)
- Row of filter chips above content
- “Showing 24 of 156 results”
- Sort dropdown as primary UI
- Equal-weight thumbnail grid as default view
- Sidebar + main content two-column app layout on marketing pages

---

## 19. Page Emotional Identities

Each major route is a **distinct place** in the coffee world. Users should feel the shift in mood the moment the page loads — through tone, layout signature, typography posture, and photography grade — not through a label.

### Identity matrix

| Route | Place name | Emotion | Tonal mode | Layout signature | Photography |
|-------|------------|---------|------------|------------------|-------------|
| **Home** | The Departure | **Discovery** — wonder, invitation, horizon | Night → Dawn → Sand journey | Full-viewport chapters, portals, dune transitions | `lens.night`, `lens.dawn` |
| **Recipes** | The Library | **Editorial** — archive, craft, intimacy | Pearl / limestone (Day) | Cover + folio index, issue metaphor | `lens.library` |
| **Origins** | The Atlas | **Geography** — scale, history, routes | Sand + palm accent | Destination panels, sticky rail, route lines | `lens.earth` |
| **Devices** | The Workshop | **Precision** — tools, mastery, material | Limestone + high contrast | Spec registry + still-life spreads | `lens.workshop` |
| **Roasters** | The Directory | **Documentary** — global, authoritative | Pearl flat, minimal | Alphabetical registry + portrait spreads | `lens.directory` |
| **Premium** | The Circle | **Belonging** — exclusivity, ceremony | Night (Dusk → Night) | Letter prose, invitation, no grid | `lens.gallery` |

### Per-page emotional brief

#### Home — Discovery
> *You have just arrived at the edge of something vast. The world of coffee opens ahead.*

- Feeling: horizon, possibility, unhurried welcome
- Pacing: slow reveals, wide space, monumental type
- Avoid: listing features, counting benefits, anything that feels like an app onboarding

#### Recipes — Editorial Library
> *You are in a private reading room. Each recipe is an edition, not a row in a database.*

- Feeling: intimacy, craft literacy, respect for the recipe as publication
- Pacing: one cover at a time, folio browse below
- Avoid: grid, filters as pills, “popular” badges

#### Origins — World Atlas
> *You are tracing coffee across continents. Each country is a destination you enter.*

- Feeling: scale, geography, history, movement
- Pacing: one country per viewport, horizontal rail as compass
- Avoid: country cards, flag icons, 2×2 origin metadata tiles

#### Devices — Craft Workshop
> *You are in a bench room. Tools are objects of precision, not products for sale.*

- Feeling: material honesty, engineering respect, tactile
- Pacing: spec registry density for return visits; still-life feature for first
- Avoid: e-commerce product cards, star ratings, “Buy now” energy

#### Roasters — Global Directory
> *You are reading the registry of people who roast. Documentary, not promotional.*

- Feeling: authority, global scope, human stories behind businesses
- Pacing: text-first index; photography as occasional portrait
- Avoid: logo grids, promotional roaster cards, map pins as primary UI

#### Premium — Private Members Club
> *You have been invited into a room others cannot enter. The tone is letter, not landing page.*

- Feeling: ceremony, exclusivity, calm confidence — never urgency
- Pacing: prose letter → single testimonial → quiet access details
- Avoid: pricing tables, feature comparison columns, countdown timers, “Best value” badges

---

## 20. Layout Differentiation — No Page Echoes Another

### The rule
**If a layout pattern appears on two marketing pages, one of them is wrong.**

Users must never think: *“This is the homepage section layout with different text.”*

### Layout signatures (one per page — non-negotiable)

| Page | Primary layout | Secondary layout | Never use |
|------|---------------|------------------|-----------|
| Home | Full-viewport **Chapter** stack | Portal grid (asymmetric) | Card grid, folio list |
| Recipes | **Cover** + folio index | Marginalia detail on slug | 3-col grid, chip filters |
| Origins | **Destination** panel scroll | Sticky country rail | Origin card grid |
| Devices | **Spec registry** rows | Still-life spread | Product card grid |
| Roasters | **Alphabetical registry** | Portrait spread feature | Logo card grid |
| Premium | **Letter** prose block | Single pull quote | Pricing card columns |

### Shared elements (allowed, but must adapt)

| Element | Home | Recipes | Origins | Devices | Roasters | Premium |
|---------|------|---------|---------|---------|----------|---------|
| Page header | None (hero IS header) | Issue masthead | Atlas coordinates | Workshop label | Directory title | “An invitation” |
| Primary CTA style | Ghost + arrow | “Open edition” | “Enter [country]” | “View specifications” | “Read profile” | “Request access” |
| Background | Multi-chapter journey | Flat pearl | Sand + earth | Limestone | Flat pearl | Espresso |
| Search | Hero underline field | Index lookup | Country finder | Tool finder | Name lookup | None |

### Cross-page navigation tone
Nav items are **destinations**, not sections:
- Recipes → “The Library”
- Origins → “The Atlas”
- Devices → “The Workshop”
- Roasters → “The Directory”
- Premium → “The Circle”

---

## 21. UAE Inspiration — Architectural, Not Decorative

### Principle
Emirati heritage informs **how space is composed**, not **what icons appear on the page**. The user should feel Abu Dhabi or Dubai in the **proportion and calm** — never in the ornament.

### Architectural translations

| Quality | Spatial expression | Example |
|---------|-------------------|---------|
| **Majlis proportion** | Content sits low in frame; generous void above | Hero type in lower 40%, sky/void above |
| **Limestone materiality** | Warm matte grounds, no glossy white | `--ac-limestone` as default page |
| **Brass detail** | Hairline rules, thin frames — metal as accent line, not fill | 1px copper dividers between folio rows |
| **Geometric rhythm** | 8pt grid, aligned baselines, intentional ⅓–⅔ splits | Asymmetric 7+5 columns, not centered 4+4+4 |
| **Light as architecture** | Tonal chapters simulate time of day — dawn, sand, dusk, night | §4.3 chapter rhythm |
| **Courtyard space** | Inner content narrower than outer frame — breathing margin | 28em prose max inside 12-col grid |
| **Arch as proportion** | Subtle curve in portal bottom edge — structural, not decorative | `radius.arch` on portal panels only |
| **Hospitality pacing** | Unhurried scroll, no urgency UI, welcome before ask | Premium invitation last, never popup |

### Explicitly excluded (decorative failure)
- Arabesque patterns, tessellation backgrounds
- Ornamental borders, Islamic star motifs as UI chrome
- Gold filigree, metallic gradients
- Cultural symbols of any kind (see §3.1 Avoid column)
- “Heritage badge” components

### The test
Cover the logo and all photography. The page should still feel **architectural** — through proportion, light, and material — not **themed**.

---

## 22. First-Time Visitor Emotional Journey

*From first landing to subscription intent — the narrative arc BrewAtlas must deliver.*

### Persona
**The Curious Traveller** — knows good coffee, skeptical of apps, responds to beauty and authority. Has 90 seconds to decide if this is worth their time.

### Journey map

| Stage | Moment | Page / zone | Emotion | Design job | Exit risk |
|-------|--------|-------------|---------|------------|-----------|
| **1. Arrival** | Lands on homepage | Prologue hero | Awe, calm | Full-viewport cinematic, search as underline not pill | Bounce if feels like template |
| **2. Orientation** | Scrolls past hero | The Map (manifesto) | Trust, purpose | Monumental serif, real stats inline — no sidebar card | Leave if copy is generic |
| **3. Choice** | Continues scroll | Six Worlds (portals) | Curiosity | Asymmetric portals — six doors, not six equal cards | Confusion if bento grid |
| **4. Desire** | Sees a recipe | The Cover | Want | Magazine spread — one recipe, irresistible | Indifference if card rail |
| **5. Geography** | Keeps scrolling | The Route (origins preview) | Wanderlust | Horizontal atlas strip, country names at scale | Skip if feels like footer promo |
| **6. Depth** | Explores further | The Craft + The Table | Respect, belonging | One method panel + 3 folio items max | Overwhelm if methods grid returns |
| **7. Invitation** | Reaches closing | The Circle (premium preview) | Aspiration | Letter tone, not pricing — “There is an inner room” | Rejection if Stripe grid |
| **8. Departure** | Clicks a portal | Recipes / Origins / Devices | Commitment | **Page must feel like a new country** — layout shift | Return to catalog feeling |
| **9. Exploration** | Reads a recipe | Recipe detail | Intimacy | Marginalia layout, photography `lens.library` | Paywall shock if gold box |
| **10. Return** | Bookmarks, comes back | Library folio / Atlas rail | Familiarity | Density allowed — folio, registry, index | N/A |
| **11. Consideration** | Visits Premium | The Circle | Ceremony | Prose invitation, single tier emphasis | Hard sell triggers exit |
| **12. Conversion** | Subscribes | Premium → auth → account | Welcome | Account feels like membership card, not dashboard | Buyer’s remorse if dashboard UI |

### Emotional arc (single sentence)
**Awe → Trust → Curiosity → Desire → Wanderlust → Respect → Aspiration → Commitment → Intimacy → Belonging**

### Critical transitions (must nail)
1. **Hero → Manifesto:** Tonal shift Night → Dawn without hard cut
2. **Homepage → any sub-page:** Layout signature must change completely
3. **Free content → paywall:** Invitation inset, never gold-bordered promo
4. **Premium page → signup:** Ceremony continues — no sudden form-heavy UI

### Metrics that validate the journey (qualitative)
- User describes experience as “journey” or “world”, not “site” or “app”
- User can recall **one specific moment** (a country name, a recipe cover, the invitation letter)
- User does not mention “cards”, “pricing page”, or “filters” unprompted

---

## 23. Revised Success Criteria (v1.1)

The redesign is complete when:

1. **Category test:** Users compare BrewAtlas to Monocle/Aman, not to other coffee apps
2. **Travel test:** Users describe browsing as “travelling” or “exploring”, not “searching” or “browsing”
3. **Page identity test:** Users identify page by mood when shown greyscale layout screenshots (no text)
4. **Layout uniqueness test:** No two marketing pages share the same primary layout signature
5. **Zero card grids** on Home, Recipes, Origins, Devices, Roasters, Premium
6. **One photography language** — all images pass BrewAtlas Lens spec (§11)
7. **Motion serves story** — no decorative animation remains in public routes
8. **Architectural UAE test** — warmth felt through proportion and material, zero decorative cultural symbols
9. **Journey test:** First-time visitor emotional arc (§22) validated in moderated user sessions
10. **Single token file** — Atlas Canon only, no legacy aliases

---

## 24. Implementation Authorization

| Phase | Status |
|-------|--------|
| Strategy v1.0 | ✅ Complete |
| Refinement v1.1 | ✅ Complete |
| Phase 0 — Foundation | ⛔ **Not authorized** |
| Phase 1–5 | ⛔ **Not authorized** |

**To authorize implementation:** explicit approval of Phase 0 scope.

---

*Document owner: Creative Direction · BrewAtlas*  
*Resolve all design questions against: recognition test (§1), travel-not-catalog (§18), page identity (§19), layout uniqueness (§20), and first-visit journey (§22)*
