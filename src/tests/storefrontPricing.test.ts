import { describe, expect, it } from "vitest";
import { getCardPricePresentation, resolveSalePrice } from "@/lib/storefrontPricing";

describe("storefrontPricing", () => {
  it("uses minimum variant price for sale resolution", () => {
    expect(
      resolveSalePrice({
        price: 999,
        variants: [{ price: 900 }, { price: 950 }],
      })
    ).toBe(900);
  });

  it("shows from label when variant prices differ", () => {
    const card = getCardPricePresentation({
      price: 999,
      compareAtPrice: 1100,
      variants: [{ price: 900 }, { price: 950 }],
    });
    expect(card.hasPriceRange).toBe(true);
    expect(card.priceLabel).toMatch(/^From \$900\.00$/);
    expect(card.showDiscount).toBe(true);
  });
});
