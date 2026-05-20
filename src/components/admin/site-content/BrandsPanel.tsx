import { Link } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { resolveImageUrl } from "@/lib/imageUtils";
import { getBrandProductCount } from "@/lib/adminCatalogSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SectionCard, SaveBar } from "./shared";
import type { SiteContentPanelProps } from "./types";

export function BrandsPanel({
  brands,
  setBrands,
  saving,
  saveSetting,
  catalogSummary,
  catalogLoading,
  catalogBrands,
}: SiteContentPanelProps) {
  if (catalogLoading && !catalogSummary) {
    return (
      <div className="space-y-4 py-8 text-center text-sm text-muted-foreground">
        Loading catalog for brand counts…
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      <SectionCard title="Shop by Brand">
        <p className="text-xs text-muted-foreground mb-4">
          Configure brands in the Shop by Brand section. Leave empty to auto-detect from catalog.
        </p>
        {catalogBrands.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Select
              onValueChange={(name) => {
                if (!name || brands.some((b) => b.name === name)) return;
                setBrands((prev) => [
                  ...prev,
                  {
                    name,
                    logoUrl: "",
                    link: `/products?brand=${encodeURIComponent(name)}`,
                    featured: true,
                  },
                ]);
              }}
            >
              <SelectTrigger className="w-full sm:max-w-xs text-sm">
                <SelectValue placeholder="Add brand from catalog…" />
              </SelectTrigger>
              <SelectContent>
                {catalogBrands
                  .filter((b) => !brands.some((row) => row.name === b))
                  .map((b) => (
                    <SelectItem key={b} value={b}>
                      {b} ({catalogSummary ? getBrandProductCount(catalogSummary, b) : 0} products)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-3">
          {brands.map((brand, i) => {
            const productCount = catalogSummary
              ? getBrandProductCount(catalogSummary, brand.name)
              : 0;
            return (
              <div key={i} className="flex flex-col gap-2 rounded-xl border p-3 bg-muted/20 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {brand.logoUrl && (
                    <img
                      src={resolveImageUrl(brand.logoUrl)}
                      alt={brand.name}
                      className="h-8 w-8 rounded object-cover border shrink-0"
                    />
                  )}
                  <div className="flex-1 grid gap-2 grid-cols-1 sm:grid-cols-3 min-w-0">
                    <Input
                      value={brand.name}
                      onChange={(e) =>
                        setBrands((prev) => prev.map((b, j) => (j === i ? { ...b, name: e.target.value } : b)))
                      }
                      placeholder="Brand Name"
                      className="text-sm"
                    />
                    <Input
                      value={brand.logoUrl}
                      onChange={(e) =>
                        setBrands((prev) => prev.map((b, j) => (j === i ? { ...b, logoUrl: e.target.value } : b)))
                      }
                      placeholder="Logo URL"
                      className="text-sm"
                    />
                    <Input
                      value={brand.link}
                      onChange={(e) =>
                        setBrands((prev) => prev.map((b, j) => (j === i ? { ...b, link: e.target.value } : b)))
                      }
                      placeholder="Link"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={brand.featured}
                      onCheckedChange={(v) =>
                        setBrands((prev) => prev.map((b, j) => (j === i ? { ...b, featured: v } : b)))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setBrands((prev) => prev.filter((_, j) => j !== i))}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {brand.name.trim() && (
                    <Badge
                      variant={productCount > 0 ? "secondary" : "outline"}
                      className={cn(
                        "text-[10px]",
                        productCount === 0 && "border-amber-500/40 text-amber-800 dark:text-amber-300"
                      )}
                    >
                      {productCount > 0
                        ? `${productCount} products on storefront`
                        : "No products on storefront"}
                    </Badge>
                  )}
                  {brand.name.trim() && productCount > 0 && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                      <Link to={`/admin/products?brand=${encodeURIComponent(brand.name.trim())}`}>
                        Manage products
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setBrands((prev) => [...prev, { name: "", logoUrl: "", link: "", featured: true }])
            }
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Brand
          </Button>
        </div>
      </SectionCard>
      <SaveBar label="Save Brands" disabled={saving} onClick={() => void saveSetting("brand_showcase", brands)} />
    </div>
  );
}
