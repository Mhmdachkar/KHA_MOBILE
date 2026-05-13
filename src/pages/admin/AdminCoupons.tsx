import { useState, useEffect, useCallback } from "react";
import {
  Ticket, Plus, Search, Trash2, Pencil, X, Check, Copy, Percent, DollarSign,
  Calendar, AlertCircle, ToggleLeft, ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";

interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const emptyCoupon = {
  code: "",
  description: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: 10,
  min_order_amount: null as number | null,
  max_discount_amount: null as number | null,
  max_uses: null as number | null,
  is_active: true,
  starts_at: "",
  expires_at: "",
};

const AdminCoupons = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await adminFetch(`/api/admin/coupons${params}`);
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {
      toast({ title: "Error", description: "Failed to load coupons", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => { void fetchCoupons(); }, [fetchCoupons]);

  const openNew = () => {
    setForm(emptyCoupon);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      description: c.description,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount,
      max_discount_amount: c.max_discount_amount,
      max_uses: c.max_uses,
      is_active: c.is_active,
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : "",
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.code.trim()) {
      toast({ title: "Code required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
        min_order_amount: form.min_order_amount || null,
        max_discount_amount: form.max_discount_amount || null,
        max_uses: form.max_uses || null,
      };
      const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
      const method = editingId ? "PUT" : "POST";
      const res = await adminFetch(url, { method, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      toast({ title: editingId ? "Coupon updated" : "Coupon created" });
      setShowForm(false);
      void fetchCoupons();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      const res = await adminFetch(`/api/admin/coupons/${c.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !c.is_active }),
      });
      if (!res.ok) throw new Error("Failed");
      void fetchCoupons();
    } catch {
      toast({ title: "Error", description: "Failed to toggle coupon", variant: "destructive" });
    }
  };

  const deleteCoupon = async (c: Coupon) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    try {
      const res = await adminFetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Coupon deleted" });
      void fetchCoupons();
    } catch {
      toast({ title: "Error", description: "Failed to delete coupon", variant: "destructive" });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: `"${code}" copied to clipboard` });
  };

  const isExpired = (c: Coupon) => c.expires_at && new Date(c.expires_at) < new Date();
  const isUsedUp = (c: Coupon) => c.max_uses != null && c.used_count >= c.max_uses;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Coupons & Discounts
          </h1>
          <Button size="sm" onClick={openNew} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Coupon
          </Button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupons…"
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Form panel */}
      {showForm && (
        <div className="border-b bg-muted/20 px-4 sm:px-6 py-5">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">
                {editingId ? "Edit Coupon" : "Create New Coupon"}
              </h2>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Coupon Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER20"
                  className="text-sm font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="20% off summer sale"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Discount Type</Label>
                <select
                  value={form.discount_type}
                  onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Discount Value *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                    {form.discount_type === "percentage" ? "%" : "$"}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                    className="pl-7 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Min Order Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.min_order_amount ?? ""}
                    onChange={(e) => setForm({ ...form, min_order_amount: e.target.value ? Number(e.target.value) : null })}
                    placeholder="No minimum"
                    className="pl-7 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Discount Amount (for %)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.max_discount_amount ?? ""}
                    onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value ? Number(e.target.value) : null })}
                    placeholder="No cap"
                    className="pl-7 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Uses</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.max_uses ?? ""}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Unlimited"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Starts At</Label>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Expires At</Label>
                <Input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Saving…" : editingId ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon list */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No coupons yet</p>
            <p className="text-sm mt-1">Create your first coupon to offer discounts.</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            {coupons.map((c) => (
              <div
                key={c.id}
                className={`rounded-xl border p-4 transition-colors ${
                  !c.is_active || isExpired(c) || isUsedUp(c) ? "opacity-60 bg-muted/30" : "bg-card hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm tracking-wider">{c.code}</span>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        onClick={() => copyCode(c.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {c.discount_type === "percentage" ? (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Percent className="h-3 w-3" />
                          {c.discount_value}% off
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <DollarSign className="h-3 w-3" />
                          ${c.discount_value} off
                        </Badge>
                      )}
                      {!c.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                      {isExpired(c) && <Badge variant="destructive" className="text-xs">Expired</Badge>}
                      {isUsedUp(c) && <Badge variant="destructive" className="text-xs">Used Up</Badge>}
                    </div>
                    {c.description && (
                      <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {c.min_order_amount != null && <span>Min: ${Number(c.min_order_amount).toFixed(2)}</span>}
                      {c.max_discount_amount != null && <span>Cap: ${Number(c.max_discount_amount).toFixed(2)}</span>}
                      <span>Used: {c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ""}</span>
                      {c.expires_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(c.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(c)}>
                      {c.is_active ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                      onClick={() => deleteCoupon(c)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
