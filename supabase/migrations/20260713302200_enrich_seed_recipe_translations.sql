-- Gold-standard editorial extras for seeded community recipes.
-- Runs after recipe_translations exists (20260713280000).

insert into public.recipe_translations (recipe_id, locale, brew_notes, tips, warnings)
select
  r.id,
  'en',
  format(
    E'WHY THESE PARAMETERS WORK\n\nThis %s uses %s at %s°C with a %s ratio. The numbers are a starting point — your grinder and water will shift the ideal dial. Taste for sweetness first: a dry finish usually means you extracted too far; a sour, thin cup usually means not far enough.\n\nWHAT TO EXPECT\n\nBody and sweetness depend on method and origin more than a single TDS target. Use the listed tasting notes as the goal, not a fixed extraction percentage.',
    coalesce(bm.name, 'brew'),
    coalesce(r.grind_size, 'medium grind'),
    coalesce(r.water_temperature::text, '93'),
    coalesce(r.ratio, '1:16')
  ),
  format(
    E'EXPERT TIPS\n• Weigh coffee and water — ratio drift causes most inconsistent cups.\n• Rinse paper filters and pre-heat your server before dosing.\n• Rest coffee 7–14 days off roast for stable extraction on light lots.\n• Match pour rate to drawdown; keep a shallow slurry on percolation methods.\n\nWHEN TO USE THIS RECIPE\n\nReach for this when you want a repeatable %s template with the linked origin. Adjust grind in small steps if brew time drifts more than 30 seconds from %s.',
    coalesce(bm.name, 'brew'),
    coalesce(r.total_brew_time, r.estimated_brew_time, '3:30')
  ),
  E'COMMON MISTAKES\n• Pouring too aggressively and collapsing the bed (percolation).\n• Using stale beans or chlorinated water.\n• Grinding too fine for the method — bitterness and astringency follow.\n\nIF BITTER → grind coarser or shorten contact time.\nIF SOUR → grind finer or extend bloom/contact slightly.\nIF WEAK → increase dose or grind finer while watching drawdown.\nIF STRONG → dilute in the server or reduce dose next time.'
from public.recipes r
left join public.brewing_methods bm on bm.id = r.brewing_method_id
where r.author_id is null
on conflict (recipe_id, locale) do update set
  brew_notes = excluded.brew_notes,
  tips = excluded.tips,
  warnings = excluded.warnings,
  updated_at = now();
