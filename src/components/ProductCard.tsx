import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { resolveImageUrl } from "@/lib/imageUtils";
import { formatMoney, getCardPricePresentation } from "@/lib/storefrontPricing";
import { normalizeStorefrontVariants } from "@/lib/catalogProduct";
import {
  getAddToCartAction,
  showsInlineCardOptions,
  isCardSelectionComplete,
  hasMultipleColors,
  type AddToCartSurface,
  type SizeOption,
  type ColorOption,
} from "@/lib/addToCartPolicy";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import ProductCardInlineOptions from "@/components/ProductCardInlineOptions";
import {
  QuickAddOptionsDialog,
  type QuickAddSelection,
} from "@/components/QuickAddOptionsDialog";

interface ProductVariant {
  key: string;
  label: string;
  price: number;
  ram?: string;
  storage?: string;
  description?: string;
}

interface ProductCardProps {
  id: number;
  name: string;
  title?: string;
  price: number | string;
  compareAtPrice?: number | null;
  image: string;
  images?: string[];
  rating?: number;
  category?: string;
  colors?: ColorOption[];
  variants?: ProductVariant[];
  sizes?: SizeOption[];
  isPreorder?: boolean;
  showPreorderPrice?: boolean;
  stockQuantity?: number | null;
  surface?: AddToCartSurface;
}

const ProductCard = ({
  id,
  name,
  title,
  price,
  compareAtPrice,
  image,
  images,
  rating = 4.5,
  category,
  colors,
  variants,
  sizes,
  isPreorder = false,
  showPreorderPrice = true,
  stockQuantity = null,
  surface = "grid",
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const favorite = isFavorite(id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const normalizedVariants = useMemo(
    () => normalizeStorefrontVariants(variants) ?? [],
    [variants]
  );

  const productShape = useMemo(
    () => ({
      id,
      variants: normalizedVariants.length ? normalizedVariants : undefined,
      sizes,
      colors,
      isPreorder,
      showPreorderPrice,
      stockQuantity,
    }),
    [id, normalizedVariants, sizes, colors, isPreorder, showPreorderPrice, stockQuantity]
  );

  const inlineOptions = showsInlineCardOptions(productShape, surface);

  const [pickedVariant, setPickedVariant] = useState<ProductVariant | null>(null);
  const [pickedSize, setPickedSize] = useState<SizeOption | null>(null);
  const [pickedColor, setPickedColor] = useState<ColorOption | null>(null);

  useEffect(() => {
    setOptionsExpanded(false);
    setPickedVariant(null);
    setPickedSize(null);
    setPickedColor(null);
  }, [id]);

  useEffect(() => {
    if (!optionsExpanded || !cardRef.current) return;
    const isNarrow = window.matchMedia("(max-width: 767px)").matches;
    if (!isNarrow) return;
    const t = window.setTimeout(() => {
      cardRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 120);
    return () => window.clearTimeout(t);
  }, [optionsExpanded]);

  const initDefaultSelections = () => {
    setPickedVariant(normalizedVariants[0] ?? null);
    setPickedSize(sizes?.[0] ?? null);
    setPickedColor(
      colors?.length === 1
        ? colors[0]
        : hasMultipleColors(colors)
          ? colors![0]
          : null
    );
  };

  const selectionPrice = useMemo(() => {
    if (pickedSize?.price != null && pickedSize.price !== "") {
      return Number(pickedSize.price);
    }
    if (pickedVariant?.price != null) return pickedVariant.price;
    return null;
  }, [pickedSize, pickedVariant]);

  const priceInput = {
    price: selectionPrice ?? price,
    compareAtPrice,
    variants: normalizedVariants.length ? normalizedVariants : undefined,
    sizes,
  };
  const cardPricing = getCardPricePresentation(priceInput);
  const preorderHideNumeric =
    Boolean(isPreorder) && (!showPreorderPrice || cardPricing.displayPrice === 0);

  const heroImageSource = useMemo(() => {
    if (optionsExpanded && pickedColor?.image) return resolveImageUrl(pickedColor.image);
    return resolveImageUrl(image);
  }, [optionsExpanded, pickedColor, image]);

  const productImages = (images && images.length > 0 ? images : [image]).map(resolveImageUrl);
  const hasMultipleImages = productImages.length > 1;
  const defaultImage = heroImageSource || productImages[0];
  const hoverImage = hasMultipleImages ? productImages[1] : defaultImage;
  const [currentImage, setCurrentImage] = useState(defaultImage);

  useEffect(() => {
    setCurrentImage(defaultImage);
  }, [defaultImage, id]);

  const imageFitClass = "object-contain p-3 sm:p-4 md:p-5";

  const finalizeAddToCart = (selection: QuickAddSelection) => {
    const { variant, size, color } = selection;
    const unitPrice =
      size?.price != null && size.price !== ""
        ? Number(size.price)
        : variant?.price ?? cardPricing.displayPrice;
    const colorImage = resolveImageUrl(color?.image) || defaultImage;

    addToCart({
      id,
      name,
      price: unitPrice,
      image: colorImage,
      rating,
      category,
      quantity: 1,
      variantKey: variant?.key,
      variantLabel: variant?.label,
      color: color?.name,
      colorImage,
      size: size?.name,
      sizePrice: size?.price != null ? Number(size.price) : undefined,
      isPreorder,
    });
    toast({ title: "Added to cart", description: name });
    setOptionsExpanded(false);
  };

  const handleConfirmOptions = () => {
    const selection = {
      variant: pickedVariant,
      size: pickedSize,
      color: pickedColor,
    };
    if (!isCardSelectionComplete(productShape, selection)) {
      toast({
        variant: "destructive",
        title: "Choose your options",
        description: "Select storage and color before adding to cart.",
      });
      return;
    }
    finalizeAddToCart(selection);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const action = getAddToCartAction(productShape, surface);
    if (action.type === "blocked") {
      toast({ variant: "destructive", title: action.reason });
      return;
    }
    if (action.type === "redirect_pdp") {
      navigate(`/product/${id}`);
      return;
    }

    if (inlineOptions) {
      if (!optionsExpanded) {
        initDefaultSelections();
        setOptionsExpanded(true);
      }
      return;
    }

    if (action.type === "open_picker") {
      setPickerOpen(true);
      return;
    }

    const singleColor =
      colors?.length === 1 ? { name: colors[0].name, image: colors[0].image } : null;
    finalizeAddToCart({ variant: null, size: null, color: singleColor });
  };

  const handleColorSelect = (c: ColorOption) => {
    setPickedColor(c);
    if (c.image) setCurrentImage(resolveImageUrl(c.image));
  };

  const handleMouseEnter = () => {
    if (optionsExpanded && pickedColor?.image) return;
    if (hasMultipleImages && window.matchMedia("(hover: hover)").matches) {
      setCurrentImage(hoverImage);
    }
  };

  const handleMouseLeave = () => {
    if (optionsExpanded && pickedColor?.image) {
      setCurrentImage(resolveImageUrl(pickedColor.image));
      return;
    }
    if (hasMultipleImages && window.matchMedia("(hover: hover)").matches) {
      setCurrentImage(defaultImage);
    }
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        whileHover={
          window.matchMedia("(hover: hover)").matches && !optionsExpanded ? { y: -8 } : undefined
        }
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: optionsExpanded ? "auto" : "transform" }}
        className={cn(
          "group relative bg-white rounded-sm border transition-all duration-300 shadow-card flex flex-col",
          optionsExpanded
            ? "z-20 border-primary ring-2 ring-primary/25 shadow-lg overflow-visible"
            : "z-0 overflow-hidden border-border hover:border-primary/40 hover:shadow-elegant"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link to={`/product/${id}`} className="block flex-1 min-h-0">
          <motion.div className="aspect-square overflow-hidden bg-white relative border-b border-border">
            <motion.img
              key={`${id}-${currentImage}`}
              src={currentImage}
              alt={name}
              className={`absolute inset-0 h-full w-full ${imageFitClass}`}
              loading="lazy"
            />
            {isPreorder && (
              <div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-sm border border-white/20 tracking-wider">
                PREORDER
              </div>
            )}
          </motion.div>
          <div className="p-2 sm:p-3 md:p-4">
            {category && (
              <p className="text-elegant text-[9px] sm:text-[10px] text-primary mb-0.5 sm:mb-1 line-clamp-1">
                {category}
              </p>
            )}
            <h3 className="text-elegant text-[10px] sm:text-xs mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight sm:leading-normal">
              {title || name}
            </h3>
            <div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-border"}`}
                />
              ))}
              <span className="text-[9px] sm:text-[10px] text-muted-foreground ml-0.5 sm:ml-1">
                ({rating})
              </span>
            </div>
            {(!inlineOptions || !optionsExpanded) && (
              <>
                {preorderHideNumeric ? (
                  <p className="text-elegant text-xs sm:text-sm font-normal text-primary">Pre-order</p>
                ) : cardPricing.showDiscount && cardPricing.compareAtPrice != null ? (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground line-through">
                        {formatMoney(cardPricing.compareAtPrice)}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-1.5 py-0">
                        {cardPricing.discountPercent}% OFF
                      </span>
                    </div>
                    <p className="text-elegant text-xs sm:text-sm font-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {cardPricing.priceLabel}
                    </p>
                  </div>
                ) : (
                  <p className="text-elegant text-xs sm:text-sm font-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {cardPricing.priceLabel}
                  </p>
                )}
                {inlineOptions && !optionsExpanded && (colors?.length ?? 0) > 0 && (
                  <p className="text-[10px] sm:text-[10px] text-muted-foreground mt-1 leading-snug">
                    Tap <span className="text-primary font-medium">cart</span> to choose storage
                    {hasMultipleColors(colors) ? " & color" : ""}
                  </p>
                )}
                {!inlineOptions && colors && colors.length > 0 && !hasMultipleColors(colors) && (
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                    {colors.length} color{colors.length > 1 ? "s" : ""} available
                  </p>
                )}
              </>
            )}
          </div>
        </Link>

        <AnimatePresence>
          {inlineOptions && optionsExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <ProductCardInlineOptions
                variants={normalizedVariants}
                sizes={sizes}
                colors={colors}
                selectedVariant={pickedVariant}
                selectedSize={pickedSize}
                selectedColor={pickedColor}
                onSelectVariant={setPickedVariant}
                onSelectSize={setPickedSize}
                onSelectColor={handleColorSelect}
                displayPrice={cardPricing.displayPrice}
                onConfirm={handleConfirmOptions}
                onCancel={() => setOptionsExpanded(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={cn(
            "absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-3 md:right-3 flex flex-col gap-1.5 sm:gap-1.5 transition-opacity duration-300 z-30",
            optionsExpanded ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite({ id, name, price: cardPricing.displayPrice, image, rating, category });
            }}
            className={cn(
              "h-10 w-10 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full glassmorphism border flex items-center justify-center bg-background/90 shadow-sm touch-manipulation active:scale-95",
              favorite ? "bg-primary text-primary-foreground border-primary" : "border-border/50"
            )}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4", favorite && "fill-white")} />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={stockQuantity === 0}
            className={cn(
              "h-10 w-10 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full glassmorphism border flex items-center justify-center bg-background/90 shadow-sm touch-manipulation active:scale-95 disabled:opacity-40",
              optionsExpanded
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/50 hover:bg-accent"
            )}
            aria-label={optionsExpanded ? "Options open" : "Choose options"}
          >
            <ShoppingCart className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
          </button>
        </div>
      </motion.div>

      {!inlineOptions && (
        <QuickAddOptionsDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          productName={title || name}
          productImage={image}
          baseDisplayPrice={cardPricing.displayPrice}
          variants={normalizedVariants}
          sizes={sizes}
          colors={colors}
          onConfirm={finalizeAddToCart}
        />
      )}
    </>
  );
};

export default ProductCard;
