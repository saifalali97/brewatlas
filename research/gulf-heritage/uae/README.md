# UAE Gulf Heritage — Verified Content Research Registry

**Status:** Research registry complete — sources catalogued for editorial review.  
**Last updated:** 2026-07-19  
**Scope:** United Arab Emirates only (BrewAtlas Gulf Heritage Phase 2)

## Rules applied

- No invented history, recipes, ratios, temperatures, or business facts.
- Every entry is a **source citation** pending human verification before publication on BrewAtlas.
- `confidence`: **High** = primary/official (government, UNESCO, roaster official site, publisher); **Medium** = reputable secondary (major news, museums, academic publishers, SCA).
- `publicationDate` omitted when not stated on the source page.
- Recipe entries list **source documents only** — BrewAtlas must not republish ingredient quantities until editors verify against the primary source.

## Structure

```
research/gulf-heritage/uae/
├── README.md                 (this file)
├── index.json                (topic & roaster manifest)
├── topics/*.json             (sources per heritage topic)
├── roasters/*.json           (sources per roaster profile)
└── recipes/index.json        (verified recipe source catalog)
```

## Integration (future)

When approved, map `sources[]` into `UAE_PAGE_REFERENCES` and editorial body fields in `lib/content/gulf-heritage/uae/`. Do not auto-import without editorial sign-off.

## Known gaps

| Item | Gap |
|------|-----|
| **Boom Coffee** (UAE) | No official UAE roastery website or verified `.ae` domain found in research (2026-07-19). Distinct from Boon Coffee Roasters (UAE) and unrelated international "Boom Coffee" brands. **Requires primary confirmation before profile content.** |
| **Arabic coffee brew ratios** | DCT guides describe process and etiquette; precise dose/temperature ratios require PDF review (`Al Gahwa Activity Guide`) before recipe publication. |
| **Adani tea in UAE context** | Strong Yemeni/Aden sources; UAE-specific official sources limited — treat as diaspora/Gulf beverage with Yemeni primary sources. |
