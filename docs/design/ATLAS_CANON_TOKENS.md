# Atlas Canon — Design Token Reference

**Phase 0 foundation** · Canonical source: `lib/design-system/atlas-canon.ts` · CSS: `app/globals.css`

---

## Overview

Atlas Canon is the authoritative design system for BrewAtlas. All new composition work uses `ac-*` tokens. Legacy `ba-*`, `ds-*`, and `uae-*` names remain as **aliases** for backward compatibility.

| Layer | Path | Purpose |
|-------|------|---------|
| **Canonical** | `lib/design-system/atlas-canon.ts` | Source of truth |
| **Compat** | `lib/design-system/tokens.ts` | `ds*` exports for existing code |
| **CSS** | `app/globals.css` | `--ac-*` variables + utilities |
| **Styles** | `lib/constants/styles.ts` | Component class strings |
| **Primitives** | `app/components/atlas/` | Chapter, Cover, Folio, Portal, Destination, Invitation |

---

## Color System

### Core palette

| Token | CSS variable | Hex | Role |
|-------|-------------|-----|------|
| `limestone` | `--ac-limestone` | `#F7F3EC` | Primary page ground |
| `pearl` | `--ac-pearl` | `#FDFBF7` | Elevated surfaces |
| `sand` | `--ac-sand` | `#E8DCC8` | Secondary ground |
| `dune` | `--ac-dune` | `#D4C4A8` | Tertiary sand, dividers |
| `espresso` | `--ac-espresso` | `#1A1410` | Primary dark / ink |
| `walnut` | `--ac-walnut` | `#3D2E24` | Secondary text |
| `copper` | `--ac-copper` | `#A67B4A` | Primary accent (brass) |
| `gold` | `--ac-gold` | `#C4A574` | Highlight accent (max 1/viewport) |
| `palm` | `--ac-palm` | `#4A5D52` | Origin/nature contexts only |
| `mist` | `--ac-mist` | `#E5E0D8` | Borders on light |
| `charcoal` | `--ac-charcoal` | `#2A2520` | Secondary dark |

### Tailwind usage

```tsx
className="bg-ac-limestone text-ac-espresso border-ac-copper/25"
```

### Semantic roles (TypeScript)

```tsx
import { acSurface, acText, acBorder } from "@/lib/design-system/atlas-canon";

<div className={`${acSurface.page} ${acText.primary} ${acBorder.subtle}`} />
```

### Legacy aliases

| Legacy | Maps to |
|--------|---------|
| `ba-ivory` | `ac-limestone` |
| `ba-pearl` | `ac-pearl` |
| `ba-sand` | `ac-sand` |
| `ba-sand-deep` | `ac-dune` |
| `ba-coffee` | `ac-walnut` |
| `ba-espresso` | `ac-espresso` |
| `ba-bronze` | `ac-copper` |
| `ba-gold` | `ac-gold` |
| `uae-*` | Atlas Canon equivalents in `@theme` |

---

## Section Rhythm

Five tonal chapter modes for journey-based layouts:

| Mode | CSS class | Tone |
|------|-----------|------|
| Night | `.ac-section-night` | Espresso + photography |
| Dawn | `.ac-section-dawn` | Limestone + pearl |
| Sand | `.ac-section-sand` | Sand gradient |
| Day | `.ac-section-day` | Pearl flat |
| Dusk | `.ac-section-dusk` | Walnut → espresso gradient |

```tsx
import { acSectionRhythm } from "@/lib/design-system/atlas-canon";

<section className={acSectionRhythm.dawn} />
```

Legacy `.section-light`, `.section-sand`, etc. remain aliases.

---

## Typography

| Token | Use |
|-------|-----|
| `acTypography.displayXl` | Hero only (80–112px) |
| `acTypography.displayLg` | Chapter openers |
| `acTypography.h1`–`h3` | Page/section titles |
| `acTypography.bodyLg` / `body` | Prose |
| `acTypography.eyebrow` | Copper, 11px, 0.20em tracking |
| `acTypography.folioTitle` | Folio index rows |
| `acTypography.folioMeta` | Folio metadata |

Display face: **Instrument Serif** (`.font-display`)  
UI/body: **Geist Sans**

---

## Spacing

8px base grid:

| Token | Tailwind | px |
|-------|----------|-----|
| `acSpace.xs` | `2` | 8 |
| `acSpace.sm` | `4` | 16 |
| `acSpace.md` | `6` | 24 |
| `acSpace.lg` | `12` | 48 |
| `acSpace.xl` | `20` | 80 |
| `acSpace.2xl` | `32` | 128 |
| `acSpace.3xl` | `48` | 192 |

Section padding presets: `acSectionPadding.standard | compact | hero | chapter`

---

## Grid — Editorial 12

| Token | Layout |
|-------|--------|
| `acGrid.container` | max-w-6xl |
| `acGrid.containerWide` | max-w-7xl |
| `acGrid.containerProse` | max-w 28em |
| `acGrid.monument` + `monumentMain` | 8–10 col feature |
| `acGrid.split` | 50/50 |
| `acGrid.splitAsymmetric` + `splitMain/splitAside` | 7+5 |
| `acGrid.rail` + `railSticky/railContent` | Sticky sidebar |

---

## Radius

| Token | Value | Use |
|-------|-------|-----|
| `acRadius.none` | 0 | Atlas panels |
| `acRadius.sm` | 4px | Inputs |
| `acRadius.arch` | arch bottom | Portals only |
| `acRadius.full` | pill | Buttons, avatars |

---

## Shadows & Elevation

| Token | Use |
|-------|-----|
| `acShadow.plate` | Functional surfaces |
| `acShadow.sm/md/lg` | Depth levels |
| `acElevation.plate` | Forms, modals |
| `acElevation.floating` | Dropdowns |

Editorial compositions use **no shadow**.

---

## Motion

| Token | Duration | Role |
|-------|----------|------|
| `acMotion.instant` | 120ms | Focus, toggles |
| `acMotion.calm` | 400ms | Hover, state |
| `acMotion.reveal` | 900ms | Scroll beat |
| `acMotion.passage` | 1200ms | Chapter boundary |
| `acMotion.atlas` | 1600ms | Route draw |

Easing: `cubic-bezier(0.22, 1, 0.36, 1)`

Components:
- `MotionReveal` — `lib/design-system/motion.tsx` (SSR-safe, always visible)
- `RevealOnScroll` — updated to match (no opacity-0 first paint)

---

## Photography Grades

CSS classes applied to images:

| Class | Page context |
|-------|-------------|
| `.photo-grade-night` | Hero, premium |
| `.photo-grade-dawn` | Discovery |
| `.photo-grade-library` | Recipes |
| `.photo-grade-earth` | Origins |
| `.photo-grade-workshop` | Devices |
| `.photo-grade-directory` | Roasters |
| `.photo-grade-gallery` | Premium gallery |

```tsx
import { acPhotoGrade } from "@/lib/design-system/atlas-canon";
<Image className={acPhotoGrade.library} ... />
```

---

## Composition Primitives

Import from `@/app/components/atlas` or `@/app/components/ui/ds`:

| Primitive | Purpose |
|-----------|---------|
| `Chapter` | Full-width tonal section with rhythm |
| `Cover` | Magazine cover (60/40 split) |
| `Folio` + `FolioItem` | Typographic index rows |
| `Portal` | Full-bleed discovery link |
| `Destination` + `DestinationRail` | Atlas country panels |
| `Invitation` | Members-club letter CTA |

**Not yet wired to pages** — available for Phase 1+.

---

## Migration Guide

### New code
```tsx
import { acTypography, acSectionRhythm } from "@/lib/design-system/atlas-canon";
import { Chapter, Cover } from "@/app/components/atlas";
```

### Existing code
No changes required — `ba-*` classes and `ds*` exports continue to work.

### Deprecated (do not use in new code)
- `premiumShell` card pattern → `Cover`, `Folio`, `Plate`
- `UAE_BRAND_COLORS` hex literals → `acColorHex`
- Opacity-0 scroll reveal → `MotionReveal`

---

*See also: [BREWATLAS_VISUAL_IDENTITY.md](./BREWATLAS_VISUAL_IDENTITY.md)*
