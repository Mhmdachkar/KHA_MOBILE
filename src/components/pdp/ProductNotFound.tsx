import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import type { StorefrontProduct } from "@/lib/catalogProduct";

interface ProductNotFoundProps {
  suggestions?: StorefrontProduct[];
}

export function ProductNotFound({ suggestions = [] }: ProductNotFoundProps) {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="container mx-auto px-4 sm:px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">Product not found</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
          This item may have been removed or the link is incorrect.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Link to="/products">
            <Button>Browse all products</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
        {suggestions.length > 0 && (
          <div className="text-left max-w-4xl mx-auto">
            <h3 className="text-lg font-medium mb-4 text-center">You might like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {suggestions.slice(0, 4).map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  title={p.title}
                  price={p.displayPrice}
                  compareAtPrice={p.compareAtPrice}
                  image={p.image}
                  images={p.images || [p.image]}
                  rating={p.rating}
                  category={p.category}
                  stockQuantity={p.stockQuantity}
                  surface="grid"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
