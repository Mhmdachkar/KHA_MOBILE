import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Upload, Plus, Trash2, GripVertical, Star,
  Image as ImageIcon, Video, Check, AlertCircle, Eye, EyeOff,
  Package, Tag, Info, Layers, Palette,
} from "lucide-react";
import { adminFetch, apiBase, getAdminToken } from "@/lib/adminApi";
import { useCatalog } from "@/context/CatalogContext";
import { resolvePrimaryImageWithStaticFallback } from "@/data/productLookup";
import { resolveImageUrl } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Spec { label: string; value: string }
interface Variant { key: string; label: string; ram: string; storage: string; price: number; description: string }
interface ColorOption { name: string; price: number | ""; stock: string; image: string }
interface SizeOption { name: string; price: number | ""; stock: string; description: string }

interface FormState {
  legacyOverrideId: string;
  name: string;
  title: string;
  description: string;
  price: string;
  compareAtPrice: string;
  primaryImageUrl: string;
  rating: string;
  category: string;
  brand: string;
  videoUrl: string;
  isPreorder: boolean;
  isActive: boolean;
  features: string[];
  specifications: Spec[];
  variants: Variant[];
  colors: ColorOption[];
  sizes: SizeOption[];
  connectivityOptions: string[];
  secondaryCategories: string[];
  galleryImages: string[];
  stockQuantity: string;
}

const CATEGORIES = [
  "Smartphones", "Tablets", "Audio", "Computers", "Wearables",
  "Gaming", "Accessories", "Charging", "Electronics", "Other",
];

const TABS = [
  { id: "basics", label: "Basics", icon: Package },
  { id: "images", label: "Images & Media", icon: ImageIcon },
  { id: "content", label: "Content", icon: Info },
  { id: "specs", label: "Specifications", icon: Layers },
  { id: "options", label: "Variants & Colors", icon: Palette },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ─── Helpers ────────────────────────────────────────────────────────────────
const emptyForm = (): FormState => ({
  legacyOverrideId: "", name: "", title: "", description: "",
  price: "", compareAtPrice: "", primaryImageUrl: "", rating: "4.5", category: "Smartphones",
  brand: "", videoUrl: "", isPreorder: false, isActive: true,
  features: [""], specifications: [{ label: "", value: "" }],
  variants: [], colors: [], sizes: [], connectivityOptions: [], secondaryCategories: [], galleryImages: [],
  stockQuantity: "",
});

const StarRating = ({ value }: { value: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={cn("h-3.5 w-3.5", i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
    ))}
    <span className="text-xs text-muted-foreground ml-1">{value}</span>
  </div>
);

// ─── Reusable row builders ───────────────────────────────────────────────────
const FeatureRow = ({
  value, onChange, onRemove, onAdd, isLast,
}: { value: string; onChange: (v: string) => void; onRemove: () => void; onAdd: () => void; isLast: boolean }) => (
  <div className="flex items-start gap-2">
    <GripVertical className="h-4 w-4 mt-2.5 text-muted-foreground/40 shrink-0" />
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Feature description…"
      className="flex-1 text-sm"
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
    />
    <Button
      variant="ghost" size="icon" className="h-9 w-9 shrink-0 hover:bg-red-500/10 hover:text-red-500"
      onClick={onRemove} type="button"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  </div>
);

const SpecRow = ({
  spec, onChange, onRemove,
}: { spec: Spec; onChange: (s: Spec) => void; onRemove: () => void }) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
    <Input
      placeholder="Label (e.g. Battery)"
      value={spec.label}
      onChange={(e) => onChange({ ...spec, label: e.target.value })}
      className="w-full sm:w-36 sm:shrink-0 text-sm"
    />
    <Input
      placeholder="Value (e.g. 5000mAh)"
      value={spec.value}
      onChange={(e) => onChange({ ...spec, value: e.target.value })}
      className="flex-1 text-sm"
    />
    <Button
      variant="ghost" size="icon" className="h-9 w-9 shrink-0 hover:bg-red-500/10 hover:text-red-500 touch-manipulation self-end sm:self-auto"
      style={{ touchAction: 'manipulation' }}
      onClick={onRemove} type="button"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const AdminProductEditor = () => {
  const { dbId } = useParams<{ dbId: string }>();
  const isNew = !dbId || dbId === "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshCatalog } = useCatalog();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("basics");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [savedForm, setSavedForm] = useState<FormState>(emptyForm);
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  useUnsavedChanges(isDirty);

  const patch = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  // ── Load existing product ──
  useEffect(() => {
    if (isNew || !dbId) return;
    let cancelled = false;
    (async () => {
      console.log('[AdminProductEditor] Loading product, dbId:', dbId);
      setLoading(true);
      try {
        const res = await adminFetch(`/api/admin/products/${dbId}`);
        console.log('[AdminProductEditor] Load response status:', res.status);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.product) {
          console.error('[AdminProductEditor] Load failed:', data.error || 'Product not found');
          toast({ variant: "destructive", title: "Load failed", description: data.error || "Product not found" });
          navigate("/admin/products");
          return;
        }
        if (cancelled) return;
        console.log('[AdminProductEditor] Product loaded successfully:', data.product.name);
        const p = data.product;
        const displayPrimary = resolvePrimaryImageWithStaticFallback({
          id: p.id,
          image: p.image,
          legacyOverrideId: p.legacyOverrideId ?? null,
        });
        const loaded: FormState = {
          legacyOverrideId: p.legacyOverrideId != null ? String(p.legacyOverrideId) : "",
          name: p.name || "",
          title: p.title || "",
          description: p.description || "",
          price: String(p.price ?? ""),
          compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
          primaryImageUrl: displayPrimary,
          rating: String(p.rating ?? "4.5"),
          category: p.category || "Smartphones",
          brand: p.brand || "",
          videoUrl: p.video || "",
          isPreorder: Boolean(p.isPreorder),
          isActive: p.isActive !== false,
          features: (p.features?.length ? p.features : [""]),
          specifications: (p.specifications?.length ? p.specifications : [{ label: "", value: "" }]),
          variants: (p.variants || []).map((v: Variant) => ({
            key: v.key || "", label: v.label || "", ram: v.ram || "",
            storage: v.storage || "", price: v.price ?? 0, description: v.description || "",
          })),
          colors: (p.colors || []).map((c: ColorOption) => ({
            name: c.name || "", price: c.price ?? "", stock: c.stock || "available", image: c.image || "",
          })),
          sizes: (p.sizes || []).map((s: SizeOption) => ({
            name: s.name || "", price: s.price ?? "", stock: s.stock || "available", description: s.description || "",
          })),
          connectivityOptions: p.connectivityOptions || [],
          secondaryCategories: p.secondaryCategories || [],
          galleryImages: (p.images || []).filter(
            (u: string) => u && u !== p.image && u !== displayPrimary
          ),
          stockQuantity: p.stockQuantity != null ? String(p.stockQuantity) : "",
        };
        setForm(loaded);
        setSavedForm(loaded);
      } catch (err) {
        if (!cancelled) {
          toast({ variant: "destructive", title: "Load failed", description: "Network error — check your connection" });
          navigate("/admin/products");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [dbId, isNew, navigate, toast]);

  // ── Upload helper ──
  const uploadFile = async (file: File) => {
    console.log('[AdminProductEditor] Uploading file:', file.name, 'size:', file.size, 'type:', file.type);
    const fd = new FormData();
    fd.append("file", file);
    const token = getAdminToken();
    const res = await fetch(`${apiBase()}/api/admin/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
      cache: "no-store",
    });
    console.log('[AdminProductEditor] Upload response status:', res.status);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[AdminProductEditor] Upload failed:', data);
      throw new Error(data.error || "Upload failed");
    }
    console.log('[AdminProductEditor] Upload successful, URL:', data.url);
    return data.url as string;
  };

  const pickAndUpload = (accept: string, multi: boolean, onDone: (urls: string[]) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = multi;
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      if (!files.length) return;
      try {
        const urls = await Promise.all(files.map(uploadFile));
        onDone(urls);
        toast({ title: `Uploaded ${urls.length} file(s)` });
      } catch (e) {
        toast({ variant: "destructive", title: "Upload failed", description: (e as Error).message });
      }
    };
    input.click();
  };

  // ── Save ──
  const save = async () => {
    if (!form.name.trim()) {
      toast({ variant: "destructive", title: "Name is required" });
      setActiveTab("basics");
      return;
    }
    const priceNum = Number(form.price);
    if (form.price.trim() === "" || isNaN(priceNum) || priceNum < 0) {
      toast({ variant: "destructive", title: "Valid price is required (must be 0 or greater)" });
      setActiveTab("basics");
      return;
    }
    if (form.compareAtPrice && Number(form.compareAtPrice) <= priceNum) {
      toast({ variant: "destructive", title: "'Compare At' price must be greater than sale price" });
      setActiveTab("basics");
      return;
    }
    if (form.legacyOverrideId && (isNaN(Number(form.legacyOverrideId)) || Number(form.legacyOverrideId) < 0)) {
      toast({ variant: "destructive", title: "Legacy Override ID must be a valid positive number" });
      setActiveTab("basics");
      return;
    }
    const ratingNum = Number(form.rating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      toast({ variant: "destructive", title: "Rating must be between 0 and 5" });
      setActiveTab("basics");
      return;
    }
    setSaving(true);
    try {
      const legacy = form.legacyOverrideId === "" ? null : Number(form.legacyOverrideId);
      const body = {
        legacyOverrideId: legacy,
        name: form.name.trim(),
        title: form.title.trim() || form.name.trim(),
        description: form.description,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        primaryImageUrl: form.primaryImageUrl.trim(),
        rating: Number(form.rating),
        category: form.category.trim(),
        brand: form.brand.trim() || undefined,
        videoUrl: form.videoUrl.trim() || undefined,
        isPreorder: form.isPreorder,
        isActive: form.isActive,
        features: form.features.map((f) => f.trim()).filter(Boolean),
        specifications: form.specifications.filter((s) => s.label.trim()),
        variants: form.variants,
        colors: form.colors.map((c) => ({ ...c, price: c.price === "" ? undefined : Number(c.price) })),
        sizes: form.sizes.map((s) => ({ ...s, price: s.price === "" ? undefined : Number(s.price) })),
        connectivityOptions: form.connectivityOptions.filter(Boolean),
        secondaryCategories: form.secondaryCategories.filter(Boolean),
        galleryImages: form.galleryImages.filter(Boolean),
        stockQuantity: form.stockQuantity !== "" ? Number(form.stockQuantity) : null,
      };
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${dbId}`;
      const res = await adminFetch(url, { method: isNew ? "POST" : "PUT", body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Save failed",
          description: [data.error, data.detail].filter(Boolean).join(" — ") || res.statusText,
        });
        return;
      }
      setSavedForm({ ...form });
      toast({ title: isNew ? "Product created!" : "Changes saved" });
      await refreshCatalog();
      if (isNew && data.product?.dbId) {
        navigate(`/admin/products/${data.product.dbId}`, { replace: true });
      } else {
        navigate("/admin/products");
      }
    } catch {
      toast({ variant: "destructive", title: "Save failed", description: "Network error — check your connection" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading product…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] sm:min-h-screen">
      {/* ── Top bar ── */}
      <div className="sticky top-0 sm:top-0 z-20 bg-background/95 backdrop-blur border-b px-4 sm:px-6 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 touch-manipulation" style={{ touchAction: 'manipulation' }} asChild>
          <Link to="/admin/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base sm:text-lg truncate">
            {isNew ? "New Product" : `Edit: ${form.name || `#${dbId}`}`}
          </h1>
          {!isNew && (
            <p className="text-xs text-muted-foreground">DB #{dbId}{form.legacyOverrideId ? ` · overrides static #${form.legacyOverrideId}` : ""}</p>
          )}
        </div>
        {/* Status badges */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-1.5 cursor-pointer"
            onClick={() => patch("isActive", !form.isActive)}
          >
            {form.isActive
              ? <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"><Check className="h-3 w-3" />Active</Badge>
              : <Badge variant="outline" className="gap-1 text-muted-foreground hover:bg-muted"><EyeOff className="h-3 w-3" />Inactive</Badge>
            }
          </div>
          {form.isPreorder && <Badge className="bg-violet-500/15 text-violet-600 border-violet-500/30">Pre-order</Badge>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild className="hidden sm:flex">
            <Link to="/admin/products">Cancel</Link>
          </Button>
          <Button size="sm" onClick={() => void save()} disabled={saving} className="min-w-[80px] touch-manipulation" style={{ touchAction: 'manipulation' }}>
            {saving ? (
              <span className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />
                Saving…
              </span>
            ) : "Save"}
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b bg-muted/20">
        <div className="flex overflow-x-auto px-4 sm:px-6 no-scrollbar">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-all shrink-0 whitespace-nowrap touch-manipulation",
                activeTab === id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              style={{ touchAction: 'manipulation' }}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">

          {/* ──────── BASICS ──────── */}
          {activeTab === "basics" && (
            <div className="space-y-5">
              {/* Primary photo — quick upload right on the Basics tab */}
              <SectionCard title="Product Photo" description="Main image shown in listings and the product page.">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 h-24 w-24 rounded-xl border bg-muted/40 overflow-hidden flex items-center justify-center">
                    {form.primaryImageUrl ? (
                      <img
                        src={resolveImageUrl(form.primaryImageUrl)}
                        alt="Primary"
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline" size="sm" type="button"
                        className="touch-manipulation"
                        style={{ touchAction: 'manipulation' }}
                        onClick={() => pickAndUpload("image/*", false, ([url]) => patch("primaryImageUrl", url))}
                      >
                        <Upload className="h-3.5 w-3.5 mr-1.5" />Upload Photo
                      </Button>
                      {form.primaryImageUrl && (
                        <Button
                          variant="ghost" size="sm" type="button"
                          className="text-muted-foreground hover:text-red-500"
                          onClick={() => patch("primaryImageUrl", "")}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <Input
                      value={form.primaryImageUrl}
                      onChange={(e) => patch("primaryImageUrl", e.target.value)}
                      placeholder="Or paste an image URL…"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">JPEG, PNG, WebP up to 8 MB. You can also add extra gallery photos in the Images & Media tab.</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Identity" description="Core product information shown on the storefront.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Product Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={form.name}
                      onChange={(e) => patch("name", e.target.value)}
                      placeholder="e.g. iPhone 16 Pro Max"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Full Title <span className="text-xs text-muted-foreground">(shown on product page)</span></Label>
                    <Input
                      value={form.title}
                      onChange={(e) => patch("title", e.target.value)}
                      placeholder="Defaults to name if left blank"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category <span className="text-red-500">*</span></Label>
                    <select
                      value={form.category}
                      onChange={(e) => patch("category", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Brand</Label>
                    <Input
                      value={form.brand}
                      onChange={(e) => patch("brand", e.target.value)}
                      placeholder="e.g. Apple, Samsung…"
                    />
                  </div>

                  {/* Pricing row */}
                  <div className="space-y-1.5">
                    <Label>Sale Price (USD) <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number" step="0.01" min={0}
                        className="pl-7"
                        value={form.price}
                        onChange={(e) => patch("price", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Label>Compare At (was)</Label>
                      {form.compareAtPrice && form.price &&
                        Number(form.compareAtPrice) > Number(form.price) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-0.5">
                          {Math.round((1 - Number(form.price) / Number(form.compareAtPrice)) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number" step="0.01" min={0}
                        className="pl-7"
                        value={form.compareAtPrice}
                        onChange={(e) => patch("compareAtPrice", e.target.value)}
                        placeholder="Original price (optional)"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Leave blank if no discount applies.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Rating</Label>
                    <Input
                      type="number" step="0.1" min={0} max={5}
                      value={form.rating}
                      onChange={(e) => patch("rating", e.target.value)}
                    />
                    {form.rating !== "" && <StarRating value={parseFloat(form.rating) || 0} />}
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Visibility & Status" description="Control whether this product appears on the storefront.">
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium">Active on storefront</p>
                      <p className="text-xs text-muted-foreground">Customers can see and purchase this product.</p>
                    </div>
                    <Switch checked={form.isActive} onCheckedChange={(v) => patch("isActive", v)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium">Pre-order</p>
                      <p className="text-xs text-muted-foreground">Shows a pre-order badge and note on the product page.</p>
                    </div>
                    <Switch checked={form.isPreorder} onCheckedChange={(v) => patch("isPreorder", v)} />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Stock Tracking" description="Manage inventory. Leave blank for unlimited stock.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number" min={0} step={1}
                      value={form.stockQuantity}
                      onChange={(e) => patch("stockQuantity", e.target.value)}
                      placeholder="Unlimited (blank)"
                    />
                    <p className="text-xs text-muted-foreground">Leave blank for unlimited. Set 0 to mark as out of stock.</p>
                  </div>
                  <div className="flex items-end pb-1">
                    {form.stockQuantity !== "" && (
                      <Badge
                        variant={Number(form.stockQuantity) === 0 ? "destructive" : Number(form.stockQuantity) <= 5 ? "outline" : "secondary"}
                        className="text-xs"
                      >
                        {Number(form.stockQuantity) === 0
                          ? "Out of Stock"
                          : Number(form.stockQuantity) <= 5
                          ? `Low Stock (${form.stockQuantity})`
                          : `${form.stockQuantity} in stock`}
                      </Badge>
                    )}
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Static Override"
                description="Optional: link this product to a static fallback. If set, this DB entry overrides the static TypeScript product with the matching ID."
              >
                <div className="space-y-1.5">
                  <Label>Legacy Override ID</Label>
                  <Input
                    value={form.legacyOverrideId}
                    onChange={(e) => patch("legacyOverrideId", e.target.value)}
                    placeholder="e.g. 500 (iPhone 16 static ID)"
                  />
                  {form.legacyOverrideId && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Overrides static product #{form.legacyOverrideId}
                    </p>
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Secondary Categories" description="Also display this product in additional categories.">
                <TagList
                  items={form.secondaryCategories}
                  onChange={(v) => patch("secondaryCategories", v)}
                  placeholder="Add category (press Enter)"
                />
              </SectionCard>

              <SectionCard title="Connectivity Options" description="List supported connectivity options (Wi-Fi, Bluetooth, 5G, etc.).">
                <TagList
                  items={form.connectivityOptions}
                  onChange={(v) => patch("connectivityOptions", v)}
                  placeholder="e.g. Wi-Fi 7, Bluetooth 5.3…"
                />
              </SectionCard>
            </div>
          )}

          {/* ──────── IMAGES & MEDIA ──────── */}
          {activeTab === "images" && (
            <div className="space-y-5">
              <SectionCard title="Primary Image" description="The main thumbnail shown in product cards and listings.">
                <div className="space-y-3">
                  {form.primaryImageUrl && (
                    <div className="rounded-xl overflow-hidden border bg-muted/30 aspect-square max-w-[200px]">
                      <img
                        src={resolveImageUrl(form.primaryImageUrl)}
                        alt="Primary"
                        className="h-full w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={form.primaryImageUrl}
                      onChange={(e) => patch("primaryImageUrl", e.target.value)}
                      placeholder="https://… or upload →"
                      className="flex-1 text-sm"
                    />
                    <Button
                      variant="outline" size="sm" type="button"
                      onClick={() => pickAndUpload("image/*", false, ([url]) => patch("primaryImageUrl", url))}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />Upload
                    </Button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Gallery Images" description="Additional photos shown in the product image carousel.">
                <div className="space-y-3">
                  {/* Preview grid */}
                  {form.galleryImages.filter(Boolean).length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {form.galleryImages.filter(Boolean).map((url, i) => (
                        <div key={url + i} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted/30">
                          <img
                            src={resolveImageUrl(url)}
                            alt={`Gallery ${i + 1}`}
                            className="h-full w-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                          />
                          <button
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => patch("galleryImages", form.galleryImages.filter((u) => u !== url))}
                            type="button"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Add URL row */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Paste image URL and press Enter…"
                      className="flex-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            patch("galleryImages", [...form.galleryImages, val]);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline" size="sm" type="button"
                      onClick={() => pickAndUpload("image/*,video/mp4", true, (urls) =>
                        patch("galleryImages", [...form.galleryImages, ...urls])
                      )}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Accepted: images and MP4 video. Press Enter after pasting a URL to add it.</p>
                </div>
              </SectionCard>

              <SectionCard title="Product Video" description="Optional YouTube embed URL or direct MP4 video for the product page.">
                <div className="flex gap-2">
                  <Video className="h-4 w-4 mt-2.5 text-muted-foreground shrink-0" />
                  <Input
                    value={form.videoUrl}
                    onChange={(e) => patch("videoUrl", e.target.value)}
                    placeholder="https://youtube.com/watch?v=… or direct .mp4 URL"
                  />
                </div>
              </SectionCard>
            </div>
          )}

          {/* ──────── CONTENT ──────── */}
          {activeTab === "content" && (
            <div className="space-y-5">
              <SectionCard title="Description" description="Full product description shown on the product detail page.">
                <Textarea
                  rows={8}
                  value={form.description}
                  onChange={(e) => patch("description", e.target.value)}
                  placeholder="Describe the product in detail — features, use cases, what's in the box…"
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">{form.description.length} characters</p>
              </SectionCard>

              <SectionCard title="Key Features" description="Bullet points shown prominently on the product page. Press Enter to add a new line.">
                <div className="space-y-2">
                  {form.features.map((feat, i) => (
                    <FeatureRow
                      key={i}
                      value={feat}
                      onChange={(v) => {
                        const next = [...form.features];
                        next[i] = v;
                        patch("features", next);
                      }}
                      onRemove={() => {
                        if (form.features.length <= 1) return;
                        patch("features", form.features.filter((_, idx) => idx !== i));
                      }}
                      onAdd={() => {
                        const next = [...form.features];
                        next.splice(i + 1, 0, "");
                        patch("features", next);
                      }}
                      isLast={i === form.features.length - 1}
                    />
                  ))}
                  <Button
                    variant="outline" size="sm" type="button"
                    className="w-full border-dashed text-muted-foreground hover:text-foreground"
                    onClick={() => patch("features", [...form.features, ""])}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Add Feature
                  </Button>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ──────── SPECIFICATIONS ──────── */}
          {activeTab === "specs" && (
            <div className="space-y-5">
              <SectionCard title="Technical Specifications" description="Label/value pairs shown in the specifications table on the product page.">
                <div className="space-y-2">
                  {form.specifications.map((spec, i) => (
                    <SpecRow
                      key={i}
                      spec={spec}
                      onChange={(s) => {
                        const next = [...form.specifications];
                        next[i] = s;
                        patch("specifications", next);
                      }}
                      onRemove={() => {
                        if (form.specifications.length <= 1) return;
                        patch("specifications", form.specifications.filter((_, idx) => idx !== i));
                      }}
                    />
                  ))}
                  <Button
                    variant="outline" size="sm" type="button"
                    className="w-full border-dashed text-muted-foreground hover:text-foreground"
                    onClick={() => patch("specifications", [...form.specifications, { label: "", value: "" }])}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Add Specification
                  </Button>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ──────── VARIANTS & COLORS ──────── */}
          {activeTab === "options" && (
            <div className="space-y-5">
              {/* Variants */}
              <SectionCard title="Storage / RAM Variants" description="E.g. 128GB vs 256GB with different prices.">
                <div className="space-y-3">
                  {form.variants.map((v, i) => (
                    <div key={i} className="rounded-xl border p-4 space-y-3 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Variant {i + 1}</p>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => patch("variants", form.variants.filter((_, idx) => idx !== i))}
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Label</Label>
                          <Input value={v.label} onChange={(e) => {
                            const n = [...form.variants]; n[i] = { ...v, label: e.target.value }; patch("variants", n);
                          }} placeholder="e.g. 128GB" className="text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price (USD)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                            <Input type="number" step="0.01" className="pl-6 text-sm" value={v.price} onChange={(e) => {
                              const n = [...form.variants]; n[i] = { ...v, price: Number(e.target.value) }; patch("variants", n);
                            }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Storage</Label>
                          <Input value={v.storage} onChange={(e) => {
                            const n = [...form.variants]; n[i] = { ...v, storage: e.target.value }; patch("variants", n);
                          }} placeholder="e.g. 128GB" className="text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">RAM</Label>
                          <Input value={v.ram} onChange={(e) => {
                            const n = [...form.variants]; n[i] = { ...v, ram: e.target.value }; patch("variants", n);
                          }} placeholder="e.g. 8GB" className="text-sm" />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label className="text-xs">Key (unique identifier)</Label>
                          <Input value={v.key} onChange={(e) => {
                            const n = [...form.variants]; n[i] = { ...v, key: e.target.value }; patch("variants", n);
                          }} placeholder="e.g. iphone16-128gb" className="text-sm font-mono" />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label className="text-xs">Description (optional)</Label>
                          <Input value={v.description} onChange={(e) => {
                            const n = [...form.variants]; n[i] = { ...v, description: e.target.value }; patch("variants", n);
                          }} placeholder="Short description for this variant" className="text-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline" size="sm" type="button"
                    className="w-full border-dashed text-muted-foreground hover:text-foreground"
                    onClick={() => patch("variants", [...form.variants, { key: "", label: "", ram: "", storage: "", price: 0, description: "" }])}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Add Variant
                  </Button>
                </div>
              </SectionCard>

              {/* Colors */}
              <SectionCard title="Color Options" description="Available color variants with optional price differences and images.">
                <div className="space-y-3">
                  {form.colors.map((c, i) => (
                    <div key={i} className="rounded-xl border p-4 space-y-3 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium flex items-center gap-2">
                          {c.name && <span className="inline-block h-4 w-4 rounded-full border" style={{ background: c.name.toLowerCase() }} />}
                          {c.name || `Color ${i + 1}`}
                        </p>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => patch("colors", form.colors.filter((_, idx) => idx !== i))}
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Color Name</Label>
                          <Input value={c.name} onChange={(e) => {
                            const n = [...form.colors]; n[i] = { ...c, name: e.target.value }; patch("colors", n);
                          }} placeholder="e.g. Midnight Black" className="text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Stock</Label>
                          <select
                            value={c.stock}
                            onChange={(e) => { const n = [...form.colors]; n[i] = { ...c, stock: e.target.value }; patch("colors", n); }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="available">Available</option>
                            <option value="limited">Limited</option>
                            <option value="out of stock">Out of Stock</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price Override (optional)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                            <Input type="number" step="0.01" className="pl-6 text-sm"
                              value={c.price === "" ? "" : c.price}
                              onChange={(e) => { const n = [...form.colors]; n[i] = { ...c, price: e.target.value === "" ? "" : Number(e.target.value) }; patch("colors", n); }}
                              placeholder="Leave blank = base price"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Color Image (optional)</Label>
                          <div className="flex gap-1.5">
                            <Input value={c.image} onChange={(e) => {
                              const n = [...form.colors]; n[i] = { ...c, image: e.target.value }; patch("colors", n);
                            }} placeholder="URL or upload" className="text-sm flex-1" />
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" type="button"
                              onClick={() => pickAndUpload("image/*", false, ([url]) => {
                                const n = [...form.colors]; n[i] = { ...c, image: url }; patch("colors", n);
                              })}
                            ><Upload className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline" size="sm" type="button"
                    className="w-full border-dashed text-muted-foreground hover:text-foreground"
                    onClick={() => patch("colors", [...form.colors, { name: "", price: "", stock: "available", image: "" }])}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Add Color
                  </Button>
                </div>
              </SectionCard>

              {/* Sizes */}
              <SectionCard title="Size Options" description="For clothing, cases, or other size-based variants.">
                <div className="space-y-3">
                  {form.sizes.map((s, i) => (
                    <div key={i} className="rounded-xl border p-3 bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{s.name || `Size ${i + 1}`}</p>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => patch("sizes", form.sizes.filter((_, idx) => idx !== i))}
                          type="button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Size</Label>
                          <Input value={s.name} onChange={(e) => { const n = [...form.sizes]; n[i] = { ...s, name: e.target.value }; patch("sizes", n); }} placeholder="S / M / L…" className="text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price</Label>
                          <Input type="number" step="0.01" value={s.price === "" ? "" : s.price}
                            onChange={(e) => { const n = [...form.sizes]; n[i] = { ...s, price: e.target.value === "" ? "" : Number(e.target.value) }; patch("sizes", n); }}
                            className="text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Stock</Label>
                          <select value={s.stock}
                            onChange={(e) => { const n = [...form.sizes]; n[i] = { ...s, stock: e.target.value }; patch("sizes", n); }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="available">Available</option>
                            <option value="limited">Limited</option>
                            <option value="out of stock">Out of Stock</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline" size="sm" type="button"
                    className="w-full border-dashed text-muted-foreground hover:text-foreground"
                    onClick={() => patch("sizes", [...form.sizes, { name: "", price: "", stock: "available", description: "" }])}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Add Size
                  </Button>
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile save bar ── */}
      <div className="sm:hidden sticky bottom-0 z-30 border-t bg-background/95 backdrop-blur px-4 py-3 flex gap-2">
        <Button variant="outline" className="flex-1 touch-manipulation" style={{ touchAction: 'manipulation' }} asChild>
          <Link to="/admin/products">Cancel</Link>
        </Button>
        <Button className="flex-1 touch-manipulation" style={{ touchAction: 'manipulation' }} onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

// ─── SectionCard ─────────────────────────────────────────────────────────────
const SectionCard = ({
  title, description, children,
}: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="rounded-xl border bg-card overflow-hidden">
    <div className="px-5 py-4 border-b bg-muted/20">
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <div className="px-5 py-4">{children}</div>
  </div>
);

// ─── TagList ─────────────────────────────────────────────────────────────────
const TagList = ({
  items, onChange, placeholder,
}: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) => {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setInput("");
  };
  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span key={item} className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-xs font-medium">
              {item}
              <button
                type="button"
                className="ml-0.5 hover:text-red-500 transition-colors"
                onClick={() => onChange(items.filter((i) => i !== item))}
              >×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="text-sm"
        />
        <Button variant="outline" size="sm" type="button" onClick={add} disabled={!input.trim()}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default AdminProductEditor;
