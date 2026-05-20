import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ScrollText, ChevronLeft, ChevronRight, Filter,
  Package, Ticket, Image, Settings, Trash2, Pencil, Plus, ShoppingBag, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";

interface AuditEntry {
  id: number;
  admin_id: number | null;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any>;
  created_at: string;
}

const actionIcons: Record<string, typeof Plus> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
};

const entityIcons: Record<string, typeof Package> = {
  product: Package,
  coupon: Ticket,
  media: Image,
  setting: Settings,
  order: ShoppingBag,
};

const actionColors: Record<string, string> = {
  create: "bg-green-500/10 text-green-600 border-green-200",
  update: "bg-blue-500/10 text-blue-600 border-blue-200",
  delete: "bg-red-500/10 text-red-600 border-red-200",
  bulk_activate: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  bulk_deactivate: "bg-amber-500/10 text-amber-600 border-amber-200",
  bulk_delete: "bg-red-500/10 text-red-600 border-red-200",
  bulk_change_category: "bg-purple-500/10 text-purple-600 border-purple-200",
};

const AdminAuditLog = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterEntity, setFilterEntity] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const fetchLog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "30" });
      if (filterEntity) params.set("entity_type", filterEntity);
      if (filterAction) params.set("action", filterAction);

      const res = await adminFetch(`/api/admin/audit-log?${params}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setEntries(data.entries || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast({ title: "Error", description: "Failed to load audit log", variant: "destructive" });
      setEntries([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, filterEntity, filterAction, toast]);

  useEffect(() => { void fetchLog(); }, [fetchLog]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${date}, ${time}`;
  };

  return (
    <div className="h-full min-h-0 min-w-0 w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ScrollText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Activity Log
          </h1>
          <Badge variant="outline" className="text-xs">{total} entries</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterEntity}
            onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="">All Types</option>
            <option value="product">Product</option>
            <option value="order">Order</option>
            <option value="coupon">Coupon</option>
            <option value="media">Media</option>
            <option value="setting">Setting</option>
          </select>
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="bulk_activate">Bulk Activate</option>
            <option value="bulk_deactivate">Bulk Deactivate</option>
            <option value="bulk_delete">Bulk Delete</option>
            <option value="bulk_change_category">Bulk Category</option>
          </select>
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No activity recorded yet</p>
            <p className="text-sm mt-1">Actions like creating, editing, or deleting will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl mx-auto">
            {entries.map((entry) => {
              const ActionIcon = actionIcons[entry.action] || Pencil;
              const EntityIcon = entityIcons[entry.entity_type] || Settings;
              const colorClass = actionColors[entry.action] || "bg-muted text-foreground";

              return (
                <div key={entry.id} className="flex items-start gap-3 rounded-lg border p-3 bg-card">
                  <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${colorClass}`}>
                    <ActionIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium capitalize">{entry.action}</span>
                      <Badge variant="outline" className="text-[10px] gap-1 capitalize">
                        <EntityIcon className="h-3 w-3" />
                        {entry.entity_type}
                      </Badge>
                      {entry.entity_id && (
                        entry.entity_type === "product" && /^\d+$/.test(entry.entity_id) ? (
                          <Link
                            to={`/admin/products/${entry.entity_id}`}
                            className="text-xs text-primary font-mono hover:underline"
                          >
                            #{entry.entity_id}
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">#{entry.entity_id}</span>
                        )
                      )}
                    </div>
                    {entry.details && Object.keys(entry.details).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {Object.entries(entry.details)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{entry.admin_email}</span>
                      <span>{formatTime(entry.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t px-4 sm:px-6 py-3 flex items-center justify-center gap-3">
          <Button
            variant="outline" size="icon" className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline" size="icon" className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLog;
