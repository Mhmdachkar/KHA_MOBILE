import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Star, X, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";
import { resolveImageUrl } from "@/lib/imageUtils";
import { formatMoney, getCardPricePresentation } from "@/lib/storefrontPricing";
import {
  getAddToCartAction,
  getPickerSteps,
  type AddToCartSurface,
  type SizeOption,
} from "@/lib/addToCartPolicy";
import { useToast } from "@/hooks/use-toast";

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
  colors?: Array<{ name: string; image?: string; stock?: string }>;
  variants?: ProductVariant[];
  sizes?: SizeOption[];
  isPreorder?: boolean;
  showPreorderPrice?: boolean;
  stockQuantity?: number | null;
  /** Where this card is rendered — controls redirect vs inline picker. */
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
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStep, setPickerStep] = useState(0);
  const [pickedVariant, setPickedVariant] = useState<ProductVariant | null>(null);
  const [pickedSize, setPickedSize] = useState<SizeOption | null>(null);
  const [pickedColor, setPickedColor] = useState<{ name: string; image?: string } | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const priceInput = {
    price,
    compareAtPrice,
    variants,
    sizes,
  };
  const cardPricing = getCardPricePresentation(priceInput);
  const preorderHideNumeric =
    Boolean(isPreorder) && (!showPreorderPrice || cardPricing.displayPrice === 0);

  const productShape = {
    id,
    variants,
    sizes,
    colors,
    isPreorder,
    showPreorderPrice,
    stockQuantity,
  };

  const imageFitClass = "object-contain p-3 sm:p-4 md:p-5";
  const productImages = (images && images.length > 0 ? images : [image]).map(resolveImageUrl);
  const hasMultipleImages = productImages.length > 1;
  const defaultImage = productImages[0];
  const hoverImage = hasMultipleImages ? productImages[1] : defaultImage;
  const [currentImage, setCurrentImage] = useState(defaultImage);

  useEffect(() => {
    setCurrentImage(defaultImage);
  }, [defaultImage, id]);

  const resetPicker = () => {
    setShowPicker(false);
    setPickerStep(0);
    setPickedVariant(null);
    setPickedSize(null);
    setPickedColor(null);
  };

  const finalizeAddToCart = (
    variant: ProductVariant | null,
    size: SizeOption | null,
    color: { name: string; image?: string } | null
  ) => {
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
    resetPicker();
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
    if (action.type === "open_picker") {
      setShowPicker(true);
      setPickerStep(0);
      return;
    }

    const singleColor =
      colors?.length === 1 ? { name: colors[0].name, image: colors[0].image } : null;
    finalizeAddToCart(null, null, singleColor);
  };

  const pickerSteps = getPickerSteps(productShape);
  const currentStepId = pickerSteps[pickerStep];

  const goNextOrAdd = (
    variant: ProductVariant | null,
    size: SizeOption | null,
    color: { name: string; image?: string } | null
  ) => {
    if (pickerStep < pickerSteps.length - 1) {
      setPickerStep((s) => s + 1);
    } else {
      finalizeAddToCart(variant, size, color);
    }
  };

  const handleMouseEnter = () => {
    if (hasMultipleImages && window.matchMedia("(hover: hover)").matches) {
      setCurrentImage(hoverImage);
    }
  };

  const handleMouseLeave = () => {
    if (hasMultipleImages && window.matchMedia("(hover: hover)").matches) {
      setCurrentImage(defaultImage);
    }
  };

  return (
    <motion.div
      whileHover={{ y: window.matchMedia("(hover: hover)").matches ? -8 : 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{ willChange: "transform" }}
      className="group relative bg-white rounded-sm overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 shadow-card hover:shadow-elegant"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/product/${id}`}>
        <motion.div className="aspect-square overflow-hidden bg-white relative border-b border-border">
          <motion.img
            key={`default-${id}`}
            src={defaultImage}
            alt={name}
            initial={{ opacity: 1 }}
            animate={{ opacity: currentImage === defaultImage ? 1 : 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className={`absolute inset-0 h-full w-full ${imageFitClass} will-change-[opacity]`}
            loading="lazy"
          />
          {hasMultipleImages && (
            <motion.img
              key={`hover-${id}`}
              src={hoverImage}
              alt={`${name} - Alternate view`}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentImage === hoverImage ? 1 : 0 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className={`absolute inset-0 h-full w-full ${imageFitClass} will-change-[opacity]`}
              loading="lazy"
            />
          )}
          {isPreorder && (
            <motion.div className="absolute top-2 left-2 z-10 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-sm border border-white/20 tracking-wider">
              PREORDER
            </motion.div>
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
          <motion.div className="flex items-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${i < Math.floor(rating) ? "fill-primary text-primary" : "text-border"}`}
              />
            ))}
            <span className="text-[9px] sm:text-[10px] text-muted-foreground ml-0.5 sm:ml-1">({rating})</span>
          </motion.div>
          {preorderHideNumeric ? (
            <p className="text-elegant text-xs sm:text-sm font-normal text-primary">Pre-order</p>
          ) : cardPricing.showDiscount && cardPricing.compareAtPrice != null ? (
            <div className="flex flex-col gap-0.5">
              <motion.div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                <span className="text-[9px] sm:text-[10px] text-muted-foreground line-through">
                  {formatMoney(cardPricing.compareAtPrice)}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-1.5 py-0">
                  {cardPricing.discountPercent}% OFF
                </span>
              </motion.div>
              <p className="text-elegant text-xs sm:text-sm font-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {cardPricing.priceLabel}
              </p>
            </div>
          ) : (
            <p className="text-elegant text-xs sm:text-sm font-normal bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {cardPricing.priceLabel}
            </p>
          )}
          {colors && colors.length > 0 && (
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
              {colors.length} color{colors.length > 1 ? "s" : ""} available
            </p>
          )}
        </div>
      </Link>

      <AnimatePresence>
        {showPicker && pickerSteps.length > 0 && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col rounded-sm border border-primary/20 shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
              <span className="text-elegant text-[10px] sm:text-xs font-semibold text-primary">
                {currentStepId === "variant"
                  ? "Select configuration"
                  : currentStepId === "size"
                    ? "Select size"
                    : "Select color"}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  resetPicker();
                }}
                className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2.5 pb-2.5 space-y-1.5">
              {currentStepId === "variant" &&
                variants?.map((variant) => (
                  <button
                    key={variant.key}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPickedVariant(variant);
                      goNextOrAdd(variant, pickedSize, pickedColor);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-sm border border-border hover:border-primary/50 hover:bg-primary/5 flex justify-between gap-2"
                  >
                    <span className="text-[11px] font-semibold truncate">{variant.label}</span>
                    <span className="text-[11px] text-primary">{formatMoney(variant.price)}</span>
                  </button>
                ))}
              {currentStepId === "size" &&
                sizes?.map((size) => (
                  <button
                    key={size.name}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPickedSize(size);
                      goNextOrAdd(pickedVariant, size, pickedColor);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-sm border border-border hover:border-primary/50 hover:bg-primary/5 flex justify-between gap-2"
                  >
                    <span className="text-[11px] font-semibold">{size.name}</span>
                    {size.price != null && size.price !== "" && (
                      <span className="text-[11px] text-primary">{formatMoney(size.price)}</span>
                    )}
                  </button>
                ))}
              {currentStepId === "color" &&
                colors?.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPickedColor(color);
                      goNextOrAdd(pickedVariant, pickedSize, color);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-sm border border-border hover:border-primary/50 hover:bg-primary/5"
                  >
                    <span className="text-[11px] font-semibold">{color.name}</span>
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 md:top-3 md:right-3 flex flex-col gap-1 sm:gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
        <motion.button
          whileHover={window.matchMedia("(hover: hover)").matches ? { scale: 1.1 } : undefined}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite({ id, name, price: cardPricing.displayPrice, image, rating, category });
          }}
          className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full glassmorphism border flex items-center justify-center bg-background/80 ${
            favorite ? "bg-primary text-primary-foreground border-primary" : "border-border/50"
          }`}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 ${favorite ? "fill-white" : ""}`} />
        </motion.button>
        <motion.button
          whileHover={window.matchMedia("(hover: hover)").matches ? { scale: 1.1 } : undefined}
          onClick={handleAddToCart}
          disabled={stockQuantity === 0}
          className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full glassmorphism border border-border/50 flex items-center justify-center hover:bg-accent bg-background/80 disabled:opacity-40"
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ProductCard;
