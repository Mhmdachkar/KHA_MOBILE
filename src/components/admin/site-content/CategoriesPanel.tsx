import { Link } from "react-router-dom";
import { ChevronRight, ExternalLink, Plus, Trash2 } from "lucide-react";
import { getCategoryProductCount } from "@/lib/adminCatalogSummary";
import {
  resolveHomepageCategoryLabel,
  SUGGESTED_CATEGORY_LINKS,
} from "@/lib/adminCatalogTaxonomy";
import { CANONICAL_STOREFRONT_CATEGORIES } from "@/lib/storefrontCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SectionCard, SaveBar } from "./shared";
import type { SiteContentPanelProps } from "./types";

export function CategoriesPanel({
  categories,
  setCategories,
  saving,
  saveSetting,
  catalogSummary,
  catalogLoading,
}: SiteContentPanelProps) {
  if (catalogLoading && !catalogSummary) {
    return (
      <div className="space-y-4 py-8 text-center text-sm text-muted-foreground">
        Loading catalog for category counts…
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      <SectionCard title="Homepage Categories">
        <p className="text-xs text-muted-foreground mb-4">
          Control which categories appear on the homepage Shop by Category grid.
        </p>
        <div className="space-y-2">
          {categories.map((cat, i) => {
            const canonical = resolveHomepageCategoryLabel(cat.name, cat.linkTo);
            const productCount = catalogSummary
              ? getCategoryProductCount(catalogSummary, cat.name, cat.linkTo)
              : 0;
            const isCanonical = CANONICAL_STOREFRONT_CATEGORIES.includes(
              cat.name as (typeof CANONICAL_STOREFRONT_CATEGORIES)[number]
            );
            return (
              <div key={i} className="flex flex-col gap-2 rounded-xl border p-3 bg-muted/20 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5 text-center shrink-0 hidden sm:block">
                    {i + 1}
                  </span>
                  <div className="flex-1 grid gap-2 grid-cols-1 sm:grid-cols-3 min-w-0">
                    <div className="space-y-1 min-w-0">
                      <select
                        value={isCanonical ? cat.name : "__custom__"}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "__custom__") return;
                          const link =
                            SUGGESTED_CATEGORY_LINKS.find((l) => l.label === v)?.path ?? cat.linkTo;
                          setCategories((prev) =>
                            prev.map((c, j) => (j === i ? { ...c, name: v, linkTo: link } : c))
                          );
                        }}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="__custom__">Custom name…</option>
                        {CANONICAL_STOREFRONT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {!isCanonical && (
                        <Input
                          value={cat.name}
                          onChange={(e) =>
                            setCategories((prev) =>
                              prev.map((c, j) => (j === i ? { ...c, name: e.target.value } : c))
                            )
                          }
                          placeholder="Category Name"
                          className="text-sm"
                        />
                      )}
                    </div>
                    <select
                      value={
                        SUGGESTED_CATEGORY_LINKS.some((l) => l.path === cat.linkTo)
                          ? cat.linkTo
                          : "__custom_link__"
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "__custom_link__") return;
                        setCategories((prev) =>
                          prev.map((c, j) => (j === i ? { ...c, linkTo: v } : c))
                        );
                      }}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="__custom_link__">Custom link…</option>
                      {SUGGESTED_CATEGORY_LINKS.map((l) => (
                        <option key={l.path} value={l.path}>
                          {l.label} → {l.path}
                        </option>
                      ))}
                    </select>
                    {!SUGGESTED_CATEGORY_LINKS.some((l) => l.path === cat.linkTo) && (
                      <Input
                        value={cat.linkTo}
                        onChange={(e) =>
                          setCategories((prev) =>
                            prev.map((c, j) => (j === i ? { ...c, linkTo: e.target.value } : c))
                          )
                        }
                        placeholder="Link (e.g. /smartphones)"
                        className="text-sm"
                      />
                    )}
                    <Input
                      value={cat.icon}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((c, j) => (j === i ? { ...c, icon: e.target.value } : c))
                        )
                      }
                      placeholder="Icon name"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={cat.enabled}
                      onCheckedChange={(v) =>
                        setCategories((prev) =>
                          prev.map((c, j) => (j === i ? { ...c, enabled: v } : c))
                        )
                      }
                    />
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() => {
                          if (i === 0) return;
                          setCategories((prev) => {
                            const next = [...prev];
                            [next[i - 1], next[i]] = [next[i], next[i - 1]];
                            return next;
                          });
                        }}
                        className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronRight className="h-3 w-3 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        disabled={i === categories.length - 1}
                        onClick={() => {
                          if (i === categories.length - 1) return;
                          setCategories((prev) => {
                            const next = [...prev];
                            [next[i], next[i + 1]] = [next[i + 1], next[i]];
                            return next;
                          });
                        }}
                        className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <ChevronRight className="h-3 w-3 rotate-90" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCategories((prev) => prev.filter((_, j) => j !== i))}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">
                    {productCount} products · maps to {canonical}
                  </Badge>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs gap-1" asChild>
                    <Link to="/admin/catalog">
                      <ExternalLink className="h-3 w-3" />
                      Catalog
                    </Link>
                  </Button>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                    <Link to={`/admin/products?category=${encodeURIComponent(canonical)}`}>
                      Manage products
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCategories((prev) => [
                ...prev,
                { name: "", icon: "Smartphone", linkTo: "/", enabled: true },
              ])
            }
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Category
          </Button>
        </div>
      </SectionCard>
      <SaveBar
        label="Save Categories"
        disabled={saving}
        onClick={() => void saveSetting("homepage_categories", categories)}
      />
    </div>
  );
}
