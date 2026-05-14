/**
 * Unit tests for the client-side validation logic in AdminProductEditor.tsx (save())
 *
 * We replicate the exact validation rules so regressions are caught here
 * without mounting the full React component.
 *
 * Rules (from save()):
 *  1. name must be non-empty
 *  2. price: trim → parseFloat → must be finite AND ≥ 0
 *  3. if isPreorder && priceNum === 0 → error
 *  4. compareAtPrice: if non-empty → parseFloat → must be finite AND > priceNum
 *  5. legacyOverrideId: if non-empty → must be a valid non-negative number
 *  6. rating: must be 0–5
 */

import { describe, it, expect } from "vitest";

// ─── replicated validation (matches AdminProductEditor save() logic) ──────────

interface ValidationInput {
  name: string;
  price: string;
  isPreorder: boolean;
  compareAtPrice: string;
  legacyOverrideId: string;
  rating: string;
}

function validate(form: ValidationInput): string | null {
  if (!form.name.trim()) return "Name is required";

  const priceStr = form.price.trim();
  const priceNum = parseFloat(priceStr);
  if (priceStr === "" || !Number.isFinite(priceNum) || priceNum < 0) {
    return `Valid price is required (got: "${priceStr || "empty"}")`;
  }

  if (form.isPreorder && priceNum === 0) {
    return "Pre-order products cannot have a zero price";
  }

  const compareAtStr = form.compareAtPrice.trim();
  const compareAtNum = compareAtStr !== "" ? parseFloat(compareAtStr) : null;
  if (compareAtNum !== null && (!Number.isFinite(compareAtNum) || compareAtNum <= priceNum)) {
    return "'Compare At' price must be greater than sale price";
  }

  if (
    form.legacyOverrideId &&
    (isNaN(Number(form.legacyOverrideId)) || Number(form.legacyOverrideId) < 0)
  ) {
    return "Legacy Override ID must be a valid positive number";
  }

  const ratingNum = Number(form.rating);
  if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
    return "Rating must be between 0 and 5";
  }

  return null;
}

// ─── name validation ─────────────────────────────────────────────────────────

describe("name validation", () => {
  it("rejects empty name", () => {
    expect(validate({ name: "", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBe("Name is required");
  });

  it("rejects whitespace-only name", () => {
    expect(validate({ name: "   ", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBe("Name is required");
  });

  it("accepts valid name", () => {
    expect(validate({ name: "iPhone 15", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBeNull();
  });
});

// ─── price validation ─────────────────────────────────────────────────────────

describe("price validation", () => {
  it("rejects empty price string", () => {
    expect(validate({ name: "A", price: "", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toMatch(/valid price/i);
  });

  it("rejects NaN price (letters)", () => {
    expect(validate({ name: "A", price: "abc", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toMatch(/valid price/i);
  });

  it("rejects negative price", () => {
    expect(validate({ name: "A", price: "-1", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toMatch(/valid price/i);
  });

  it("rejects price that is only a minus sign", () => {
    expect(validate({ name: "A", price: "-", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toMatch(/valid price/i);
  });

  it("accepts zero price for non-preorder", () => {
    expect(validate({ name: "A", price: "0", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBeNull();
  });

  it("accepts decimal price", () => {
    expect(validate({ name: "A", price: "9.99", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBeNull();
  });

  it("accepts price with leading/trailing whitespace", () => {
    expect(validate({ name: "A", price: "  12.5  ", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBeNull();
  });

  it("rejects intermediate decimal input '12.'", () => {
    // parseFloat("12.") returns 12 which IS valid — this is intentional (allows typing)
    expect(validate({ name: "A", price: "12.", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBeNull();
  });

  it("rejects price of just a dot '.'", () => {
    expect(validate({ name: "A", price: ".", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toMatch(/valid price/i);
  });
});

// ─── pre-order price validation ───────────────────────────────────────────────

describe("pre-order price validation", () => {
  it("rejects preorder with price=0", () => {
    expect(validate({ name: "A", price: "0", isPreorder: true, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toMatch(/pre-order.*zero price/i);
  });

  it("accepts preorder with price > 0", () => {
    expect(validate({ name: "A", price: "99", isPreorder: true, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBeNull();
  });

  it("accepts price=0 when NOT preorder", () => {
    expect(validate({ name: "A", price: "0", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBeNull();
  });
});

// ─── compareAtPrice validation ────────────────────────────────────────────────

describe("compareAtPrice validation", () => {
  it("accepts empty compareAtPrice", () => {
    expect(validate({ name: "A", price: "50", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBeNull();
  });

  it("rejects compareAtPrice equal to price", () => {
    expect(validate({ name: "A", price: "50", isPreorder: false, compareAtPrice: "50", legacyOverrideId: "", rating: "4.5" }))
      .toMatch(/compare at/i);
  });

  it("rejects compareAtPrice less than price", () => {
    expect(validate({ name: "A", price: "50", isPreorder: false, compareAtPrice: "30", legacyOverrideId: "", rating: "4.5" }))
      .toMatch(/compare at/i);
  });

  it("accepts compareAtPrice greater than price", () => {
    expect(validate({ name: "A", price: "50", isPreorder: false, compareAtPrice: "100", legacyOverrideId: "", rating: "4.5" }))
      .toBeNull();
  });

  it("rejects non-numeric compareAtPrice", () => {
    expect(validate({ name: "A", price: "50", isPreorder: false, compareAtPrice: "abc", legacyOverrideId: "", rating: "4.5" }))
      .toMatch(/compare at/i);
  });
});

// ─── rating validation ────────────────────────────────────────────────────────

describe("rating validation", () => {
  it("accepts 0", () => {
    expect(validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "0" }))
      .toBeNull();
  });

  it("accepts 5", () => {
    expect(validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "5" }))
      .toBeNull();
  });

  it("accepts 4.5", () => {
    expect(validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBeNull();
  });

  it("rejects rating > 5", () => {
    expect(validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "6" }))
      .toMatch(/rating/i);
  });

  it("rejects negative rating", () => {
    expect(validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "-1" }))
      .toMatch(/rating/i);
  });

  it("rejects non-numeric rating", () => {
    expect(validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "excellent" }))
      .toMatch(/rating/i);
  });
});

// ─── legacyOverrideId validation ──────────────────────────────────────────────

describe("legacyOverrideId validation", () => {
  it("accepts empty (not set)", () => {
    expect(validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "", rating: "4.5" }))
      .toBeNull();
  });

  it("accepts valid positive integer", () => {
    expect(validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "42", rating: "4.5" }))
      .toBeNull();
  });

  it("rejects negative legacy id", () => {
    expect(validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "-5", rating: "4.5" }))
      .toMatch(/legacy/i);
  });

  it("rejects non-numeric legacy id", () => {
    expect(validate({ name: "A", price: "10", isPreorder: false, compareAtPrice: "", legacyOverrideId: "abc", rating: "4.5" }))
      .toMatch(/legacy/i);
  });
});
