import type { BillingProvider } from "@/types/membership";

/** Thrown when a billing adapter is selected but its credentials are not configured. */
export class BillingNotConfiguredError extends Error {
  readonly provider: BillingProvider;

  constructor(provider: BillingProvider) {
    super(`Billing provider "${provider}" is not configured.`);
    this.name = "BillingNotConfiguredError";
    this.provider = provider;
  }
}
