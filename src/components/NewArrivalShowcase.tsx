import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Flame, ArrowRight, Star, Clock, ShoppingCart } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useCatalog } from "@/context/CatalogContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { formatMoney, getCardPricePresentation } from "@/lib/storefrontPricing";
import { resolveProductImage } from "@/lib/imageUtils";
import type { StorefrontProduct } from "@/lib/catalogProduct";

// ─── Countdown timer hook ────────────────────────────────────────────────────
function useCountdown(targetHours = 24) {
  const getTarget = () => {
    const key = "hot_deals_end";
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const t = parseInt(stored, 10);
      if (t > Date.now()) return t;
    }
    const t = Date.now() + targetHours * 60 * 60 * 1000;
    sessionStorage.setItem(key, String(t));
    return t;
  };

  const [target] = useState(() => getTarget());
  const [remaining, setRemaining] = useState(target - Date.now());

  useEffect(() => {
    const tick = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(tick);
  }, [target]);

  const clamp = Math.max(0, remaining);
  const h = Math.floor(clamp / 3_600_000);
  const m = Math.floor((clamp % 3_600_000) / 60_000);
  const s = Math.floor((clamp % 60_000) / 1_000);
  return { h, m, s };
}

// ─── Single deal card ────────────────────────────────────────────────────────
const DealCard = ({ product, index }: { product: StorefrontProduct; index: number }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const pricing = getCardPricePresentation(product);
  const hasDiscount = pricing.showDiscount && pricing.compareAtPrice != null;
  const discountPct = pricing.discountPercent;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: pricing.displayPrice,
      image: product.image,
      quantity: 1,
    });
    toast({ title: "Added to cart", description: product.name, duration: 2000 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="flex-none w-[200px] sm:w-[220px] md:w-[240px] snap-start"
    >
      <Link to={`/product/${product.id}`} className="group block bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square bg-muted/30 overflow-hidden">
          <img
            src={resolveProductImage(product.image, product.images)}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {hasDiscount && discountPct != null && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              -{discountPct}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-[11px] sm:text-xs font-semibold leading-snug line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] text-muted-foreground">{product.rating?.toFixed(1) ?? "4.8"}</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            <span className="text-sm font-bold text-primary">
              {formatMoney(pricing.displayPrice)}
            </span>
            {hasDiscount && pricing.compareAtPrice != null && (
              <span className="text-[10px] text-muted-foreground line-through">
                {formatMoney(pricing.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary text-xs font-semibold py-2 rounded-xl transition-all duration-200 touch-manipulation active:scale-[0.97]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── Time digit box ──────────────────────────────────────────────────────────
const TimeBox = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-zinc-900 text-white rounded-lg px-2.5 sm:px-3.5 py-1.5 sm:py-2 min-w-[40px] sm:min-w-[48px] text-center">
      <span className="text-base sm:text-xl font-bold tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
    </div>
    <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{label}</span>
  </div>
);

// ─── Main section ────────────────────────────────────────────────────────────
const NewArrivalShowcase = () => {
  const { storefrontProducts } = useCatalog();
  const { h, m, s } = useCountdown(24);

  // Pick products: prefer products with a compareAtPrice (real discounts), fill with top rated
  const dealProducts = useMemo((): StorefrontProduct[] => {
    const all = storefrontProducts;
    const discounted = all.filter(
      (p) => p.compareAtPrice != null && p.compareAtPrice > (p.displayPrice ?? p.price)
    );
    const topRated = all
      .filter((p) => !discounted.find((d) => d.id === p.id))
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return [...discounted, ...topRated].slice(0, 10);
  }, [storefrontProducts]);

  if (dealProducts.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 md:py-20 bg-background w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-full">

        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-5 w-5 text-red-500 fill-red-500" />
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Hot Deals</span>
            </div>
            <h2 className="text-elegant text-2xl sm:text-3xl font-bold">Today's Best Prices</h2>
            <p className="text-muted-foreground text-sm mt-1">Handpicked savings — updated daily</p>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Deals end in</span>
            </div>
            <div className="flex items-end gap-1.5">
              <TimeBox value={h} label="hrs" />
              <span className="text-zinc-400 font-bold mb-3.5 text-sm">:</span>
              <TimeBox value={m} label="min" />
              <span className="text-zinc-400 font-bold mb-3.5 text-sm">:</span>
              <TimeBox value={s} label="sec" />
            </div>
          </div>
        </motion.div>

        {/* Scrollable deal cards */}
        <div
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {dealProducts.map((product, i) => (
            <DealCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <Link to="/products">
            <Button variant="outline" className="rounded-xl px-8 group">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default NewArrivalShowcase;
