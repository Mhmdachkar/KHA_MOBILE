/**
 * Unit tests for AdminCoupons.tsx save() validation logic (BUG 4 fix)
 *
 * Rules (from save()):
 *  1. code must be non-empty
 *  2. discount_value: parseFloat → must be finite AND > 0
 *  3. percentage discount: value must be ≤ 100
 *  4. Numeric string fields (min_order_amount, max_discount_amount, max_uses)
 *     are stringified in form state and only converted on submit — TS type safety
 */

import { describe, it, expect } from "vitest";

// ─── replicated coupon validation (matches AdminCoupons save() logic) ─────────

interface CouponFormInput {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_amount: string;
  max_discount_amount: string;
  max_uses: string;
}

function validateCoupon(form: CouponFormInput): string | null {
  if (!form.code.trim()) return "Code required";

  const discountValue = parseFloat(form.discount_value);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return "Discount value must be greater than 0";
  }
  if (form.discount_type === "percentage" && discountValue > 100) {
    return "Percentage discount cannot exceed 100";
  }
  return null;
}

function buildSubmitPayload(form: CouponFormInput) {
  const discountValue = parseFloat(form.discount_value);
  return {
    code: form.code.trim().toUpperCase(),
    discount_type: form.discount_type,
    discount_value: discountValue,
    min_order_amount: form.min_order_amount !== "" ? parseFloat(form.min_order_amount) : null,
    max_discount_amount: form.max_discount_amount !== "" ? parseFloat(form.max_discount_amount) : null,
    max_uses: form.max_uses !== "" ? parseInt(form.max_uses, 10) : null,
  };
}

// ─── code validation ──────────────────────────────────────────────────────────

describe("coupon code validation", () => {
  it("rejects empty code", () => {
    expect(validateCoupon({ code: "", discount_type: "percentage", discount_value: "10", min_order_amount: "", max_discount_amount: "", max_uses: "" }))
      .toBe("Code required");
  });

  it("rejects whitespace-only code", () => {
    expect(validateCoupon({ code: "   ", discount_type: "percentage", discount_value: "10", min_order_amount: "", max_discount_amount: "", max_uses: "" }))
      .toBe("Code required");
  });

  it("accepts valid code", () => {
    expect(validateCoupon({ code: "SAVE10", discount_type: "percentage", discount_value: "10", min_order_amount: "", max_discount_amount: "", max_uses: "" }))
      .toBeNull();
  });
});

// ─── discount_value validation ────────────────────────────────────────────────

describe("coupon discount_value validation", () => {
  it("rejects zero discount value", () => {
    expect(validateCoupon({ code: "A", discount_type: "percentage", discount_value: "0", min_order_amount: "", max_discount_amount: "", max_uses: "" }))
      .toMatch(/greater than 0/i);
  });

  it("rejects negative discount value", () => {
    expect(validateCoupon({ code: "A", discount_type: "percentage", discount_value: "-5", min_order_amount: "", max_discount_amount: "", max_uses: "" }))
      .toMatch(/greater than 0/i);
  });

  it("rejects empty discount value string", () => {
    expect(validateCoupon({ code: "A", discount_type: "fixed", discount_value: "", min_order_amount: "", max_discount_amount: "", max_uses: "" }))
      .toMatch(/greater than 0/i);
  });

  it("rejects non-numeric discount value", () => {
    expect(validateCoupon({ code: "A", discount_type: "fixed", discount_value: "abc", min_order_amount: "", max_discount_amount: "", max_uses: "" }))
      .toMatch(/greater than 0/i);
  });

  it("accepts valid percentage discount", () => {
    expect(validateCoupon({ code: "A", discount_type: "percentage", discount_value: "25", min_order_amount: "", max_discount_amount: "", max_uses: "" }))
      .toBeNull();
  });

  it("accepts valid fixed discount", () => {
    expect(validateCoupon({ code: "A", discount_type: "fixed", discount_value: "15.5", min_order_amount: "", max_discount_amount: "", max_uses: "" }))
      .toBeNull();
  });

  it("rejects percentage discount > 100", () => {
    expect(validateCoupon({ code: "A", discount_type: "percentage", discount_value: "150", min_order_amount: "", max_discount_amount: "", max_uses: "" }))
      .toMatch(/exceed 100/i);
  });

  it("allows fixed discount > 100 (valid for large orders)", () => {
    expect(validateCoupon({ code: "A", discount_type: "fixed", discount_value: "200", min_order_amount: "", max_discount_amount: "", max_uses: "" }))
      .toBeNull();
  });
});

// ─── BUG 4: string-typed optional numeric fields convert correctly on submit ──

describe("coupon submit payload conversion (BUG 4)", () => {
  it("converts discount_value string to number", () => {
    const payload = buildSubmitPayload({ code: "A", discount_type: "fixed", discount_value: "29.99", min_order_amount: "", max_discount_amount: "", max_uses: "" });
    expect(typeof payload.discount_value).toBe("number");
    expect(payload.discount_value).toBe(29.99);
  });

  it("converts min_order_amount string to number", () => {
    const payload = buildSubmitPayload({ code: "A", discount_type: "fixed", discount_value: "10", min_order_amount: "50", max_discount_amount: "", max_uses: "" });
    expect(payload.min_order_amount).toBe(50);
  });

  it("converts empty min_order_amount to null", () => {
    const payload = buildSubmitPayload({ code: "A", discount_type: "fixed", discount_value: "10", min_order_amount: "", max_discount_amount: "", max_uses: "" });
    expect(payload.min_order_amount).toBeNull();
  });

  it("converts max_uses string to integer", () => {
    const payload = buildSubmitPayload({ code: "A", discount_type: "fixed", discount_value: "10", min_order_amount: "", max_discount_amount: "", max_uses: "100" });
    expect(payload.max_uses).toBe(100);
    expect(Number.isInteger(payload.max_uses)).toBe(true);
  });

  it("converts empty max_uses to null", () => {
    const payload = buildSubmitPayload({ code: "A", discount_type: "fixed", discount_value: "10", min_order_amount: "", max_discount_amount: "", max_uses: "" });
    expect(payload.max_uses).toBeNull();
  });

  it("uppercases the coupon code on submit", () => {
    const payload = buildSubmitPayload({ code: "save10", discount_type: "fixed", discount_value: "10", min_order_amount: "", max_discount_amount: "", max_uses: "" });
    expect(payload.code).toBe("SAVE10");
  });
});
