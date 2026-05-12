import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Pencil, Trash2, Search, Package, CheckCircle2,
  XCircle, Filter, LayoutGrid, LayoutList, RefreshCw,
  TrendingUp, Tag, AlertTriangle,
} from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { useCatalog } from "@/context/CatalogContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdminProduct {
  dbId?: number;
  id: number;
  name: string;
  price: number | string;
  image: string;
  category: string;
  brand?: string;
  rating: number;
  isActive?: boolean;
  isPreorder?: boolean;
}

const CATEGORIES = ["All", "Smartphones", "Tablets", "Audio", "Computers", "Wearables", "Gaming", "Accessories", "Charging", "Electronics"];

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
  const { allProducts, loading: catalogLoading, refresh: refreshCatalog } = useCatalog();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [view, setView] = useState<"grid" | "list">("list");
  const [refreshKey, setRefreshKey] = useState(0);

  // Convert catalog products to admin format
  const products = useMemo<AdminProduct[]>(() => {
    return allProducts.map(p => ({
      dbId: (p as any).dbId, // May not exist for static-only products
      id: p.id,
      name: p.name,
      price: p.price,
      image: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : p.image,
      category: p.category,
      brand: p.brand,
      rating: p.rating,
      isActive: (p as any).isActive !== false,
      isPreorder: (p as any).isPreorder,
    }));
  }, [allProducts, refreshKey]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "All" || p.category === categoryFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActive !== false) ||
        (statusFilter === "inactive" && p.isActive === false);
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: products.length,
    active: products.filter((p) => p.isActive !== false).length,
    inactive: products.filter((p) => p.isActive === false).length,
    preorder: products.filter((p) => p.isPreorder).length,
  }), [products]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ["All", ...cats.sort()];
  }, [products]);

  const deleteProduct = async (dbId: number | undefined, name: string) => {
    if (!dbId) {
      toast({ 
        variant: "destructive", 
        title: "Cannot delete", 
        description: "This product exists only in static files. Edit the source code to remove it." 
      });
      return;
    }
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(dbId);
    try {
      const r = await adminFetch(`/api/admin/products/${dbId}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      toast({ title: "Deleted", description: `"${name}" removed. Refresh to see changes.` });
      setRefreshKey(k => k + 1);
    } catch {
      toast({ variant: "destructive", title: "Delete failed" });
    } finally {
      setDeleting(null);
    }
  };

  const priceLabel = (p: AdminProduct) =>
    typeof p.price === "number" ? `$${p.price.toFixed(2)}` : `$${p.price}`;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage your catalog — changes go live instantly.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 touch-manipulation"
            style={{ touchAction: 'manipulation' }}
            onClick={() => { refreshCatalog(); setRefreshKey((k) => k + 1); }}
            title="Refresh"
          >
            <RefreshCw className={cn("h-4 w-4", catalogLoading && "animate-spin")} />
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

      {/* Stats */}
      {!catalogLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Package} label="Total Products" value={stats.total} color="bg-muted/50" />
          <StatCard icon={CheckCircle2} label="Active" value={stats.active} color="bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" />
          <StatCard icon={XCircle} label="Inactive" value={stats.inactive} color="bg-orange-500/8 text-orange-700 dark:text-orange-400 border-orange-500/20" />
          <StatCard icon={TrendingUp} label="Preorder" value={stats.preorder} color="bg-violet-500/8 text-violet-700 dark:text-violet-400 border-violet-500/20" />
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
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status filter */}
            <div className="flex items-center rounded-lg border bg-muted/30 p-0.5 gap-0.5">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
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

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all touch-manipulation",
                categoryFilter === cat
                  ? "bg-foreground text-background border-foreground"
                  : "bg-muted/30 text-muted-foreground border-border hover:border-foreground/30"
              )}
              style={{ touchAction: 'manipulation' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      {!loading && (
        <p className="text-xs text-muted-foreground">
          Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> products
          {search && <> for "<em>{search}</em>"</>}
        </p>
      )}

      {/* Loading */}
      {catalogLoading && (
        <div className="py-20 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">Loading products…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
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
      {!loading && view === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((p) => (
            <div key={p.dbId} className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square relative bg-muted/30 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/200x200/0f172a/666?text=${encodeURIComponent(p.name.slice(0, 10))}`;
                  }}
                />
                {p.isActive === false && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  </div>
                )}
                {p.isPreorder && (
                  <Badge className="absolute top-2 left-2 text-[10px] py-0 bg-violet-500">Pre-order</Badge>
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold line-clamp-2 leading-tight mb-1">{p.name}</p>
                <div className="flex items-center justify-between gap-1">
                  <Badge variant="outline" className="text-[10px] py-0">{p.category}</Badge>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{priceLabel(p)}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <Button variant="outline" size="icon" className="h-7 w-7 flex-1 touch-manipulation" style={{ touchAction: 'manipulation' }} asChild>
                    <Link to={`/admin/products/${p.dbId}`}><Pencil className="h-3 w-3" /></Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 touch-manipulation"
                    style={{ touchAction: 'manipulation' }}
                    onClick={() => void deleteProduct(p.dbId, p.name)}
                    disabled={deleting === p.dbId}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {!loading && view === "list" && filtered.length > 0 && (
        <div className="rounded-xl border overflow-hidden">
          {/* Table header — desktop */}
          <div className="hidden sm:grid grid-cols-[56px_1fr_140px_100px_90px_90px] gap-4 items-center px-4 py-2.5 bg-muted/40 text-xs text-muted-foreground font-medium border-b">
            <span>Image</span>
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y">
            {filtered.map((p) => (
              <div key={p.dbId}>
                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-[56px_1fr_140px_100px_90px_90px] gap-4 items-center px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="h-12 w-12 rounded-lg border bg-muted/30 overflow-hidden shrink-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/56x56/0f172a/666?text=?`;
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.brand || "—"} · #{p.dbId}</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">{p.category}</Badge>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{priceLabel(p)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.isActive !== false ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link to={`/admin/products/${p.dbId}`}><Pencil className="h-3.5 w-3.5" /></Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                      onClick={() => void deleteProduct(p.dbId, p.name)}
                      disabled={deleting === p.dbId}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Mobile row */}
                <div className="sm:hidden flex items-start gap-3 p-4 hover:bg-muted/20 transition-colors">
                  <div className="h-14 w-14 rounded-lg border bg-muted/30 overflow-hidden shrink-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/56x56/0f172a/666?text=?`;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-2">{p.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge variant="outline" className="text-[10px] py-0">{p.category}</Badge>
                      {p.isActive !== false
                        ? <Badge variant="outline" className="text-[10px] py-0 text-emerald-600 border-emerald-500/30">Active</Badge>
                        : <Badge variant="outline" className="text-[10px] py-0 text-muted-foreground">Inactive</Badge>
                      }
                      {p.isPreorder && <Badge className="text-[10px] py-0 bg-violet-500">Pre-order</Badge>}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{priceLabel(p)}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8 touch-manipulation" style={{ touchAction: 'manipulation' }} asChild>
                          <Link to={`/admin/products/${p.dbId}`}><Pencil className="h-3.5 w-3.5" /></Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 touch-manipulation hover:bg-red-500/10 hover:text-red-500"
                          style={{ touchAction: 'manipulation' }}
                          onClick={() => void deleteProduct(p.dbId, p.name)}
                          disabled={deleting === p.dbId}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductList;
