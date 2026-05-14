/**
 * Storefront → backend bridge for the new order-creation endpoint.
 * Used by `@/src/pages/Checkout.tsx` for both WhatsApp and COD flows.
 *
 * The server is the source of truth for prices, discounts, stock, and totals.
 * Client values are echoed for sanity checks; the server will reject mismatches.
 */

import { apiBase } from "@/lib/adminApi";

export type CheckoutType =
  | "product"
  | "streaming"
  | "recharge"
  | "gift_card";

export type PaymentMethod = "whatsapp" | "cash_on_delivery";

export interface OrderItemInput {
  productId?: number | null;
  name: string;
  image?: string | null;
  variantLabel?: string | null;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  checkoutType: CheckoutType;
  paymentMethod: PaymentMethod;
  customer: {
    name?: string;
    email?: string | null;
    phone: string;
    shippingAddress?: string | null;
  };
  items: OrderItemInput[];
  couponCode?: string | null;
  shippingCost?: number;
  clientTotal?: number;
  notes?: string | null;
  idempotencyKey: string;
}

export interface CreateOrderResponse {
  order: {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: PaymentMethod;
    subtotal: number;
    discount: number;
    shippingCost: number;
    total: number;
    couponCode: string | null;
    createdAt: string;
  };
  whatsappUrl: string | null;
  idempotent: boolean;
}

export interface OrderApiError {
  error: string;
  code?: string;
}

/**
 * Generate a UUID v4 — uses `crypto.randomUUID` when available, falls back to
 * a Math.random-based polyfill for older browsers / non-secure contexts.
 */
export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // RFC4122-ish fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function submitOrder(
  input: CreateOrderInput
): Promise<CreateOrderResponse> {
  const res = await fetch(`${apiBase()}/api/public/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* response wasn't JSON */
  }

  if (!res.ok) {
    const err = (data as OrderApiError) || { error: res.statusText };
    const e = new Error(err.error || `Order failed (${res.status})`) as Error & {
      code?: string;
      status?: number;
    };
    e.code = err.code;
    e.status = res.status;
    throw e;
  }

  return data as CreateOrderResponse;
}
