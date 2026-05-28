import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/storefrontPricing";

interface PdpStickyBarProps {
  selectionText: string;
  selectionIncomplete: boolean;
  displayPrice: number;
  preorderHideNumeric: boolean;
  cartQuantity: number;
  maxCartQuantity: number;
  cannotPurchase: boolean;
  isPreorder: boolean;
  onDecreaseQty: () => void;
  onIncreaseQty: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onIncompleteTap: () => void;
}

export function PdpStickyBar({
  selectionText,
  selectionIncomplete,
  displayPrice,
  preorderHideNumeric,
  cartQuantity,
  maxCartQuantity,
  cannotPurchase,
  isPreorder,
  onDecreaseQty,
  onIncreaseQty,
  onAddToCart,
  onBuyNow,
  onIncompleteTap,
}: PdpStickyBarProps) {
  const handlePrimary = () => {
    if (selectionIncomplete) {
      onIncompleteTap();
      return;
    }
    onAddToCart();
  };

  const handleBuyNow = () => {
    if (selectionIncomplete) {
      onIncompleteTap();
      return;
    }
    onBuyNow();
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="max-w-lg mx-auto space-y-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-1 min-w-0">
            {selectionText ? (
              <p className="text-[11px] text-muted-foreground truncate" title={selectionText}>
                {selectionText}
              </p>
            ) : selectionIncomplete ? (
              <button
                type="button"
                onClick={onIncompleteTap}
                className="text-[11px] text-amber-600 underline-offset-2 hover:underline"
              >
                Select options above
              </button>
            ) : null}
            <p className="text-sm font-semibold text-primary leading-tight">
              {preorderHideNumeric ? (
                "Pre-order"
              ) : (
                <>
                  {formatMoney(displayPrice)}
                  {cartQuantity > 1 && (
                    <span className="text-xs font-normal text-muted-foreground"> × {cartQuantity}</span>
                  )}
                </>
              )}
            </p>
          </div>
          {!cannotPurchase && (
            <div
              className="flex items-center border border-border rounded-lg shrink-0 bg-background"
              aria-label="Quantity"
            >
              <button
                type="button"
                onClick={onDecreaseQty}
                disabled={cartQuantity <= 1}
                className="h-9 w-9 flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-sm font-medium w-8 text-center tabular-nums">{cartQuantity}</span>
              <button
                type="button"
                onClick={onIncreaseQty}
                disabled={cartQuantity >= maxCartQuantity}
                className="h-9 w-9 flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 text-elegant h-10"
            onClick={handlePrimary}
            disabled={cannotPurchase}
            style={{ touchAction: "manipulation" }}
          >
            <ShoppingCart className="mr-1.5 h-4 w-4" />
            {cannotPurchase
              ? "Out of Stock"
              : selectionIncomplete
                ? "Choose options"
                : isPreorder
                  ? `Pre-order${cartQuantity > 1 ? ` (${cartQuantity})` : ""}`
                  : `Add to cart${cartQuantity > 1 ? ` (${cartQuantity})` : ""}`}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-elegant h-10"
            onClick={handleBuyNow}
            disabled={cannotPurchase}
            style={{ touchAction: "manipulation" }}
          >
            {cannotPurchase
              ? "Unavailable"
              : selectionIncomplete
                ? "Choose options"
                : isPreorder
                  ? "Preorder checkout"
                  : "Buy now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
