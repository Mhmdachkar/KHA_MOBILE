import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Package, BarChart3, LogOut, Store, Menu, X, ChevronRight,
  ShieldCheck, Layout, Ticket, Image, ScrollText, ShoppingBag,
} from "lucide-react";
import { getAdminToken, setAdminToken, siteUrl } from "@/lib/adminApi";
import { useCatalog } from "@/context/CatalogContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const catalogNav = [
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/media", label: "Media Library", icon: Image },
];

const siteNav = [
  { to: "/admin/site-content", label: "Site Content", icon: Layout },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/audit-log", label: "Activity Log", icon: ScrollText },
];

const navItems = [...catalogNav, ...siteNav];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { allProducts, catalogLoaded } = useCatalog();

  const stats = catalogLoaded
    ? { total: allProducts.length, active: allProducts.filter((p: any) => p.isActive !== false).length }
    : null;

  useEffect(() => {
    if (!getAdminToken()) {
      navigate("/admin/login", { state: { from: location.pathname }, replace: true });
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const logout = () => {
    setAdminToken(null);
    navigate("/admin/login", { replace: true });
  };

  if (!getAdminToken()) return null;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <Store className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-none">KHA Mobile</p>
          <p className="text-[11px] text-white/50 mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="px-4 pt-4 pb-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/8 px-3 py-2.5">
            <p className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5">Total</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl bg-emerald-500/15 px-3 py-2.5">
            <p className="text-[10px] text-emerald-300/70 uppercase tracking-widest mb-0.5">Active</p>
            <p className="text-xl font-bold text-emerald-300">{stats.active}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] text-white/30 uppercase tracking-widest px-2 mb-2">Catalog</p>
        {catalogNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/8 hover:text-white/90"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-white/50")} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="h-3 w-3 text-white/40" />}
              </>
            )}
          </NavLink>
        ))}

        <div className="pt-3">
          <p className="text-[10px] text-white/30 uppercase tracking-widest px-2 mb-2">Management</p>
          {siteNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/60 hover:bg-white/8 hover:text-white/90"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-white/50")} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 text-white/40" />}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="pt-3">
          <p className="text-[10px] text-white/30 uppercase tracking-widest px-2 mb-2">Store</p>
          <a
            href={`${siteUrl()}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white/90 transition-all"
          >
            <Store className="h-4 w-4 shrink-0 text-white/50" />
            <span className="flex-1">View Store</span>
            <Badge variant="outline" className="text-[10px] border-white/20 text-white/40 py-0">↗</Badge>
          </a>
        </div>
      </nav>

      {/* Footer / logout */}
      <div className="px-3 pb-5 pt-2 border-t border-white/10 mt-2">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/5">
          <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-white/70" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/80 font-medium truncate">Admin</p>
            <p className="text-[10px] text-white/40 truncate">Logged in</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/50 hover:bg-red-500/15 hover:text-red-300 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden sm:flex flex-col w-56 shrink-0 bg-gradient-to-b from-slate-900 to-slate-950 fixed left-0 top-0 h-screen overflow-hidden z-40">
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 sm:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col sm:hidden transition-transform duration-200",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          className="absolute top-4 right-4 text-white/60 hover:text-white"
          onClick={() => setDrawerOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 sm:ml-56">
        {/* Mobile top bar */}
        <header className="sm:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14 bg-slate-900 border-b border-white/10">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-white/60 hover:text-white transition-colors touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Store className="h-4 w-4 text-white/60 shrink-0" />
            <span className="text-sm font-semibold text-white truncate">KHA Mobile Admin</span>
          </div>
          {/* Active page indicator */}
          {navItems.map(({ to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? "block" : "hidden"}
            >
              {({ isActive }) =>
                isActive ? (
                  <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                ) : null
              }
            </NavLink>
          ))}
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
