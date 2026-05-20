import { useState, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Plus, Pencil, Trash2, Search, Package, CheckCircle2,
  XCircle, LayoutGrid, LayoutList, RefreshCw,
  TrendingUp, CheckSquare, Square, Eye, EyeOff, FolderEdit, X, Download,
} from "lucide-react";
import { adminFetch, siteUrl } from "@/lib/adminApi";
import { useCatalog } from "@/context/CatalogContext";
import { resolveImageUrl } from "@/lib/imageUtils";
import type { AdminListProduct } from "@/lib/adminProductListMerge";
import { useAdminMergedCatalog } from "@/lib/useAdminMergedCatalog";
import {
  buildBrandGroups,
  buildCategoryGroups,
  filterAdminProductsByBrand,
  filterAdminProductsByCategory,
  filterAdminProductsBySource,
  matchesAdminProductSearch,
  type AdminSourceFilter,
} from "@/lib/adminCatalogTaxonomy";
import { CANONICAL_STOREFRONT_CATEGORIES } from "@/lib/storefrontCategories";
import { downloadAdminProductsCsv } from "@/lib/adminCatalogExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";

type AdminProduct = AdminListProduct;

const SOURCE_FILTERS: { value: AdminSourceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "storefront", label: "On shop" },
  { value: "bundled", label: "Bundled" },
  { value: "database", label: "DB" },
  { value: "database_only", label: "DB only" },
];

const VALID_SOURCE = new Set<AdminSourceFilter>(SOURCE_FILTERS.map((s) => s.value));

const StatCard = ({ icon: Icon, label, value, color }: { icon: typeof Package; label: string; value: number; color: string }) => (
  <div className={cn("flex items-center gap-2 sm:gap-3 rounded-xl border px-3 sm:px-4 py-2.5 sm:py-3", color)}>
    <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 opacity-70" />
    <div className="min-w-0">
      <p className="text-xl sm:text-2xl font-bold leading-none">{value}</p>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
    </div>
  </div>
);

const AdminProductList = () => {
  const { toast } = useToast();
  const { refresh: refreshCatalog } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading: listLoading, catalogError, storefrontCount, refresh } =
    useAdminMergedCatalog();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [view, setView] = useState<"grid" | "list">("list");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("Smartphones");
  const [confirmState, setConfirmState] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({
    open: false, title: "", description: "", onConfirm: () => {},
  });

  const search = searchParams.get("search") ?? "";
  const categoryFilter = searchParams.get("category") ?? "All";
  const brandFilter = searchParams.get("brand") ?? "All";
  const statusParam = searchParams.get("status");
  const statusFilter: "all" | "active" | "inactive" =
    statusParam === "active" || statusParam === "inactive" ? statusParam : "all";
  const sourceParam = searchParams.get("source");
  const sourceFilter: AdminSourceFilter = VALID_SOURCE.has(sourceParam as AdminSourceFilter)
    ? (sourceParam as AdminSourceFilter)
    : "all";

  const patchFilterParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const next = new URLSearchParams(searchParams);
      for (const [key, val] of Object.entries(updates)) {
        if (val == null || val === "" || val === "All" || val === "all") next.delete(key);
        else next.set(key, val);
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const rowKey = (p: AdminProduct) => (p.dbId != null ? `db-${p.dbId}` : `s-${p.id}`);
  const editHref = (p: AdminProduct) =>
    p.dbId != null ? `/admin/products/${p.dbId}` : `/admin/products/new?override=${p.id}`;
  const canBulkSelect = (p: AdminProduct) => p.dbId != null;

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) list = list.filter((p) => matchesAdminProductSearch(p, search));
    if (categoryFilter !== "All") list = filterAdminProductsByCategory(list, categoryFilter);
    if (brandFilter !== "All") list = filterAdminProductsByBrand(list, brandFilter);
    if (sourceFilter !== "all") list = filterAdminProductsBySource(list, sourceFilter);
    if (statusFilter === "active") list = list.filter((p) => p.isActive);
    else if (statusFilter === "inactive") list = list.filter((p) => !p.isActive);
    return list;
  }, [products, search, categoryFilter, brandFilter, sourceFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: products.length,
      onStorefront: products.filter((p) => p.onStorefront).length,
      bundled: products.filter((p) => p.source === "bundled").length,
      active: products.filter((p) => p.isActive).length,
      inactive: products.filter((p) => !p.isActive).length,
      preorder: products.filter((p) => p.isPreorder).length,
    }),
    [products]
  );

  const categoryPills = useMemo(
    () => ["All", ...buildCategoryGroups(products).map((g) => g.canonical)],
    [products]
  );

  const brandPills = useMemo(
    () => ["All", ...buildBrandGroups(products).map((g) => g.displayName)],
    [products]
  );

  const deleteProduct = (p: AdminProduct) => {
    if (p.dbId == null) {
      toast({
        variant: "destructive",
        title: "Bundled catalog item",
        description:
          "This product ships with the website code. Create a database override to manage it here, or remove it from src/data/.",
      });
      return;
    }
    setConfirmState({
      open: true,
      title: `Delete "${p.name}"?`,
      description: "This product will be permanently removed. This action cannot be undone.",
      onConfirm: () => doDeleteProduct(p.dbId!, p.name),
    });
  };

  const doDeleteProduct = async (dbId: number, name: string) => {
    console.log('[AdminProductList] Deleting product:', dbId, name);
    setDeleting(dbId);
    try {
      const r = await adminFetch(`/api/admin/products/${dbId}`, { method: "DELETE" });
      console.log('[AdminProductList] Delete response status:', r.status);
      if (!r.ok) {
        const errorData = await r.json().catch(() => ({}));
        console.error('[AdminProductList] Delete failed:', errorData);
        throw new Error(errorData.error || 'Delete failed');
      }
      console.log('[AdminProductList] Product deleted successfully');
      toast({ title: "✓ Deleted successfully", description: `"${name}" has been removed.` });
      refreshCatalog();
      refresh();
    } catch (err) {
      console.error('[AdminProductList] Delete error:', err);
      toast({ 
        variant: "destructive", 
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Unknown error"
      });
    } finally {
      setDeleting(null);
    }
  };

  const priceLabel = (p: AdminProduct) => `$${p.price.toFixed(2)}`;

  // ── Bulk selection helpers (database rows only) ──
  const selectableFiltered = filtered.filter(canBulkSelect);
  const allSelected =
    selectableFiltered.length > 0 &&
    selectableFiltered.every((p) => selected.has(p.dbId!));

  const toggleOne = (dbId: number | null) => {
    if (dbId == null) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(dbId)) next.delete(dbId);
      else next.add(dbId);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectableFiltered.map((p) => p.dbId!)));
    }
  };

  const doBulkAction = async (action: string, value?: string) => {
    console.log('[AdminProductList] Bulk action:', action, 'on', selected.size, 'products');
    setBulkBusy(true);
    try {
      const res = await adminFetch('/api/admin/products/bulk', {
        method: 'POST',
        body: JSON.stringify({ ids: Array.from(selected), action, value }),
      });
      console.log('[AdminProductList] Bulk action response status:', res.status);
      const data = await res.json();
      if (!res.ok) {
        console.error('[AdminProductList] Bulk action failed:', data.error);
        throw new Error(data.error || 'Bulk action failed');
      }
      const actionLabel = action === "change_category" ? "updated" : `${action}d`;
      console.log('[AdminProductList] Bulk action successful, affected:', data.affected);
      toast({ title: `✓ Done — ${data.affected} product(s) ${actionLabel}` });
      setSelected(new Set());
      setShowCatPicker(false);
      refreshCatalog();
      refresh();
    } catch (e: any) {
      console.error('[AdminProductList] Bulk action error:', e);
      toast({ variant: 'destructive', title: 'Bulk action failed', description: e.message });
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkAction = (action: string, value?: string) => {
    if (selected.size === 0) return;
    const label = action === 'delete' ? `Delete ${selected.size} product(s)?` : `${action} ${selected.size} product(s)?`;
    setConfirmState({
      open: true,
      title: label,
      description: action === 'delete' ? "These products will be permanently removed. This cannot be undone." : "This will apply to all selected products.",
      onConfirm: () => doBulkAction(action, value),
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {listLoading
              ? "Loading full website catalog…"
              : `${products.length} products (${storefrontCount} on shop${stats.bundled > 0 ? `, ${stats.bundled} bundled` : ""}) — database edits go live instantly.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 touch-manipulation hidden sm:inline-flex"
            disabled={listLoading || filtered.length === 0}
            onClick={() => downloadAdminProductsCsv(filtered)}
            title="Export filtered list as CSV"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 touch-manipulation"
            style={{ touchAction: 'manipulation' }}
            onClick={() => {
              void refreshCatalog();
              refresh();
            }}
            title="Refresh"
          >
            <RefreshCw className={cn("h-4 w-4", listLoading && "animate-spin")} />
          </Button>
          <Button asChild className="flex-1 sm:flex-none touch-manipulation" style={{ touchAction: 'manipulation' }}>
            <Link to="/admin/products/new">
              <Plus className="h-4 w-4 mr-1.5" />
              <span className="hidden xs:inline">New Product</span>
              <span className="xs:hidden">New</span>
            </Link>
          </Button>
        </div>
      </div>

      {catalogError && !listLoading && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
          Storefront catalog warning: {catalogError}. Showing bundled products from code; database rows are still listed.
        </p>
      )}

      {/* Stats */}
      {!listLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Package} label="Total (website)" value={stats.total} color="bg-muted/50" />
          <StatCard icon={Eye} label="On storefront" value={stats.onStorefront} color="bg-sky-500/8 text-sky-700 dark:text-sky-400 border-sky-500/20" />
          <StatCard icon={Package} label="Bundled only" value={stats.bundled} color="bg-amber-500/8 text-amber-800 dark:text-amber-400 border-amber-500/20" />
          <StatCard icon={CheckCircle2} label="DB active" value={stats.active} color="bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" />
          <StatCard icon={XCircle} label="DB inactive" value={stats.inactive} color="bg-orange-500/8 text-orange-700 dark:text-orange-400 border-orange-500/20" />
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, brand, category…"
              className="pl-9"
              value={search}
              onChange={(e) => patchFilterParams({ search: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status filter */}
            <div className="flex items-center rounded-lg border bg-muted/30 p-0.5 gap-0.5">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => patchFilterParams({ status: s })}
                  className={cn(
                    "px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize touch-manipulation",
                    statusFilter === s ? "bg-background shadow text-foreground" : "text-muted-foreground"
                  )}
                  style={{ touchAction: 'manipulation' }}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* View toggle */}
            <div className="flex items-center rounded-lg border bg-muted/30 p-0.5 gap-0.5">
              <button
                onClick={() => setView("list")}
                className={cn("p-1.5 rounded-md transition-all touch-manipulation", view === "list" ? "bg-background shadow text-foreground" : "text-muted-foreground")}
                style={{ touchAction: 'manipulation' }}
                title="List view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("grid")}
                className={cn("p-1.5 rounded-md transition-all touch-manipulation", view === "grid" ? "bg-background shadow text-foreground" : "text-muted-foreground")}
                style={{ touchAction: 'manipulation' }}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Source filter */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-full sm:w-auto">
            Source
          </span>
          {SOURCE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => patchFilterParams({ source: value })}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all touch-manipulation",
                sourceFilter === value
                  ? "bg-foreground text-background border-foreground"
                  : "bg-muted/30 text-muted-foreground border-border hover:border-foreground/30"
              )}
              style={{ touchAction: "manipulation" }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-full sm:w-auto">
            Category
          </span>
          {categoryPills.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => patchFilterParams({ category: cat })}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all touch-manipulation",
                categoryFilter === cat
                  ? "bg-foreground text-background border-foreground"
                  : "bg-muted/30 text-muted-foreground border-border hover:border-foreground/30"
              )}
              style={{ touchAction: "manipulation" }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Brand pills */}
        {brandPills.length > 1 && (
          <div className="flex flex-wrap gap-1.5 items-center max-h-32 overflow-y-auto">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium w-full sm:w-auto shrink-0">
              Brand
            </span>
            {brandPills.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => patchFilterParams({ brand: b })}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all touch-manipulation shrink-0",
                  brandFilter === b
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted/30 text-muted-foreground border-border hover:border-foreground/30"
                )}
                style={{ touchAction: "manipulation" }}
              >
                {b}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result count + bulk bar */}
      {!listLoading && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> products
            {search && <> for "<em>{search}</em>"</>}
          </p>
          {selectableFiltered.length > 0 && (
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7" onClick={toggleAll}>
              {allSelected ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
              {allSelected ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>
      )}

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/40 px-4 py-2.5">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8" disabled={bulkBusy} onClick={() => bulkAction('activate')}>
            <Eye className="h-3.5 w-3.5" /> Activate
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8" disabled={bulkBusy} onClick={() => bulkAction('deactivate')}>
            <EyeOff className="h-3.5 w-3.5" /> Deactivate
          </Button>
          {!showCatPicker ? (
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8" disabled={bulkBusy} onClick={() => setShowCatPicker(true)}>
              <FolderEdit className="h-3.5 w-3.5" /> Category
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              >
                {CANONICAL_STOREFRONT_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <Button size="sm" className="h-8 text-xs" disabled={bulkBusy} onClick={() => bulkAction('change_category', bulkCategory)}>Apply</Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCatPicker(false)}><X className="h-3.5 w-3.5" /></Button>
            </div>
          )}
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30" disabled={bulkBusy} onClick={() => bulkAction('delete')}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => setSelected(new Set())} disabled={bulkBusy}>
            Clear
          </Button>
        </div>
      )}

      {/* Loading */}
      {listLoading && (
        <div className="py-20 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Loading products…</p>
        </div>
      )}

      {/* Empty state */}
      {!listLoading && filtered.length === 0 && (
        <div className="py-20 text-center rounded-xl border border-dashed">
          {products.length === 0 ? (
            <>
              <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="font-medium">No products yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first product to get started.</p>
              <Button asChild size="sm">
                <Link to="/admin/products/new"><Plus className="h-4 w-4 mr-1" />Add Product</Link>
              </Button>
            </>
          ) : (
            <>
              <Search className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="font-medium">No results found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
            </>
          )}
        </div>
      )}

      {/* Grid view */}
      {!listLoading && view === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((p) => (
            <div key={rowKey(p)} className={cn("group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow", p.dbId != null && selected.has(p.dbId) && "ring-2 ring-primary")}>
              <div className="aspect-square relative bg-muted/30 overflow-hidden">
                {canBulkSelect(p) ? (
                  <button
                    type="button"
                    className="absolute top-2 right-2 z-10 h-6 w-6 rounded bg-background/80 flex items-center justify-center border shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOne(p.dbId);
                    }}
                  >
                    {selected.has(p.dbId!) ? (
                      <CheckSquare className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Square className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                ) : null}
                <img
                  key={`${p.id}-${p.dbId}-${resolveImageUrl(p.image)}`}
                  src={resolveImageUrl(p.image)}
                  alt={p.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    if (el.dataset.errHandled) return;
                    el.dataset.errHandled = "1";
                    el.removeAttribute("src");
                    el.style.opacity = "0.35";
                  }}
                />
                {!p.isActive && p.dbId != null && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  </div>
                )}
                {p.source === "bundled" && (
                  <Badge className="absolute top-2 left-2 text-[10px] py-0 bg-amber-500">Bundled</Badge>
                )}
                {!p.onStorefront && (
                  <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] py-0">
                    Off shop
                  </Badge>
                )}
                {p.isPreorder && (
                  <Badge className="absolute top-2 left-2 text-[10px] py-0 bg-violet-500">Pre-order</Badge>
                )}
                {!p.image && (
                  <Badge variant="destructive" className="absolute bottom-2 left-2 text-[10px] py-0">
                    No image
                  </Badge>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold line-clamp-2 leading-tight mb-1">{p.name}</p>
                <p className="text-[10px] text-muted-foreground mb-1">Shop ID #{p.id}</p>
                <div className="flex items-center justify-between gap-1">
                  <Badge variant="outline" className="text-[10px] py-0">{p.category}</Badge>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{priceLabel(p)}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <Button variant="outline" size="icon" className="h-7 w-7 flex-1 touch-manipulation" style={{ touchAction: "manipulation" }} asChild>
                    <Link to={editHref(p)} title={p.dbId != null ? "Edit" : "Create override"}>
                      <Pencil className="h-3 w-3" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" className="h-7 w-7 touch-manipulation" style={{ touchAction: "manipulation" }} asChild>
                    <a href={`${siteUrl()}/product/${p.id}`} target="_blank" rel="noopener noreferrer" title="View on store">
                      <Eye className="h-3 w-3" />
                    </a>
                  </Button>
                  {p.dbId != null ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 touch-manipulation"
                      style={{ touchAction: "manipulation" }}
                      onClick={() => deleteProduct(p)}
                      disabled={deleting === p.dbId}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {!listLoading && view === "list" && filtered.length > 0 && (
        <div className="rounded-xl border overflow-hidden">
          {/* Table header — desktop */}
          <div className="hidden sm:grid grid-cols-[32px_56px_1fr_140px_100px_90px_90px] gap-4 items-center px-4 py-2.5 bg-muted/40 text-xs text-muted-foreground font-medium border-b">
            <span></span>
            <span>Image</span>
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y">
            {filtered.map((p) => (
              <div key={rowKey(p)}>
                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-[32px_56px_1fr_140px_100px_90px_90px] gap-4 items-center px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center justify-center">
                    {canBulkSelect(p) ? (
                      <button
                        type="button"
                        onClick={() => toggleOne(p.dbId)}
                        className="touch-manipulation"
                        style={{ touchAction: "manipulation" }}
                      >
                        {selected.has(p.dbId!) ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </button>
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-lg border bg-muted/30 overflow-hidden shrink-0">
                    <img
                      key={`${p.id}-${p.dbId}-${resolveImageUrl(p.image)}`}
                      src={resolveImageUrl(p.image)}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        if (el.dataset.errHandled) return;
                        el.dataset.errHandled = "1";
                        el.removeAttribute("src");
                        el.style.opacity = "0.35";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.brand || "—"} · Shop #{p.id}
                      {p.dbId != null ? ` · DB #${p.dbId}` : " · Bundled"}
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">{p.category}</Badge>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{priceLabel(p)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {p.source === "bundled" ? (
                      <Badge variant="outline" className="text-[10px] py-0 text-amber-700 border-amber-500/40">
                        Bundled
                      </Badge>
                    ) : p.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                        Inactive
                      </span>
                    )}
                    {!p.onStorefront && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        Off shop
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to={editHref(p)} title={p.dbId != null ? "Edit" : "Create override"}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a
                        href={`${siteUrl()}/product/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on store"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    {p.dbId != null ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => void deleteProduct(p)}
                        disabled={deleting === p.dbId}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Mobile row */}
                <div className="sm:hidden flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors">
                  {canBulkSelect(p) ? (
                    <button
                      type="button"
                      onClick={() => toggleOne(p.dbId)}
                      className="shrink-0 mt-1 touch-manipulation"
                      style={{ touchAction: "manipulation" }}
                    >
                      {selected.has(p.dbId!) ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                      ) : (
                        <Square className="h-5 w-5 text-muted-foreground/30" />
                      )}
                    </button>
                  ) : (
                    <span className="w-5 shrink-0" />
                  )}
                  <div className="h-14 w-14 rounded-lg border bg-muted/30 overflow-hidden shrink-0">
                    <img
                      key={`${p.id}-${p.dbId}-${resolveImageUrl(p.image)}`}
                      src={resolveImageUrl(p.image)}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        if (el.dataset.errHandled) return;
                        el.dataset.errHandled = "1";
                        el.removeAttribute("src");
                        el.style.opacity = "0.35";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-2">{p.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge variant="outline" className="text-[10px] py-0">{p.category}</Badge>
                      {p.source === "bundled" ? (
                        <Badge variant="outline" className="text-[10px] py-0 text-amber-700 border-amber-500/40">
                          Bundled
                        </Badge>
                      ) : p.isActive ? (
                        <Badge variant="outline" className="text-[10px] py-0 text-emerald-600 border-emerald-500/30">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] py-0 text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                      {p.isPreorder && <Badge className="text-[10px] py-0 bg-violet-500">Pre-order</Badge>}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{priceLabel(p)}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8 touch-manipulation" style={{ touchAction: "manipulation" }} asChild>
                          <Link to={editHref(p)}><Pencil className="h-3.5 w-3.5" /></Link>
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 touch-manipulation" style={{ touchAction: "manipulation" }} asChild>
                          <a href={`${siteUrl()}/product/${p.id}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        {p.dbId != null ? (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 touch-manipulation hover:bg-red-500/10 hover:text-red-500"
                            style={{ touchAction: "manipulation" }}
                            onClick={() => void deleteProduct(p)}
                            disabled={deleting === p.dbId}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState((s) => ({ ...s, open }))}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel="Delete"
        onConfirm={confirmState.onConfirm}
      />
    </div>
  );
};

export default AdminProductList;
