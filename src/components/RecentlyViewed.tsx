import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useCatalog } from "@/context/CatalogContext";
import { getRecentlyViewedIds } from "@/lib/recentlyViewed";
import ProductCard from "@/components/ProductCard";

const RecentlyViewed = () => {
  const { storefrontProducts, catalogTick } = useCatalog();

  const products = useMemo(() => {
    const ids = getRecentlyViewedIds();
    if (!ids.length) return [];
    const byId = new Map(storefrontProducts.map((p) => [p.id, p]));
    return ids.map((id) => byId.get(id)).filter(Boolean).slice(0, 8);
  }, [storefrontProducts, catalogTick]);

  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 border-t">
      <h2 className="text-elegant text-xl sm:text-2xl mb-4 sm:mb-6 px-4 sm:px-0">Recently viewed</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 px-4 sm:px-0 scrollbar-hide">
        {products.map((product) => (
          <div key={product!.id} className="flex-none w-[200px] sm:w-[220px]">
            <ProductCard
              id={product!.id}
              name={product!.name}
              title={product!.title}
              price={product!.displayPrice}
              compareAtPrice={product!.compareAtPrice}
              image={product!.image}
              images={product!.images}
              rating={product!.rating}
              category={product!.category}
              colors={product!.colors}
              variants={product!.variants}
              sizes={product!.sizes}
              isPreorder={product!.isPreorder}
              showPreorderPrice={product!.showPreorderPrice}
              stockQuantity={product!.stockQuantity}
              surface="carousel"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
