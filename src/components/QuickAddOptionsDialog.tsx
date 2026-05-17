import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { resolveImageUrl } from "@/lib/imageUtils";
import { formatMoney } from "@/lib/storefrontPricing";
import { normalizeStorefrontVariants } from "@/lib/catalogProduct";
import {
  getPickerSteps,
  type PickerStep,
  type SizeOption,
} from "@/lib/addToCartPolicy";
import { cn } from "@/lib/utils";

export interface QuickAddVariant {
  key: string;
  label: string;
  price: number;
  ram?: string;
  storage?: string;
}

export interface QuickAddColor {
  name: string;
  image?: string;
  stock?: string;
}

export interface QuickAddSelection {
  variant: QuickAddVariant | null;
  size: SizeOption | null;
  color: QuickAddColor | null;
}

export interface QuickAddOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productImage: string;
  baseDisplayPrice: number;
  variants?: QuickAddVariant[];
  sizes?: SizeOption[];
  colors?: QuickAddColor[];
  onConfirm: (selection: QuickAddSelection) => void;
}

const STEP_LABELS: Record<PickerStep, string> = {
  variant: "Storage & configuration",
  size: "Size",
  color: "Color",
};

function isColorOutOfStock(stock?: string): boolean {
  if (!stock) return false;
  const s = stock.toLowerCase();
  return s === "out" || s === "out_of_stock" || s === "unavailable";
}

function QuickAddOptionsBody({
  open,
  productName,
  productImage,
  baseDisplayPrice,
  variants,
  sizes,
  colors,
  onConfirm,
  onClose,
}: Omit<QuickAddOptionsDialogProps, "onOpenChange"> & { onClose: () => void }) {
  const normalizedVariants = useMemo(
    () => normalizeStorefrontVariants(variants) ?? [],
    [variants]
  );

  const productShape = useMemo(
    () => ({
      id: 0,
      variants: normalizedVariants.length ? normalizedVariants : undefined,
      sizes,
      colors,
    }),
    [normalizedVariants, sizes, colors]
  );

  const steps = useMemo(() => getPickerSteps(productShape), [productShape]);
  const [stepIndex, setStepIndex] = useState(0);
  const [pickedVariant, setPickedVariant] = useState<QuickAddVariant | null>(null);
  const [pickedSize, setPickedSize] = useState<SizeOption | null>(null);
  const [pickedColor, setPickedColor] = useState<QuickAddColor | null>(null);

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
    setPickedVariant(null);
    setPickedSize(null);
    setPickedColor(null);
  }, [productName, open]);

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex >= steps.length - 1;
  const totalSteps = steps.length;

  const resolvedPrice =
    pickedSize?.price != null && pickedSize.price !== ""
      ? Number(pickedSize.price)
      : pickedVariant?.price ?? baseDisplayPrice;

  const canContinue = (() => {
    if (!currentStep) return false;
    if (currentStep === "variant") return pickedVariant != null;
    if (currentStep === "size") return pickedSize != null;
    if (currentStep === "color") return pickedColor != null;
    return false;
  })();

  const handleContinue = () => {
    if (!canContinue) return;
    if (isLastStep) {
      onConfirm({
        variant: pickedVariant,
        size: pickedSize,
        color: pickedColor,
      });
      onClose();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      onClose();
      return;
    }
    setStepIndex((i) => i - 1);
  };

  if (steps.length === 0) return null;

  const summaryParts = [
    pickedVariant?.label,
    pickedSize?.name,
    pickedColor?.name,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-center border-b border-border pb-3">
        <img
          src={resolveImageUrl(productImage)}
          alt=""
          className="h-14 w-14 rounded-md border object-contain bg-white shrink-0"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold line-clamp-2">{productName}</p>
          <p className="text-sm text-primary font-medium mt-0.5">{formatMoney(resolvedPrice)}</p>
          {totalSteps > 1 && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Step {stepIndex + 1} of {totalSteps} — {STEP_LABELS[currentStep!]}
            </p>
          )}
        </div>
      </div>

      {currentStep && (
        <>
          <h3 className="text-sm font-semibold">{STEP_LABELS[currentStep]}</h3>
          <div className="space-y-2 max-h-[min(50vh,320px)] overflow-y-auto pr-1">
            {currentStep === "variant" &&
              normalizedVariants.map((variant) => (
                <button
                  key={variant.key}
                  type="button"
                  onClick={() => setPickedVariant(variant)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border flex justify-between items-center gap-3 transition-colors",
                    pickedVariant?.key === variant.key
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  )}
                >
                  <span className="text-sm font-medium">{variant.label}</span>
                  <span className="text-sm text-primary shrink-0">{formatMoney(variant.price)}</span>
                </button>
              ))}
            {currentStep === "size" &&
              sizes?.map((size) => (
                <button
                  key={size.name}
                  type="button"
                  onClick={() => setPickedSize(size)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border flex justify-between items-center gap-3 transition-colors",
                    pickedSize?.name === size.name
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  )}
                >
                  <span className="text-sm font-medium">{size.name}</span>
                  {size.price != null && size.price !== "" && (
                    <span className="text-sm text-primary shrink-0">{formatMoney(size.price)}</span>
                  )}
                </button>
              ))}
            {currentStep === "color" &&
              colors?.map((color) => {
                const disabled = isColorOutOfStock(color.stock);
                return (
                  <button
                    key={color.name}
                    type="button"
                    disabled={disabled}
                    onClick={() => setPickedColor(color)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg border flex items-center gap-3 transition-colors",
                      disabled && "opacity-50 cursor-not-allowed",
                      pickedColor?.name === color.name
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    {color.image ? (
                      <img
                        src={resolveImageUrl(color.image)}
                        alt=""
                        className="h-10 w-10 rounded-md object-contain border bg-white shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md border bg-muted shrink-0" />
                    )}
                    <span className="text-sm font-medium">{color.name}</span>
                  </button>
                );
              })}
          </div>
        </>
      )}

      {summaryParts.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Selected: {summaryParts.join(" · ")}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {stepIndex === 0 ? "Cancel" : "Back"}
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          {isLastStep ? (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to cart
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}

export function QuickAddOptionsDialog({
  open,
  onOpenChange,
  ...bodyProps
}: QuickAddOptionsDialogProps) {
  const isMobile = useIsMobile();
  const onClose = () => onOpenChange(false);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
          <SheetHeader className="text-left mb-2">
            <SheetTitle>Choose options</SheetTitle>
            <SheetDescription>Select configuration before adding to cart.</SheetDescription>
          </SheetHeader>
          <QuickAddOptionsBody open={open} {...bodyProps} onClose={onClose} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose options</DialogTitle>
          <DialogDescription>Select configuration before adding to cart.</DialogDescription>
        </DialogHeader>
        <QuickAddOptionsBody open={open} {...bodyProps} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
