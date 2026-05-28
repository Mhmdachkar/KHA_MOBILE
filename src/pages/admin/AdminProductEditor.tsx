import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Upload, Plus, Trash2, GripVertical, Star,
  Image as ImageIcon, Video, Check, AlertCircle, Eye, EyeOff,
  Package, Tag, Info, Layers, Palette,
} from "lucide-react";
import { adminFetch, apiBase, getAdminToken } from "@/lib/adminApi";
import { useCatalog } from "@/context/CatalogContext";
import { notifyStorefrontCatalogUpdate } from "@/lib/storefrontCatalogSync";
import { getStorefrontProductById } from "@/lib/catalogProduct";
import { resolvePrimaryImageWithStaticFallback } from "@/data/productLookup";
import { resolveImageUrl } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CANONICAL_STOREFRONT_CATEGORIES, normalizeStorefrontCategory } from "@/lib/storefrontCategories";
import { getDistinctBrandsFromStorefront } from "@/lib/adminCatalogTaxonomy";
import { AdminBrandCombobox } from "@/components/admin/AdminBrandCombobox";
import { cn } from "@/lib/utils";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { computeCatalogSaveFromBasics, formPricesFromLoadedProduct } from "@/lib/adminProductPricing";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Spec { label: string; value: string }
interface Variant { key: string; label: string; ram: string; storage: string; price: number | string; description: string }
interface ColorOption { name: string; price: number | string; stock: string; image: string }
interface SizeOption { name: string; price: number | string; stock: string; description: string }

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
  /** When pre-order: if false, storefront hides the dollar amount. */
  showPreorderPrice: boolean;
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

const BASE_CATEGORIES = [...CANONICAL_STOREFRONT_CATEGORIES];

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
  brand: "", videoUrl: "", isPreorder: false, showPreorderPrice: true, isActive: true,
  features: [""], specifications: [{ label: "", value: "" }],
  variants: [], colors: [], sizes: [], connectivityOptions: [], secondaryCategories: [], galleryImages: [],
  stockQuantity: "",
});

function asStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    const items = val.map((x) => String(x ?? "").trim()).filter(Boolean);
    return items.length ? items : [""];
  }
  if (typeof val === "string" && val.trim()) return [val.trim()];
  return [""];
}

function asStringList(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.map((x) => String(x ?? "").trim()).filter(Boolean);
}

function asSpecArray(val: unknown): Spec[] {
  if (!Array.isArray(val) || val.length === 0) return [{ label: "", value: "" }];
  return val.map((s) => ({
    label: String((s as Spec)?.label ?? ""),
    value: String((s as Spec)?.value ?? ""),
  }));
}

function asVariantArray(val: unknown): Variant[] {
  if (!Array.isArray(val)) return [];
  return val.map((v) => ({
    key: String((v as Variant)?.key ?? ""),
    label: String((v as Variant)?.label ?? ""),
    ram: String((v as Variant)?.ram ?? ""),
    storage: String((v as Variant)?.storage ?? ""),
    price: (v as Variant)?.price ?? 0,
    description: String((v as Variant)?.description ?? ""),
  }));
}

function asColorArray(val: unknown): ColorOption[] {
  if (!Array.isArray(val)) return [];
  return val.map((c) => ({
    name: String((c as ColorOption)?.name ?? ""),
    price: (c as ColorOption)?.price ?? "",
    stock: String((c as ColorOption)?.stock ?? "available"),
    image: String((c as ColorOption)?.image ?? ""),
  }));
}

function asSizeArray(val: unknown): SizeOption[] {
  if (!Array.isArray(val)) return [];
  return val.map((s) => ({
    name: String((s as SizeOption)?.name ?? ""),
    price: (s as SizeOption)?.price ?? "",
    stock: String((s as SizeOption)?.stock ?? "available"),
    description: String((s as SizeOption)?.description ?? ""),
  }));
}

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
  const { refreshCatalog, storefrontProducts, catalogLoaded } = useCatalog();
  const [searchParams] = useSearchParams();
  const overrideStorefrontId = searchParams.get("override");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("basics");
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [savedForm, setSavedForm] = useState<FormState>(() => emptyForm());
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  useUnsavedChanges(isDirty);
  const brandSuggestions = useMemo(
    () => getDistinctBrandsFromStorefront(storefrontProducts),
    [storefrontProducts]
  );
  const normalizedCategory = normalizeStorefrontCategory(form.category);

  const patch = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  // Prefill new product from a bundled storefront id (?override=127)
  useEffect(() => {
    if (!isNew || !overrideStorefrontId || !catalogLoaded) return;
    const id = Number(overrideStorefrontId);
    if (!Number.isFinite(id)) return;
    const sp = getStorefrontProductById(storefrontProducts, id);
    if (!sp) return;
    const prefill: FormState = {
      ...emptyForm(),
      legacyOverrideId: String(id),
      name: sp.name,
      title: sp.title || sp.name,
      description: sp.description || "",
      price: String(sp.displayPrice ?? sp.price),
      compareAtPrice: sp.compareAtPrice != null ? String(sp.compareAtPrice) : "",
      primaryImageUrl: sp.image || sp.images?.[0] || "",
      rating: String(sp.rating ?? "4.5"),
      category: sp.category || "Smartphones",
      brand: sp.brand || "",
      features: asStringArray(sp.features),
      specifications: asSpecArray(sp.specifications),
      variants: asVariantArray(sp.variants),
      colors: asColorArray(sp.colors),
      sizes: asSizeArray(sp.sizes),
      connectivityOptions: asStringList(sp.connectivityOptions),
      secondaryCategories: asStringList(sp.secondaryCategories),
      galleryImages: asStringList(sp.images).filter(Boolean),
    };
    setForm(prefill);
    setSavedForm(prefill);
  }, [isNew, overrideStorefrontId, catalogLoaded, storefrontProducts]);

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
        const { price: priceField, compareAtPrice: compareField } = formPricesFromLoadedProduct({
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ?? null,
        });
        const loaded: FormState = {
          legacyOverrideId: p.legacyOverrideId != null ? String(p.legacyOverrideId) : "",
          name: p.name || "",
          title: p.title || "",
          description: p.description || "",
          price: priceField,
          compareAtPrice: compareField,
          primaryImageUrl: displayPrimary,
          rating: String(p.rating ?? "4.5"),
          category: p.category || "Smartphones",
          brand: p.brand || "",
          videoUrl: p.video || "",
          isPreorder: Boolean(p.isPreorder),
          showPreorderPrice: p.showPreorderPrice !== false,
          isActive: p.isActive !== false,
          features: asStringArray(p.features),
          specifications: asSpecArray(p.specifications),
          variants: asVariantArray(p.variants),
          colors: asColorArray(p.colors),
          sizes: asSizeArray(p.sizes),
          connectivityOptions: asStringList(p.connectivityOptions),
          secondaryCategories: asStringList(p.secondaryCategories),
          galleryImages: (() => {
            const uploadPath = (url: string) => {
              if (!url) return url;
              const m = String(url).match(/(\/uploads\/[^?#]+)/);
              return m ? m[1] : url;
            };
            const primaryPaths = new Set([
              uploadPath(p.image || ""),
              uploadPath(displayPrimary),
            ].filter(Boolean));
            return (p.images || []).filter(
              (u: string) => u && !primaryPaths.has(uploadPath(u))
            );
          })(),
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

  /** After upload, keep primary + gallery in sync so saves always persist a storefront thumbnail. */
  const applyUploadedImages = (urls: string[], target: "primary" | "gallery") => {
    if (!urls.length) return;
    setForm((f) => {
      if (target === "primary") {
        const primary = urls[0];
        const gallery = f.galleryImages.filter(Boolean);
        const nextGallery = gallery.includes(primary) ? gallery : [primary, ...gallery];
        return { ...f, primaryImageUrl: primary, galleryImages: nextGallery };
      }
      const nextGallery = [...f.galleryImages.filter(Boolean), ...urls];
      const primary = f.primaryImageUrl.trim() || urls[0];
      return { ...f, primaryImageUrl: primary, galleryImages: nextGallery };
    });
  };

  // ── Save ──
  const save = async () => {
    const basics = computeCatalogSaveFromBasics({
      name: form.name,
      price: form.price,
      compareAtPrice: form.compareAtPrice,
      isPreorder: form.isPreorder,
      legacyOverrideId: form.legacyOverrideId,
      rating: form.rating,
    });
    if (!basics.ok) {
      toast({ variant: "destructive", title: basics.message });
      setActiveTab("basics");
      return;
    }

    // Validate variant/color/size uniqueness
    if (form.variants.length > 0) {
      const emptyKeys = form.variants.filter(v => !v.key.trim());
      if (emptyKeys.length > 0) {
        toast({ variant: "destructive", title: `${emptyKeys.length} variant(s) missing a key — each variant needs a unique key` });
        setActiveTab("options");
        return;
      }
      const keys = form.variants.map(v => v.key.trim());
      if (new Set(keys).size !== keys.length) {
        toast({ variant: "destructive", title: "Variant keys must be unique — found duplicates" });
        setActiveTab("options");
        return;
      }
    }
    if (form.colors.length > 0) {
      const names = form.colors.map(c => c.name.trim()).filter(Boolean);
      if (new Set(names).size !== names.length) {
        toast({ variant: "destructive", title: "Color names must be unique — found duplicates" });
        setActiveTab("options");
        return;
      }
    }
    if (form.sizes.length > 0) {
      const names = form.sizes.map(s => s.name.trim()).filter(Boolean);
      if (new Set(names).size !== names.length) {
        toast({ variant: "destructive", title: "Size names must be unique — found duplicates" });
        setActiveTab("options");
        return;
      }
    }

    /** When Basics sale price changes, keep variant/size rows that still matched the old sale in sync so ProductDetail (which prefers variant price) still shows discounts. */
    const prevBasics = computeCatalogSaveFromBasics({
      name: savedForm.name,
      price: savedForm.price,
      compareAtPrice: savedForm.compareAtPrice,
      isPreorder: savedForm.isPreorder,
      legacyOverrideId: savedForm.legacyOverrideId,
      rating: savedForm.rating,
    });
    let variantsOut = form.variants;
    let sizesOut = form.sizes;
    if (prevBasics.ok && basics.ok) {
      const prevSale = prevBasics.price;
      const newSale = basics.price;
      const matchesPrevSale = (n: number) => Number.isFinite(n) && Math.abs(n - prevSale) < 0.005;
      variantsOut = form.variants.map((v) =>
        matchesPrevSale(Number(v.price)) ? { ...v, price: newSale } : v
      );
      sizesOut = form.sizes.map((s) => {
        if (s.price === "") return s;
        const sp = typeof s.price === "number" ? s.price : Number(s.price);
        return matchesPrevSale(sp) ? { ...s, price: newSale } : s;
      });
    }
    const formSynced = { ...form, variants: variantsOut, sizes: sizesOut };

    if (
      form.category.trim() === "Smartphones" &&
      form.variants.length === 0 &&
      form.colors.length === 0
    ) {
      toast({
        title: "Tip: add variants & colors",
        description:
          "Smartphones without storage variants or colors won't show the quick-add picker on the shop grid.",
      });
    }

    setSaving(true);
    try {
      const legacy = form.legacyOverrideId === "" ? null : Number(form.legacyOverrideId);
      const galleryFiltered = form.galleryImages.filter(Boolean);
      let primaryImageUrl = form.primaryImageUrl.trim();
      if (!primaryImageUrl && galleryFiltered.length > 0) {
        primaryImageUrl = galleryFiltered[0];
      }
      const body = {
        legacyOverrideId: legacy,
        name: form.name.trim(),
        title: form.title.trim() || form.name.trim(),
        description: form.description,
        price: basics.price,
        compareAtPrice: basics.compareAtPrice,
        primaryImageUrl,
        rating: Number(form.rating),
        category: form.category.trim(), // normalized on server; must match CANONICAL_STOREFRONT_CATEGORIES
        brand: form.brand.trim() || undefined,
        videoUrl: form.videoUrl.trim() || undefined,
        isPreorder: form.isPreorder,
        showPreorderPrice: form.showPreorderPrice,
        isActive: form.isActive,
        features: form.features.map((f) => f.trim()).filter(Boolean),
        specifications: form.specifications.filter((s) => s.label.trim()),
        variants: variantsOut.map((v) => ({ ...v, price: v.price === "" ? 0 : Number(v.price) })),
        colors: form.colors.map((c) => ({ ...c, price: c.price === "" ? undefined : Number(c.price) })),
        sizes: sizesOut.map((s) => ({ ...s, price: s.price === "" ? undefined : Number(s.price) })),
        connectivityOptions: form.connectivityOptions.filter(Boolean),
        secondaryCategories: form.secondaryCategories.filter(Boolean),
        galleryImages: galleryFiltered.filter((url) => url !== primaryImageUrl),
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
      setSavedForm({
        ...formSynced,
        primaryImageUrl,
        galleryImages: galleryFiltered.filter((url) => url !== primaryImageUrl),
      });
      setForm({
        ...formSynced,
        primaryImageUrl,
        galleryImages: galleryFiltered.filter((url) => url !== primaryImageUrl),
      });
      toast({ title: isNew ? "Product created!" : "Changes saved" });
      await refreshCatalog();
      notifyStorefrontCatalogUpdate();
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
      <div className="flex flex-col h-full min-h-0 items-center justify-center py-16 px-4">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading product…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 w-full overflow-hidden">
      {/* ── Top bar ── */}
      <div className="shrink-0 z-20 bg-background/95 backdrop-blur border-b px-4 sm:px-6 py-3 flex items-center gap-3">
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
      <div className="shrink-0 border-b bg-muted/20">
        <div className="flex overflow-x-auto overscroll-x-contain touch-pan-x px-4 sm:px-6 no-scrollbar">
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

      {/* ── Tab content (scrollable) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-8">

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
                        onClick={() => pickAndUpload("image/*", false, (urls) => applyUploadedImages(urls, "primary"))}
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
                      {(BASE_CATEGORIES.includes(form.category) ? BASE_CATEGORIES : [...BASE_CATEGORIES, form.category]).map((c) => <option key={c}>{c}</option>)}
                    </select>
                    {form.category.trim() && (
                      <p className="text-[11px] text-muted-foreground">
                        Storefront: <span className="font-medium text-foreground">{normalizedCategory}</span>
                        {normalizedCategory !== form.category.trim() && " (normalized)"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Brand</Label>
                    <AdminBrandCombobox
                      value={form.brand}
                      onChange={(v) => patch("brand", v)}
                      suggestions={brandSuggestions}
                    />
                  </div>

                  {/* Pricing: list price (Compare at) is primary; sale is optional for a discount */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label>Compare at (was) — list price (USD) <span className="text-red-500">*</span></Label>
                      {form.compareAtPrice && form.price &&
                        Number(form.compareAtPrice) > Number(form.price) && Number(form.price) > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-bold px-2 py-0.5">
                          {Math.round((1 - Number(form.price) / Number(form.compareAtPrice)) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        inputMode="decimal"
                        className="pl-7"
                        value={form.compareAtPrice}
                        onChange={(e) => patch("compareAtPrice", e.target.value)}
                        placeholder="e.g. 999.00"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">This is the main price customers see when there is no separate sale price.</p>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Sale price (USD) <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        inputMode="decimal"
                        className="pl-7"
                        value={form.price}
                        onChange={(e) => patch("price", e.target.value)}
                        placeholder="Leave blank for list price only — or enter a lower on-sale price"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">If set below list price, the storefront shows the discount (strikethrough + % off).</p>
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

              <SectionCard title="Visibility & Status" description="Control whether this product appears on the storefront." className="overflow-visible">
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
                    <Switch
                      checked={form.isPreorder}
                      onCheckedChange={(v) => {
                        patch("isPreorder", v);
                        if (!v) patch("showPreorderPrice", true);
                      }}
                    />
                  </div>
                  {form.isPreorder && (
                    <div className="rounded-lg border px-4 py-3 space-y-2 bg-muted/10">
                      <Label className="text-sm font-medium">Storefront price</Label>
                      <p className="text-xs text-muted-foreground -mt-1">
                        Choose whether customers see the price or only &quot;Pre-order&quot; (no dollar amount).
                      </p>
                      <Select
                        modal={false}
                        value={form.showPreorderPrice ? "show" : "hide"}
                        onValueChange={(v) => patch("showPreorderPrice", v === "show")}
                      >
                        <SelectTrigger className="w-full max-w-md touch-manipulation" style={{ touchAction: "manipulation" }}>
                          <SelectValue placeholder="Price visibility" />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                          <SelectItem value="show">Show price on storefront</SelectItem>
                          <SelectItem value="hide">Hide price (Pre-order text only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                      onClick={() => pickAndUpload("image/*", false, (urls) => applyUploadedImages(urls, "primary"))}
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
                        applyUploadedImages(urls, "gallery")
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
                            <Input inputMode="decimal" className="pl-6 text-sm" value={v.price} onChange={(e) => {
                              const n = [...form.variants]; n[i] = { ...v, price: e.target.value }; patch("variants", n);
                            }} placeholder="0.00" />
                          </div>
                          <p className="text-[10px] text-muted-foreground">Enter 0 to use the base product price.</p>
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
                    onClick={() => patch("variants", [...form.variants, { key: `variant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label: "", ram: "", storage: "", price: 0, description: "" }])}
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
                            <Input inputMode="decimal" className="pl-6 text-sm"
                              value={c.price}
                              onChange={(e) => { const n = [...form.colors]; n[i] = { ...c, price: e.target.value }; patch("colors", n); }}
                              placeholder="Leave blank = base price"
                            />
                          </div>
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label className="text-xs">Color Image (optional)</Label>
                          <div className="flex gap-2 items-center">
                            <div className="shrink-0 h-9 w-9 rounded-lg border bg-muted/40 overflow-hidden flex items-center justify-center">
                              {c.image ? (
                                <img
                                  src={resolveImageUrl(c.image)}
                                  alt={c.name || "color"}
                                  className="h-full w-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                              ) : (
                                <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                              )}
                            </div>
                            <Input value={c.image} onChange={(e) => {
                              const n = [...form.colors]; n[i] = { ...c, image: e.target.value }; patch("colors", n);
                            }} placeholder="Paste URL or click upload →" className="text-sm flex-1" />
                            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" type="button"
                              title="Upload color image"
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
                          <Input inputMode="decimal" value={s.price === "" ? "" : s.price}
                            onChange={(e) => { const n = [...form.sizes]; n[i] = { ...s, price: e.target.value }; patch("sizes", n); }}
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

      {/* ── Mobile save bar (fixed footer, not inside scroll) ── */}
      <div className="sm:hidden shrink-0 z-30 border-t bg-background/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex gap-2">
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
  title, description, children, className,
}: { title: string; description?: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
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
  const safeItems = items ?? [];
  const add = () => {
    const v = input.trim();
    if (v && !safeItems.includes(v)) onChange([...safeItems, v]);
    setInput("");
  };
  return (
    <div className="space-y-2">
      {(safeItems).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {safeItems.map((item) => (
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
