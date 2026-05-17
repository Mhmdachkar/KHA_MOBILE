import { apiBase } from "@/lib/adminApi";

export interface ValidateCouponResult {
  valid: boolean;
  discount?: number;
  error?: string;
  coupon?: {
    code: string;
    discountType: string;
    discountValue: number;
    description?: string | null;
  };
}

export async function validateCouponCode(
  code: string,
  orderTotal: number
): Promise<ValidateCouponResult> {
  const res = await fetch(`${apiBase()}/api/public/validate-coupon`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: code.trim(), orderTotal }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { valid: false, error: data.error || "Could not validate coupon" };
  }
  return data as ValidateCouponResult;
}
