import { ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/imageUtils";
import { formatMoney } from "@/lib/storefrontPricing";
import {
  shortStorageLabel,
  type ColorOption,
  type SizeOption,
} from "@/lib/addToCartPolicy";

export interface InlineVariant {
  key: string;
  label: string;
  price: number;
  storage?: string;
}

interface ProductCardInlineOptionsProps {
  variants?: InlineVariant[];
  sizes?: SizeOption[];
  colors?: ColorOption[];
  selectedVariant: InlineVariant | null;
  selectedSize: SizeOption | null;
  selectedColor: ColorOption | null;
  onSelectVariant: (v: InlineVariant) => void;
  onSelectSize: (s: SizeOption) => void;
  onSelectColor: (c: ColorOption) => void;
  displayPrice: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const touchBtn =
  "touch-manipulation active:scale-[0.98] transition-transform";

function isColorUnavailable(stock?: string): boolean {
  if (!stock) return false;
  const s = stock.toLowerCase();
  return s === "out" || s === "out_of_stock" || s === "unavailable";
}

const ProductCardInlineOptions = ({
  variants,
  sizes,
  colors,
  selectedVariant,
  selectedSize,
  selectedColor,
  onSelectVariant,
  onSelectSize,
  onSelectColor,
  displayPrice,
  onConfirm,
  onCancel,
}: ProductCardInlineOptionsProps) => {
  const showColors = (colors?.length ?? 0) > 1;

  const resolvedPrice =
    selectedSize?.price != null && selectedSize.price !== ""
      ? Number(selectedSize.price)
      : selectedVariant?.price ?? displayPrice;

  return (
    <div
      className="px-2.5 sm:px-3 pb-3 pt-2 border-t border-primary/20 bg-muted/30 space-y-2.5 sm:space-y-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] sm:text-[10px] font-semibold text-primary uppercase tracking-wide">
          Choose options
        </p>
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            "h-9 w-9 sm:h-7 sm:w-7 flex items-center justify-center rounded-full hover:bg-muted active:bg-muted shrink-0",
            touchBtn
          )}
          aria-label="Close"
        >
          <X className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
        </button>
      </div>

      {variants && variants.length > 0 && (
        <div className="space-y-1.5 sm:space-y-1">
          <p className="text-[10px] sm:text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
            Storage
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-1">
            {variants.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => onSelectVariant(v)}
                className={cn(
                  touchBtn,
                  "min-h-[40px] sm:min-h-0 sm:min-w-[2.75rem] px-2.5 py-2 sm:py-1 rounded-lg sm:rounded-md text-[11px] font-semibold border",
                  selectedVariant?.key === v.key
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:border-primary/50 active:bg-muted/50 text-foreground"
                )}
              >
                {shortStorageLabel(v)}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes && sizes.length > 0 && (
        <div className="space-y-1.5 sm:space-y-1">
          <p className="text-[10px] sm:text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
            Size
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-1">
            {sizes.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => onSelectSize(s)}
                className={cn(
                  touchBtn,
                  "min-h-[40px] sm:min-h-0 px-2.5 py-2 sm:py-1 rounded-lg sm:rounded-md text-[11px] font-semibold border",
                  selectedSize?.name === s.name
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:border-primary/50 active:bg-muted/50"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {showColors && colors && (
        <div className="space-y-1.5 sm:space-y-1">
          <p className="text-[10px] sm:text-[9px] uppercase tracking-wider text-muted-foreground font-medium leading-snug">
            Color
            {selectedColor ? (
              <span className="block sm:inline sm:ml-1 normal-case tracking-normal text-foreground font-normal truncate">
                {selectedColor.name}
              </span>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-1.5 items-center">
            {colors.map((c) => {
              const disabled = isColorUnavailable(c.stock);
              return (
                <button
                  key={c.name}
                  type="button"
                  disabled={disabled}
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => onSelectColor(c)}
                  className={cn(
                    touchBtn,
                    "relative h-10 w-10 sm:h-7 sm:w-7 rounded-full border-2 overflow-hidden shrink-0",
                    disabled && "opacity-40 cursor-not-allowed",
                    selectedColor?.name === c.name
                      ? "border-primary ring-2 ring-primary/30 ring-offset-2 sm:ring-offset-1"
                      : "border-border hover:border-primary/60"
                  )}
                >
                  {c.image ? (
                    <img
                      src={resolveImageUrl(c.image)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 bg-muted" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-1">
        <p className="text-sm sm:text-xs font-semibold text-primary tabular-nums text-center sm:text-left">
          {formatMoney(resolvedPrice)}
        </p>
        <Button
          type="button"
          size="sm"
          className={cn(
            "w-full sm:w-auto h-11 sm:h-8 min-h-[44px] sm:min-h-0 text-sm sm:text-[11px] px-4",
            touchBtn
          )}
          onClick={onConfirm}
        >
          <ShoppingCart className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-1 shrink-0" />
          Add to cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCardInlineOptions;
