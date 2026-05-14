/**
 * Unit tests for admin product basics validation (shared with AdminProductEditor save()).
 */

import { describe, it, expect } from "vitest";
import { validateAdminProductBasics } from "@/lib/adminProductPricing";

interface ValidationInput {
  name: string;
  price: string;
  isPreorder: boolean;
  compareAtPrice: string;
  legacyOverrideId: string;
  rating: string;
}

function validate(form: ValidationInput): string | null {
  return validateAdminProductBasics(form);
}

// ─── name validation ─────────────────────────────────────────────────────────

describe("name validation", () => {
  it("rejects empty name", () => {
    expect(
      validate({ name: "", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toBe("Name is required");
  });

  it("rejects whitespace-only name", () => {
    expect(
      validate({ name: "   ", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toBe("Name is required");
  });

  it("accepts valid name", () => {
    expect(
      validate({ name: "iPhone 15", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toBeNull();
  });
});

// ─── list / sale price validation ─────────────────────────────────────────────

describe("list & sale price validation", () => {
  it("rejects when both list and sale are empty", () => {
    expect(
      validate({ name: "A", price: "", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toMatch(/compare at/i);
  });

  it("accepts list price only (compare at filled, sale empty)", () => {
    expect(
      validate({ name: "A", price: "", isPreorder: false, compareAtPrice: "99.99", legacyOverrideId: "", rating: "4.5" })
    ).toBeNull();
  });

  it("accepts sale price only (sale filled, list empty)", () => {
    expect(
      validate({ name: "A", price: "49", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toBeNull();
  });

  it("rejects NaN sale (letters)", () => {
    expect(
      validate({ name: "A", price: "abc", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toMatch(/sale price/i);
  });

  it("rejects negative sale", () => {
    expect(
      validate({ name: "A", price: "-1", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toMatch(/negative/i);
  });

  it("accepts zero sale when list is set (treated as list-only)", () => {
    expect(
      validate({ name: "A", price: "0", isPreorder: false, compareAtPrice: "100", legacyOverrideId: "", rating: "4.5" })
    ).toBeNull();
  });

  it("accepts discount when list > sale", () => {
    expect(
      validate({ name: "A", price: "50", isPreorder: false, compareAtPrice: "100", legacyOverrideId: "", rating: "4.5" })
    ).toBeNull();
  });

  it("accepts equal list and sale (collapses to single price)", () => {
    expect(
      validate({ name: "A", price: "50", isPreorder: false, compareAtPrice: "50", legacyOverrideId: "", rating: "4.5" })
    ).toBeNull();
  });

  it("rejects list less than sale", () => {
    expect(
      validate({ name: "A", price: "50", isPreorder: false, compareAtPrice: "30", legacyOverrideId: "", rating: "4.5" })
    ).toMatch(/compare-at/i);
  });

  it("rejects non-numeric list price", () => {
    expect(
      validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "xyz", legacyOverrideId: "", rating: "4.5" })
    ).toMatch(/compare-at/i);
  });
});

// ─── pre-order price validation ───────────────────────────────────────────────

describe("pre-order price validation", () => {
  it("rejects preorder with only sale 0 and no list", () => {
    expect(
      validate({ name: "A", price: "0", isPreorder: true, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toMatch(/pre-order.*zero price/i);
  });

  it("accepts preorder with list price only", () => {
    expect(
      validate({ name: "A", price: "", isPreorder: true, compareAtPrice: "199", legacyOverrideId: "", rating: "4.5" })
    ).toBeNull();
  });

  it("accepts preorder with sale > 0", () => {
    expect(
      validate({ name: "A", price: "99", isPreorder: true, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toBeNull();
  });

  it("accepts price=0 when NOT preorder", () => {
    expect(
      validate({ name: "A", price: "0", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toBeNull();
  });
});

// ─── rating validation ────────────────────────────────────────────────────────

describe("rating validation", () => {
  it("accepts 0", () => {
    expect(
      validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "0" })
    ).toBeNull();
  });

  it("accepts 5", () => {
    expect(
      validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "5" })
    ).toBeNull();
  });

  it("accepts 4.5", () => {
    expect(
      validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toBeNull();
  });

  it("rejects rating > 5", () => {
    expect(
      validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "6" })
    ).toMatch(/rating/i);
  });

  it("rejects negative rating", () => {
    expect(
      validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "-1" })
    ).toMatch(/rating/i);
  });

  it("rejects non-numeric rating", () => {
    expect(
      validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "excellent" })
    ).toMatch(/rating/i);
  });
});

// ─── legacyOverrideId validation ────────────────────────────────────────────────

describe("legacyOverrideId validation", () => {
  it("accepts empty (not set)", () => {
    expect(
      validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" })
    ).toBeNull();
  });

  it("accepts valid positive integer", () => {
    expect(
      validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "42", rating: "4.5" })
    ).toBeNull();
  });

  it("rejects negative legacy id", () => {
    expect(
      validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "-5", rating: "4.5" })
    ).toMatch(/legacy/i);
  });

  it("rejects non-numeric legacy id", () => {
    expect(
      validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "abc", rating: "4.5" })
    ).toMatch(/legacy/i);
  });
});
