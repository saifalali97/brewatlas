/** Marketing and analytics pricing for BrewAtlas Premium (AED). */
export const PREMIUM_MONTHLY_AED = 35;
export const PREMIUM_YEARLY_AED = 350;

export const PREMIUM_YEARLY_SAVINGS_AED = PREMIUM_MONTHLY_AED * 12 - PREMIUM_YEARLY_AED;

export const PREMIUM_YEARLY_SAVINGS_PERCENT = Math.round(
  (PREMIUM_YEARLY_SAVINGS_AED / (PREMIUM_MONTHLY_AED * 12)) * 100,
);

/** Monthly recurring revenue equivalent for a yearly subscriber. */
export const PREMIUM_YEARLY_MRR_AED = PREMIUM_YEARLY_AED / 12;

export function formatAed(amount: number): string {
  return `AED ${amount.toLocaleString("en-AE")}`;
}
