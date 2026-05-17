import { describe, expect, it } from "vitest";
import { RECHARGE_CATALOG, getRechargeCardById } from "@/data/rechargeCatalog";

describe("rechargeCatalog", () => {
  it("has unique ids", () => {
    const ids = RECHARGE_CATALOG.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("Touch Super retail price matches Recharges page", () => {
    const card = getRechargeCardById(8);
    expect(card?.name).toBe("Touch Super $13.50 Card");
    expect(card?.price).toBe(20);
  });

  it("every card has positive price", () => {
    for (const c of RECHARGE_CATALOG) {
      expect(c.price).toBeGreaterThan(0);
    }
  });
});
