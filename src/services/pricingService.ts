export interface PricingInput {
  rawMaterial: number;
  labour: number;
  packaging: number;
  transport: number;
  marginPercent: number;
  market: "village" | "district" | "city" | "online";
}

export interface PricingResult {
  cost: number;
  minimum: number;
  recommended: number;
  premium: number;
  profit: number;
  marketLow: number;
  marketHigh: number;
  reasons: string[];
}

const MARKET_FACTOR: Record<PricingInput["market"], number> = {
  village: 1.0,
  district: 1.12,
  city: 1.28,
  online: 1.35,
};

import { aiPriceEstimate } from "@/lib/ai.functions";

export const pricingService = {
  async suggestPrice(input: PricingInput & { product?: string; place?: string }): Promise<PricingResult> {
    const cost = input.rawMaterial + input.labour + input.packaging + input.transport;
    try {
      const ai = await aiPriceEstimate({ data: { ...input } });
      const recommended = Math.max(Math.round(ai.recommended), cost + 1);
      return {
        cost,
        minimum: Math.round(ai.minimum),
        recommended,
        premium: Math.max(Math.round(ai.premium), recommended + 1),
        profit: recommended - cost,
        marketLow: Math.round(ai.marketLow),
        marketHigh: Math.round(ai.marketHigh),
        reasons: ai.reasons,
      };
    } catch (error) {
      console.error("Price AI failed, using the cost calculation instead", error);
    }
    return pricingService.calculatePrice(input);
  },

  calculatePrice(input: PricingInput): PricingResult {
    const cost = input.rawMaterial + input.labour + input.packaging + input.transport;
    const factor = MARKET_FACTOR[input.market];
    const minimum = Math.round((cost * 1.12) / 10) * 10;
    const recommended = Math.round((cost * (1 + input.marginPercent / 100) * factor) / 10) * 10 - 1;
    const premium = Math.round((recommended * 1.28) / 10) * 10 - 1;
    return {
      cost,
      minimum,
      recommended,
      premium,
      profit: recommended - cost,
      marketLow: Math.round(recommended * 0.82),
      marketHigh: Math.round(recommended * 1.24),
      reasons: [
        `Your total cost per piece is ₹${cost}.`,
        `Buyers in the ${input.market} market pay about ${Math.round((factor - 1) * 100)}% more than village rates.`,
        `A ${input.marginPercent}% margin keeps you profitable after wastage and returns.`,
        "Comparable handmade pieces nearby sell in a similar range.",
      ],
    };
  },
};
