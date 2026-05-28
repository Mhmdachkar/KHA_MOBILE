import { useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { MessageCircle, Banknote, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/storefrontPricing";

interface OrderConfirmationState {
  whatsappUrl?: string | null;
  paymentMethod?: "whatsapp" | "cash_on_delivery";
  total?: number;
}

const OrderConfirmation = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const state = (location.state as OrderConfirmationState | null) ?? {};

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const isCod = state.paymentMethod === "cash_on_delivery";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 w-full">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 max-w-lg text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Order confirmed</h1>
        <p className="text-muted-foreground text-sm mb-1">Thank you for your order.</p>
        {orderNumber && (
          <p className="text-lg font-medium text-primary mb-6">#{orderNumber}</p>
        )}
        {state.total != null && (
          <p className="text-sm text-muted-foreground mb-6">
            Total: <span className="font-semibold text-foreground">{formatMoney(state.total)}</span>
          </p>
        )}

        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 text-left space-y-4 mb-8 shadow-sm">
          {isCod ? (
            <>
              <div className="flex items-start gap-3">
                <Banknote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Cash on delivery</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We&apos;ll call you shortly to confirm delivery details. Please have payment ready
                    when your order arrives.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Complete payment on WhatsApp</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your order is saved. Tap below to open WhatsApp and receive payment instructions.
                  </p>
                </div>
              </div>
              {state.whatsappUrl && (
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#25D366] text-white"
                >
                  <a href={state.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Open WhatsApp
                  </a>
                </Button>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/order-lookup${orderNumber ? `?order=${encodeURIComponent(orderNumber)}` : ""}`}>
            <Button variant="outline" className="w-full sm:w-auto">
              Track your order
            </Button>
          </Link>
          <Link to="/products">
            <Button className="w-full sm:w-auto">
              Continue shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
