import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Tags,
  FolderTree,
  ChevronLeft,
  Pencil,
  ExternalLink,
  AlertTriangle,
  Package,
} from "lucide-react";
import { useAdminMergedCatalog } from "@/lib/useAdminMergedCatalog";
import {
  buildBrandGroups,
  buildCategoryGroups,
  filterAdminProductsByBrand,
  filterAdminProductsByCategory,
  getAdminProductBrand,
  matchesAdminProductSearch,
  searchBrandGroups,
  searchCategoryGroups,
  type AdminBrandGroup,
  type AdminCategoryGroup,
} from "@/lib/adminCatalogTaxonomy";
import type { AdminListProduct } from "@/lib/adminProductListMerge";
import { siteUrl } from "@/lib/adminApi";
import { resolveImageUrl } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TabId = "categories" | "brands";
type DrillDown =
  | { type: "category"; group: AdminCategoryGroup }
  | { type: "brand"; group: AdminBrandGroup }
  | null;

const TABS: { id: TabId; label: string; icon: typeof FolderTree }[] = [
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "brands", label: "Brands", icon: Tags },
];

function editHref(p: AdminListProduct): string {
  return p.dbId != null ? `/admin/products/${p.dbId}` : `/admin/products/new?override=${p.id}`;
}

function productsFilterHref(type: "category" | "brand", key: string): string {
  const param = type === "category" ? "category" : "brand";
  return `/admin/products?${param}=${encodeURIComponent(key)}`;
}

const SourceBadge = ({ source }: { source: AdminListProduct["source"] }) => {
  const label =
    source === "bundled" ? "Bundled" : source === "database" ? "DB" : "DB only";
  const cls =
    source === "bundled"
      ? "border-amber-500/40 text-amber-800 dark:text-amber-300"
      : source === "database"
        ? "border-sky-500/40 text-sky-800 dark:text-sky-300"
        : "border-orange-500/40 text-orange-800 dark:text-orange-300";
  return (
    <Badge variant="outline" className={cn("text-[10px] py-0", cls)}>
      {label}
    </Badge>
  );
};

const GroupCard = ({
  title,
  subtitle,
  total,
  badges,
  warning,
  onClick,
}: {
  title: string;
  subtitle?: string;
  total: number;
  badges: React.ReactNode;
  warning?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full text-left rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40 touch-manipulation",
      warning && "border-amber-500/40"
    )}
    style={{ touchAction: "manipulation" }}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="font-semibold truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      <span className="text-2xl font-bold tabular-nums shrink-0">{total}</span>
    </div>
    <div className="flex flex-wrap gap-1.5 mt-3">{badges}</div>
  </button>
);

const AdminCatalog = () => {
  const { products, loading, catalogError, storefrontCount, refresh } = useAdminMergedCatalog();
  const [tab, setTab] = useState<TabId>("categories");
  const [search, setSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [drillDown, setDrillDown] = useState<DrillDown>(null);

  const categoryGroups = useMemo(() => buildCategoryGroups(products), [products]);
  const brandGroups = useMemo(() => buildBrandGroups(products), [products]);

  const filteredCategories = useMemo(
    () => searchCategoryGroups(categoryGroups, search),
    [categoryGroups, search]
  );
  const filteredBrands = useMemo(
    () => searchBrandGroups(brandGroups, search),
    [brandGroups, search]
  );

  const drillProducts = useMemo(() => {
    if (!drillDown) return [];
    let list =
      drillDown.type === "category"
        ? filterAdminProductsByCategory(products, drillDown.group.canonical)
        : filterAdminProductsByBrand(products, drillDown.group.key);
    if (productSearch.trim()) {
      list = list.filter((p) => matchesAdminProductSearch(p, productSearch));
    }
    return list;
  }, [drillDown, products, productSearch]);

  const drillTitle =
    drillDown?.type === "category"
      ? drillDown.group.canonical
      : drillDown?.type === "brand"
        ? drillDown.group.displayName
        : "";

  const drillFilterKey =
    drillDown?.type === "category"
      ? drillDown.group.canonical
      : drillDown?.type === "brand"
        ? drillDown.group.key
        : "";

  if (drillDown) {
    return (
      <div className="space-y-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2"
            onClick={() => {
              setDrillDown(null);
              setProductSearch("");
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to {tab === "categories" ? "categories" : "brands"}
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{drillTitle}</h1>
            <p className="text-sm text-muted-foreground">
              {drillProducts.length} product{drillProducts.length !== 1 ? "s" : ""}
              {drillDown.type === "category" && !drillDown.group.isCanonical && (
                <span className="text-amber-700 dark:text-amber-400 ml-2 inline-flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Non-canonical labels in use
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" asChild>
              <Link to={productsFilterHref(drillDown.type, drillFilterKey)}>
                <Package className="h-3.5 w-3.5 mr-1.5" />
                All in Products
              </Link>
            </Button>
          </div>
        </div>

        {drillDown.type === "category" && drillDown.group.rawLabels.length > 1 && (
          <p className="text-xs text-muted-foreground rounded-lg border px-3 py-2 bg-muted/30">
            Raw labels: {drillDown.group.rawLabels.join(", ")}
          </p>
        )}

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products in this group…"
            className="pl-9"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
        </div>

        {drillProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center rounded-xl border">
            No products match your search.
          </p>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2.5 font-medium w-12" />
                    <th className="px-3 py-2.5 font-medium">Product</th>
                    <th className="px-3 py-2.5 font-medium hidden sm:table-cell">Brand</th>
                    <th className="px-3 py-2.5 font-medium hidden md:table-cell">Category</th>
                    <th className="px-3 py-2.5 font-medium">Status</th>
                    <th className="px-3 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drillProducts.map((p) => (
                    <tr key={p.dbId != null ? `db-${p.dbId}` : `s-${p.id}`} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <img
                          src={resolveImageUrl(p.image)}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover bg-muted"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-medium line-clamp-2">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground">#{p.id}</p>
                        <div className="mt-1 sm:hidden">
                          <SourceBadge source={p.source} />
                        </div>
                      </td>
                      <td className="px-3 py-2 hidden sm:table-cell text-muted-foreground">
                        {getAdminProductBrand(p)}
                      </td>
                      <td className="px-3 py-2 hidden md:table-cell">
                        <Badge variant="outline" className="text-[10px]">
                          {p.category}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1 items-start">
                          <Badge
                            variant={p.isActive ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {p.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="hidden sm:inline">
                            <SourceBadge source={p.source} />
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link to={editHref(p)} title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          {p.onStorefront && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a
                                href={`${siteUrl()}/product/${p.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View on site"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Catalog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Browse products by category or brand across the full storefront catalog.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 self-end sm:self-auto"
          onClick={() => refresh()}
          disabled={loading}
          title="Refresh catalog"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {catalogError && !loading && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
          Storefront warning: {catalogError}. Counts may reflect bundled catalog only.
        </p>
      )}

      {!loading && (
        <p className="text-sm text-muted-foreground">
          <strong>{products.length}</strong> products total
          {storefrontCount > 0 && (
            <> · <strong>{storefrontCount}</strong> on the live storefront</>
          )}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex rounded-lg border bg-muted/30 p-0.5 gap-0.5 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setSearch("");
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                tab === id ? "bg-background shadow text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              tab === "categories"
                ? "Search categories…"
                : "Search brands…"
            }
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : tab === "categories" ? (
        filteredCategories.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center rounded-xl border">
            No categories match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCategories.map((g) => (
              <GroupCard
                key={g.key}
                title={g.canonical}
                subtitle={
                  g.rawLabels.length > 1 || (g.rawLabels[0] && g.rawLabels[0] !== g.canonical)
                    ? `Also: ${g.rawLabels.filter((r) => r !== g.canonical).join(", ") || g.rawLabels[0]}`
                    : undefined
                }
                total={g.total}
                warning={!g.isCanonical}
                onClick={() => setDrillDown({ type: "category", group: g })}
                badges={
                  <>
                    {g.active > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {g.active} active
                      </Badge>
                    )}
                    {g.inactive > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        {g.inactive} inactive
                      </Badge>
                    )}
                    {g.bundled > 0 && (
                      <Badge variant="outline" className="text-[10px] border-amber-500/30">
                        {g.bundled} bundled
                      </Badge>
                    )}
                    {!g.isCanonical && (
                      <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-800 dark:text-amber-300">
                        Review labels
                      </Badge>
                    )}
                  </>
                }
              />
            ))}
          </div>
        )
      ) : filteredBrands.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center rounded-xl border">
          No brands match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBrands.map((g) => (
            <GroupCard
              key={g.key}
              title={g.displayName}
              subtitle={g.inferredOnly ? "Brand inferred from product name" : undefined}
              total={g.total}
              onClick={() => setDrillDown({ type: "brand", group: g })}
              badges={
                <>
                  {g.active > 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      {g.active} active
                    </Badge>
                  )}
                  {g.inferredOnly && g.displayName !== "Unbranded" && (
                    <Badge variant="outline" className="text-[10px]">
                      Inferred
                    </Badge>
                  )}
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCatalog;
