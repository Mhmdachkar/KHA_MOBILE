import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag, Search, ChevronLeft, ChevronRight, Download,
  Package, Truck, CheckCircle2, XCircle, Clock, Eye, X,
  CreditCard, DollarSign, MapPin, Mail, Phone, User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminFetch, apiBase, getAdminToken } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_image: string;
  variant_label: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  coupon_code: string | null;
  payment_method: string;
  payment_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_OPTIONS = ["unpaid", "paid", "refunded"] as const;

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  pending:   { icon: Clock,        color: "text-amber-600",  bg: "bg-amber-500/10 border-amber-200" },
  confirmed: { icon: CheckCircle2, color: "text-blue-600",   bg: "bg-blue-500/10 border-blue-200" },
  shipped:   { icon: Truck,        color: "text-purple-600", bg: "bg-purple-500/10 border-purple-200" },
  delivered: { icon: Package,      color: "text-green-600",  bg: "bg-green-500/10 border-green-200" },
  cancelled: { icon: XCircle,      color: "text-red-600",    bg: "bg-red-500/10 border-red-200" },
};

const paymentConfig: Record<string, string> = {
  unpaid:   "bg-amber-500/10 text-amber-700 border-amber-200",
  paid:     "bg-green-500/10 text-green-700 border-green-200",
  refunded: "bg-red-500/10 text-red-700 border-red-200",
};

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail panel
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; order: Order | null }>({
    open: false, order: null,
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      if (filterPayment) params.set("payment_status", filterPayment);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);

      const res = await adminFetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      toast({ title: "Error", description: "Failed to load orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterPayment, dateFrom, dateTo, toast]);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  const openDetail = async (order: Order) => {
    setSelectedOrder(order);
    setDetailLoading(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${order.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.order) setSelectedOrder(data.order);
    } catch {
      toast({ title: "Error", description: "Failed to load order details", variant: "destructive" });
    }
    setDetailLoading(false);
  };

  const updateOrder = async (field: string, value: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelectedOrder(data.order);
      toast({ title: "Order updated" });
      void fetchOrders();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const doDeleteOrder = async (order: Order) => {
    try {
      const res = await adminFetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Order deleted" });
      if (selectedOrder?.id === order.id) setSelectedOrder(null);
      void fetchOrders();
    } catch {
      toast({ title: "Error", description: "Failed to delete order", variant: "destructive" });
    }
  };

  const deleteOrder = (order: Order) => {
    setConfirmDelete({ open: true, order });
  };

  const exportCsv = async () => {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    const token = getAdminToken();
    try {
      const res = await fetch(`${apiBase()}/api/admin/orders-export?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Error", description: "Failed to export CSV", variant: "destructive" });
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b shrink-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Orders
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{total} orders</Badge>
            <Button variant="outline" size="sm" onClick={() => void exportCsv()} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search orders…"
              className="pl-9 text-xs h-9"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs flex-1 min-w-[110px] sm:flex-none"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <select
            value={filterPayment}
            onChange={(e) => { setFilterPayment(e.target.value); setPage(1); }}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs flex-1 min-w-[110px] sm:flex-none"
          >
            <option value="">All Payments</option>
            {PAYMENT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="h-9 text-xs flex-1 min-w-[120px] sm:w-36 sm:flex-none" />
          <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="h-9 text-xs flex-1 min-w-[120px] sm:w-36 sm:flex-none" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Order list */}
        <div className={`flex-1 overflow-y-auto ${selectedOrder ? "hidden md:block md:w-1/2 lg:w-3/5 border-r" : ""}`}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No orders found</p>
              <p className="text-sm mt-1">Orders placed through the storefront will appear here.</p>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => {
                const sc = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = sc.icon;
                return (
                  <div
                    key={order.id}
                    className={`px-4 sm:px-6 py-3.5 hover:bg-muted/30 cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id ? "bg-muted/40" : ""
                    }`}
                    onClick={() => openDetail(order)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm">{order.order_number}</span>
                          <Badge variant="outline" className={`text-[10px] gap-1 capitalize ${sc.bg}`}>
                            <StatusIcon className={`h-3 w-3 ${sc.color}`} />
                            {order.status}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] capitalize ${paymentConfig[order.payment_status] || ""}`}>
                            {order.payment_status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{order.customer_name || "Guest"}</span>
                          <span>{order.customer_email}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">${Number(order.total).toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="mt-2 flex gap-1.5 overflow-hidden">
                        {order.items.slice(0, 4).map((item, i) => (
                          <div key={i} className="h-8 w-8 rounded border bg-muted/30 overflow-hidden shrink-0">
                            {item.product_image ? (
                              <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-4 w-4 m-2 text-muted-foreground/30" />
                            )}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <span className="text-[10px] text-muted-foreground self-center">+{order.items.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t px-4 py-3 flex items-center justify-center gap-3">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Order detail panel */}
        {selectedOrder && (
          <div className="flex-1 md:w-1/2 lg:w-2/5 overflow-auto md:border-l bg-background">
            <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setSelectedOrder(null)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-bold text-sm">{selectedOrder.order_number}</h2>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                  onClick={() => deleteOrder(selectedOrder)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex" onClick={() => setSelectedOrder(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="px-4 py-4 space-y-5">
                {/* Status controls */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Order Status</Label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrder("status", e.target.value)}
                      disabled={updatingStatus}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Payment Status</Label>
                    <select
                      value={selectedOrder.payment_status}
                      onChange={(e) => updateOrder("payment_status", e.target.value)}
                      disabled={updatingStatus}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {PAYMENT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Customer */}
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</p>
                  <div className="space-y-1.5 text-sm">
                    {selectedOrder.customer_name && (
                      <p className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> {selectedOrder.customer_name}</p>
                    )}
                    {selectedOrder.customer_email && (
                      <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {selectedOrder.customer_email}</p>
                    )}
                    {selectedOrder.customer_phone && (
                      <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {selectedOrder.customer_phone}</p>
                    )}
                    {selectedOrder.shipping_address && (
                      <p className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" /> <span className="whitespace-pre-line">{selectedOrder.shipping_address}</span></p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="rounded-lg border overflow-hidden">
                  <div className="px-3 py-2 bg-muted/30 border-b">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items ({selectedOrder.items?.length || 0})</p>
                  </div>
                  <div className="divide-y">
                    {(selectedOrder.items || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="h-10 w-10 rounded border bg-muted/30 overflow-hidden shrink-0">
                          {item.product_image ? (
                            <img src={item.product_image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5 m-2.5 text-muted-foreground/30" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product_name}</p>
                          {item.variant_label && <p className="text-[10px] text-muted-foreground">{item.variant_label}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium">${Number(item.line_total).toFixed(2)}</p>
                          <p className="text-[10px] text-muted-foreground">{item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="rounded-lg border p-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount{selectedOrder.coupon_code ? ` (${selectedOrder.coupon_code})` : ""}</span>
                      <span>-${Number(selectedOrder.discount).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(selectedOrder.shipping_cost) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>${Number(selectedOrder.shipping_cost).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-1.5 border-t">
                    <span>Total</span>
                    <span>${Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment & notes */}
                <div className="space-y-3">
                  {selectedOrder.payment_method && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Method:</span>
                      <span>{selectedOrder.payment_method}</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Admin Notes</Label>
                    <Textarea
                      value={selectedOrder.notes || ""}
                      onChange={(e) => setSelectedOrder((prev) => prev ? { ...prev, notes: e.target.value } : prev)}
                      onBlur={(e) => updateOrder("notes", e.target.value)}
                      placeholder="Internal notes…"
                      className="text-sm min-h-[60px]"
                    />
                  </div>
                </div>

                {/* Meta */}
                <div className="text-[10px] text-muted-foreground space-y-0.5">
                  <p>Created: {formatTime(selectedOrder.created_at)}</p>
                  <p>Updated: {formatTime(selectedOrder.updated_at)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete((s) => ({ ...s, open }))}
        title={`Delete order ${confirmDelete.order?.order_number}?`}
        description="This order and all its items will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmDelete.order && doDeleteOrder(confirmDelete.order)}
      />
    </div>
  );
};

export default AdminOrders;
