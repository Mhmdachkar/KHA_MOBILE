import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  AlertTriangle,
  ScrollText,
  FolderTree,
  BarChart3,
  ChevronRight,
  Tags,
} from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import type { AdminProductStats } from "@/types/adminAnalytics";
import { useAdminCatalogSummary } from "@/hooks/useAdminCatalogSummary";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: number;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
}

interface OrderStats {
  pending: number;
  total: number;
}

const StatLink = ({
  to,
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  to: string;
  label: string;
  value: string | number;
  sub?: string;
  icon: typeof Package;
  accent?: string;
}) => (
  <Link
    to={to}
    className={cn(
      "rounded-xl border bg-card p-4 flex items-center gap-3 transition-colors hover:bg-muted/40 min-h-[72px] touch-manipulation",
      accent
    )}
    style={{ touchAction: "manipulation" }}
  >
    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
  </Link>
);

const AdminHome = () => {
  const [productStats, setProductStats] = useState<AdminProductStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [recentAudit, setRecentAudit] = useState<AuditEntry[]>([]);
  const { summary, loading: catalogLoading } = useAdminCatalogSummary();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [productsRes, ordersRes, auditRes] = await Promise.all([
          adminFetch("/api/admin/products/stats"),
          adminFetch("/api/admin/order-stats"),
          adminFetch("/api/admin/audit-log?page=1&limit=8"),
        ]);
        if (cancelled) return;
        if (productsRes.ok) setProductStats((await productsRes.json()) as AdminProductStats);
        if (ordersRes.ok) {
          const o = await ordersRes.json();
          setOrderStats({
            pending: typeof o.pending === "number" ? o.pending : 0,
            total: typeof o.total === "number" ? o.total : 0,
          });
        }
        if (auditRes.ok) {
          const a = await auditRes.json();
          setRecentAudit(Array.isArray(a.entries) ? a.entries : []);
        }
      } catch {
        /* overview still usable without API */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const taxonomyAlerts = useMemo(() => {
    if (catalogLoading || !summary) return [];
    const alerts: { message: string; to: string }[] = [];
    if (summary.nonCanonicalCategoryCount > 0) {
      alerts.push({
        message: `${summary.nonCanonicalCategoryCount} categor${summary.nonCanonicalCategoryCount === 1 ? "y uses" : "ies use"} non-canonical product labels`,
        to: "/admin/catalog",
      });
    }
    if (summary.inactiveOnStorefront > 0) {
      alerts.push({
        message: `${summary.inactiveOnStorefront} product${summary.inactiveOnStorefront === 1 ? "" : "s"} on storefront marked inactive`,
        to: "/admin/products?status=inactive&source=storefront",
      });
    }
    if (productStats && productStats.inactive > 0) {
      alerts.push({
        message: `${productStats.inactive} inactive product${productStats.inactive === 1 ? "" : "s"} in database`,
        to: "/admin/products?status=inactive",
      });
    }
    return alerts;
  }, [summary, catalogLoading, productStats]);

  return (
    <AdminPageShell
      title="Overview"
      description="Quick snapshot of your store and catalog health."
      maxWidth="lg"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatLink
            to="/admin/products"
            icon={Package}
            label="DB products"
            value={productStats?.total ?? "—"}
            sub={
              productStats
                ? `${productStats.active} active · ${productStats.inactive} inactive`
                : undefined
            }
          />
          <StatLink
            to="/admin/orders"
            icon={ShoppingBag}
            label="Orders"
            value={orderStats?.total ?? "—"}
            sub={orderStats ? `${orderStats.pending} pending` : undefined}
            accent={
              orderStats && orderStats.pending > 0 ? "border-amber-500/30" : undefined
            }
          />
          <StatLink
            to="/admin/catalog"
            icon={FolderTree}
            label="Website catalog"
            value={catalogLoading ? "…" : (summary?.storefrontCount ?? "—")}
            sub="On the live storefront"
          />
          <StatLink
            to="/admin/analytics"
            icon={BarChart3}
            label="Analytics"
            value="View"
            sub="Revenue & traffic"
          />
        </div>

        {taxonomyAlerts.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Catalog attention
            </p>
            <ul className="space-y-2">
              {taxonomyAlerts.map((a) => (
                <li key={a.to + a.message}>
                  <Button variant="link" className="h-auto p-0 text-sm font-normal" asChild>
                    <Link to={a.to}>{a.message}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4 min-w-0">
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <ScrollText className="h-4 w-4 shrink-0" />
                Recent activity
              </h2>
              <Button variant="ghost" size="sm" className="text-xs h-8 shrink-0" asChild>
                <Link to="/admin/audit-log">View all</Link>
              </Button>
            </div>
            {recentAudit.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent actions recorded.</p>
            ) : (
              <ul className="space-y-2">
                {recentAudit.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-2 text-sm border-b last:border-0 pb-2 last:pb-0 min-w-0"
                  >
                    <span className="capitalize truncate min-w-0">
                      {e.action}{" "}
                      <span className="text-muted-foreground">{e.entity_type}</span>
                      {e.entity_id && (
                        <span className="font-mono text-xs ml-1">#{e.entity_id}</span>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(e.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border bg-card p-4 min-w-0">
            <h2 className="text-sm font-semibold mb-3">Shortcuts</h2>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start h-10 w-full" asChild>
                <Link to="/admin/catalog">
                  <Tags className="h-4 w-4 mr-2 shrink-0" />
                  Browse by category or brand
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-10 w-full" asChild>
                <Link to="/admin/products/new">
                  <Package className="h-4 w-4 mr-2 shrink-0" />
                  Add new product
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-10 w-full" asChild>
                <Link to="/admin/site-content">
                  <BarChart3 className="h-4 w-4 mr-2 shrink-0" />
                  Edit homepage content
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {!catalogLoading && summary && (
          <p className="text-xs text-muted-foreground flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[10px]">
              {summary.storefrontCount} on storefront
            </Badge>
            {summary.bundledOnly > 0 && (
              <Badge variant="outline" className="text-[10px]">
                {summary.bundledOnly} bundled in catalog
              </Badge>
            )}
          </p>
        )}
      </div>
    </AdminPageShell>
  );
};

export default AdminHome;
