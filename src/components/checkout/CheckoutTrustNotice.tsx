import { Check } from "lucide-react";

interface CheckoutTrustNoticeProps {
  checkoutType: "product" | "streaming" | "recharge" | "gift_card";
  paymentMethod: "whatsapp" | "cash_on_delivery";
}

export function CheckoutTrustNotice({ checkoutType, paymentMethod }: CheckoutTrustNoticeProps) {
  if (checkoutType === "product" && paymentMethod === "cash_on_delivery") {
    return (
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
        <div className="flex items-start gap-2 sm:gap-3">
          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs sm:text-sm font-medium mb-1">Pay when your order arrives</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              No upfront payment required. We&apos;ll confirm your address by phone before dispatch.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutType === "product" && paymentMethod === "whatsapp") {
    return (
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-start gap-2 sm:gap-3">
          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs sm:text-sm font-medium mb-1">WhatsApp payment</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              After placing your order, we&apos;ll send secure payment instructions on WhatsApp.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
      <div className="flex items-start gap-2 sm:gap-3">
        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs sm:text-sm font-medium mb-1">Instant WhatsApp delivery</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Your codes or account details are sent on WhatsApp after payment confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}

export function CheckoutPaymentBullets({
  paymentMethod,
  isDigitalCheckout,
}: {
  paymentMethod: "whatsapp" | "cash_on_delivery";
  isDigitalCheckout: boolean;
}) {
  const bullets =
    paymentMethod === "cash_on_delivery" && !isDigitalCheckout
      ? [
          "Pay the courier when your package arrives",
          "We'll call to confirm your delivery address",
          "24/7 customer support available",
        ]
      : paymentMethod === "whatsapp" && !isDigitalCheckout
        ? [
            "Payment instructions sent on WhatsApp after ordering",
            "Your order is reserved once submitted",
            "24/7 customer support available",
          ]
        : [
            "Digital delivery via WhatsApp after payment",
            "Secure checkout — your information is protected",
            "24/7 customer support available",
          ];

  return (
    <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
      {bullets.map((text) => (
        <div key={text} className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}
