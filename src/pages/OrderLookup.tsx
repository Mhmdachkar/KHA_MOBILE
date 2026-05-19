import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiBase } from "@/lib/adminApi";
import { formatMoney } from "@/lib/storefrontPricing";

interface OrderSummary {
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  coupon_code: string | null;
  customer_name: string | null;
  created_at: string;
}

const OrderLookup = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderSummary | null>(null);

  const lookup = async () => {
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const params = new URLSearchParams();
      if (phone.trim()) params.set("phone", phone.trim());
      const qs = params.toString();
      const res = await fetch(
        `${apiBase()}/api/public/orders/${encodeURIComponent(orderNumber.trim())}${qs ? `?${qs}` : ""}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Order not found");
        return;
      }
      setOrder(data.order as OrderSummary);
    } catch {
      setError("Could not reach the server. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">      <div className="container mx-auto px-4 py-10 max-w-lg">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-elegant text-2xl sm:text-3xl mb-2"
        >
          Track your order
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your order number (e.g. KHA-10042) and the phone number used at checkout.
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 border rounded-lg p-5 bg-card"
        >
          <motion.div className="space-y-1.5">
            <Label htmlFor="orderNumber">Order number</Label>
            <Input
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="KHA-12345"
            />
          </motion.div>
          <motion.div className="space-y-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03 123 456"
            />
          </motion.div>
          <Button className="w-full" onClick={() => void lookup()} disabled={loading || !orderNumber.trim()}>
            {loading ? "Looking up…" : "Find order"}
          </Button>
          {error && (
            <p className="text-sm text-destructive" role="alert" aria-live="polite">
              {error}
            </p>
          )}
          {order && (
            <motion.div className="mt-4 pt-4 border-t space-y-2 text-sm" aria-live="polite">
              <p className="font-semibold text-lg">{order.order_number}</p>
              <p>
                Status: <span className="capitalize">{order.status}</span> · Payment:{" "}
                <span className="capitalize">{order.payment_status}</span>
              </p>
              <p>Subtotal: {formatMoney(Number(order.subtotal))}</p>
              {Number(order.discount) > 0 && (
                <p className="text-green-600">
                  Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}: −
                  {formatMoney(Number(order.discount))}
                </p>
              )}
              {Number(order.shipping_cost) > 0 && (
                <p>Delivery: {formatMoney(Number(order.shipping_cost))}</p>
              )}
              <p className="font-semibold">Total: {formatMoney(Number(order.total))}</p>
              <p className="text-xs text-muted-foreground">
                Placed {new Date(order.created_at).toLocaleString()}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderLookup;
