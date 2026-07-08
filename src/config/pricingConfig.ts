/**
 * Shared pricing types. Actual plan/credit-pack data is fetched live from
 * billing_service (see services/pricingService.ts) — this file only holds
 * the type used by that live-fetched data, so it can't drift out of sync.
 */

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerK: number;
  savings?: string;
  description: string;
  recommended: boolean;
}
