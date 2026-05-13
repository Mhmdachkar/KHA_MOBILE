import { useEffect, useState, useCallback } from "react";
import {
  Megaphone, Layout, Star, Heart, Save, Plus, Trash2,
  RefreshCw, ChevronRight, Search, Package, AlertCircle,
  TrendingUp, Store, Grid3X3,
} from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { useSiteSettings, SiteSettings } from "@/context/SiteSettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: "announcements",    label: "Announcements",      icon: Megaphone },
  { id: "hero",             label: "Hero Section",        icon: Layout },
  { id: "flagship",         label: "Flagship Showcase",   icon: Star },
  { id: "new_arrivals",     label: "New Arrivals",        icon: RefreshCw },
  { id: "weekly_favorites", label: "Weekly Favorites",    icon: Heart },
  { id: "trending",         label: "Trending Sections",   icon: TrendingUp },
  { id: "brands",           label: "Shop by Brand",       icon: Store },
  { id: "categories",       label: "Categories",          icon: Grid3X3 },
] as const;
type TabId = (typeof TABS)[number]["id"];

// ─── Section card helper ──────────────────────────────────────────────────────

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border bg-card p-5 space-y-4">
    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
    {children}
  </div>
);

// ─── Field row helper ─────────────────────────────────────────────────────────

const Field = ({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium">{label}</Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

// ─── Product search mini-widget ───────────────────────────────────────────────

interface SearchResult { id: number; name: string; category: string; primaryImageUrl?: string }

const ProductPicker = ({
  value, onChange,
}: { value: number; onChange: (id: number) => void }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await adminFetch(`/api/admin/products?search=${encodeURIComponent(query)}&limit=8`);
        const d = await r.json();
        setResults(d.products ?? []);
      } catch { /* ignore */ } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="number"
          placeholder="ID (e.g. 500)"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full sm:w-28 shrink-0"
        />
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      {results.length > 0 && (
        <div className="rounded-lg border bg-popover shadow-md max-h-52 overflow-y-auto divide-y text-sm">
          {results.map((p) => (
            <button
              key={p.id}
              className="w-full text-left px-3 py-2.5 hover:bg-muted flex items-center gap-3 transition-colors"
              onClick={() => { onChange(p.id); setQuery(""); setResults([]); }}
            >
              {p.primaryImageUrl && (
                <img src={p.primaryImageUrl} alt="" className="h-8 w-8 rounded object-contain border bg-muted" />
              )}
              <div className="min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">{p.category} · #{p.id}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
            </button>
          ))}
        </div>
      )}
      {searching && <p className="text-xs text-muted-foreground">Searching…</p>}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const AdminSiteContent = () => {
  const { toast } = useToast();
  const { settings: liveSettings, refresh: refreshLive } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<TabId>("announcements");
  const [saving, setSaving] = useState(false);

  // Local draft state - each section managed independently
  const [announcements, setAnnouncements] = useState(liveSettings.announcements);
  const [hero, setHero] = useState(liveSettings.hero);
  const [flagship, setFlagship] = useState(liveSettings.flagship_showcase);
  const [newArrivals, setNewArrivals] = useState(liveSettings.new_arrival_showcases);
  const [weeklyFavs, setWeeklyFavs] = useState(liveSettings.weekly_favorites);

  // Sync drafts when live settings load
  useEffect(() => {
    setAnnouncements(liveSettings.announcements);
    setHero(liveSettings.hero);
    setFlagship(liveSettings.flagship_showcase);
    setNewArrivals(liveSettings.new_arrival_showcases);
    setWeeklyFavs(liveSettings.weekly_favorites);
  }, [liveSettings]);

  const saveSetting = useCallback(async (key: string, value: unknown) => {
    setSaving(true);
    try {
      const r = await adminFetch(`/api/admin/settings/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
        headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error(await r.text());
      toast({ title: "Saved!", description: `"${key}" updated on the live site.` });
      refreshLive();
    } catch (err: unknown) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [toast, refreshLive]);

  // ── Announcements tab ─────────────────────────────────────────────────────

  const AnnouncementsTab = () => (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        These messages rotate in the announcement bar at the very top of every page. Changes go live immediately after saving.
      </p>
      <SectionCard title="Rotating Messages">
        <div className="space-y-2">
          {announcements.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={!!a.highlight}
                  onCheckedChange={(v) =>
                    setAnnouncements((prev) =>
                      prev.map((x, j) => (j === i ? { ...x, highlight: v } : x))
                    )
                  }
                />
                <span className="text-[10px] text-muted-foreground w-16 shrink-0">
                  {a.highlight ? "Highlighted" : "Normal"}
                </span>
              </div>
              <Input
                value={a.text}
                onChange={(e) =>
                  setAnnouncements((prev) =>
                    prev.map((x, j) => (j === i ? { ...x, text: e.target.value } : x))
                  )
                }
                className="flex-1 text-sm"
              />
              <button
                onClick={() => setAnnouncements((prev) => prev.filter((_, j) => j !== i))}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAnnouncements((prev) => [...prev, { text: "", highlight: false }])}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> Add Message
        </Button>
      </SectionCard>
      <div className="flex justify-end">
        <Button 
          onClick={() => void saveSetting("announcements", announcements)} 
          disabled={saving}
          className="w-full sm:w-auto touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Announcements
        </Button>
      </div>
    </div>
  );

  // ── Hero tab ───────────────────────────────────────────────────────────────

  const HeroTab = () => (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Customize the main hero banner at the top of the homepage — headline, description, call-to-action buttons, and the trust stats.
      </p>
      <SectionCard title="Text Content">
        <Field label="Badge text" hint="Shown above the headline (e.g. 'New Collection 2026')">
          <Input value={hero.badge} onChange={(e) => setHero((p) => ({ ...p, badge: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Headline line 1 (gradient)">
            <Input value={hero.headline1} onChange={(e) => setHero((p) => ({ ...p, headline1: e.target.value }))} />
          </Field>
          <Field label="Headline line 2 (black)">
            <Input value={hero.headline2} onChange={(e) => setHero((p) => ({ ...p, headline2: e.target.value }))} />
          </Field>
        </div>
        <Field label="Description">
          <Textarea rows={3} value={hero.description} onChange={(e) => setHero((p) => ({ ...p, description: e.target.value }))} />
        </Field>
      </SectionCard>
      <SectionCard title="Call-to-Action Buttons">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Primary Button</p>
            <Field label="Label">
              <Input value={hero.cta1_label} onChange={(e) => setHero((p) => ({ ...p, cta1_label: e.target.value }))} />
            </Field>
            <Field label="URL">
              <Input value={hero.cta1_url} onChange={(e) => setHero((p) => ({ ...p, cta1_url: e.target.value }))} />
            </Field>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Secondary Button</p>
            <Field label="Label">
              <Input value={hero.cta2_label} onChange={(e) => setHero((p) => ({ ...p, cta2_label: e.target.value }))} />
            </Field>
            <Field label="URL">
              <Input value={hero.cta2_url} onChange={(e) => setHero((p) => ({ ...p, cta2_url: e.target.value }))} />
            </Field>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Trust Stats (3 numbers shown below the CTAs)">
        <div className="grid grid-cols-3 gap-4">
          {([1, 2, 3] as const).map((n) => {
            const vKey = `stat${n}_value` as keyof typeof hero;
            const lKey = `stat${n}_label` as keyof typeof hero;
            return (
              <div key={n} className="space-y-2">
                <Field label={`Stat ${n} value`}>
                  <Input value={String(hero[vKey])} onChange={(e) => setHero((p) => ({ ...p, [vKey]: e.target.value }))} />
                </Field>
                <Field label={`Stat ${n} label`}>
                  <Input value={String(hero[lKey])} onChange={(e) => setHero((p) => ({ ...p, [lKey]: e.target.value }))} />
                </Field>
              </div>
            );
          })}
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <Button 
          onClick={() => void saveSetting("hero", hero)} 
          disabled={saving}
          className="w-full sm:w-auto touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Hero Section
        </Button>
      </div>
    </div>
  );

  // ── Flagship showcase tab ─────────────────────────────────────────────────

  const FlagshipTab = () => (
    <div className="space-y-5">
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex gap-3">
        <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Swap product</strong> — choose any product from your catalog by ID and all its data (name, image, colors, description, CTAs) will automatically populate the showcase on the homepage. Or switch to <strong>Custom</strong> mode to enter everything manually.
        </p>
      </div>

      <SectionCard title="Showcase Mode">
        <div className="flex gap-3">
          {(["product", "custom"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFlagship((p) => ({ ...p, mode: m }))}
              className={cn(
                "flex-1 py-3 rounded-xl border text-sm font-medium transition-all",
                flagship.mode === m
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              {m === "product" ? "🔄 Swap Product" : "✏️ Custom Content"}
            </button>
          ))}
        </div>
      </SectionCard>

      {flagship.mode === "product" ? (
        <SectionCard title="Featured Product">
          <p className="text-sm text-muted-foreground">
            Search or enter the product ID. The showcase will automatically use that product's name, image, colors, description, and link. Currently showing product <strong>#{flagship.productId}</strong>.
          </p>
          <Field label="Product ID">
            <ProductPicker
              value={flagship.productId}
              onChange={(id) => {
                setFlagship((p) => ({
                  ...p,
                  productId: id,
                  cta1_url: `/product/${id}`,
                }));
              }}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t">
            <Field label="CTA 1 label" hint="e.g. Order Now">
              <Input value={flagship.cta1_label} onChange={(e) => setFlagship((p) => ({ ...p, cta1_label: e.target.value }))} />
            </Field>
            <Field label="CTA 2 label" hint="e.g. View All iPhones">
              <Input value={flagship.cta2_label} onChange={(e) => setFlagship((p) => ({ ...p, cta2_label: e.target.value }))} />
            </Field>
            <Field label="CTA 1 URL">
              <Input value={flagship.cta1_url} onChange={(e) => setFlagship((p) => ({ ...p, cta1_url: e.target.value }))} />
            </Field>
            <Field label="CTA 2 URL">
              <Input value={flagship.cta2_url} onChange={(e) => setFlagship((p) => ({ ...p, cta2_url: e.target.value }))} />
            </Field>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Custom Content">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Badge">
              <Input value={flagship.custom_badge} onChange={(e) => setFlagship((p) => ({ ...p, custom_badge: e.target.value }))} />
            </Field>
            <Field label="Product name">
              <Input value={flagship.custom_name} onChange={(e) => setFlagship((p) => ({ ...p, custom_name: e.target.value }))} />
            </Field>
            <Field label="Tagline (gradient heading)">
              <Input value={flagship.custom_tagline} onChange={(e) => setFlagship((p) => ({ ...p, custom_tagline: e.target.value }))} />
            </Field>
            <Field label="Image URL">
              <Input placeholder="https://…" value={flagship.custom_image_url} onChange={(e) => setFlagship((p) => ({ ...p, custom_image_url: e.target.value }))} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={3} value={flagship.custom_description} onChange={(e) => setFlagship((p) => ({ ...p, custom_description: e.target.value }))} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t">
            <Field label="CTA 1 label"><Input value={flagship.cta1_label} onChange={(e) => setFlagship((p) => ({ ...p, cta1_label: e.target.value }))} /></Field>
            <Field label="CTA 2 label"><Input value={flagship.cta2_label} onChange={(e) => setFlagship((p) => ({ ...p, cta2_label: e.target.value }))} /></Field>
            <Field label="CTA 1 URL"><Input value={flagship.cta1_url} onChange={(e) => setFlagship((p) => ({ ...p, cta1_url: e.target.value }))} /></Field>
            <Field label="CTA 2 URL"><Input value={flagship.cta2_url} onChange={(e) => setFlagship((p) => ({ ...p, cta2_url: e.target.value }))} /></Field>
          </div>
        </SectionCard>
      )}

      <SectionCard title="Feature Chips (4 highlight boxes on the left side)">
        <div className="space-y-2">
          {flagship.feature_chips.map((chip, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Label"
                value={chip.label}
                onChange={(e) =>
                  setFlagship((p) => ({
                    ...p,
                    feature_chips: p.feature_chips.map((c, j) =>
                      j === i ? { ...c, label: e.target.value } : c
                    ),
                  }))
                }
                className="flex-1"
              />
              <Input
                placeholder="Sub-label"
                value={chip.sublabel}
                onChange={(e) =>
                  setFlagship((p) => ({
                    ...p,
                    feature_chips: p.feature_chips.map((c, j) =>
                      j === i ? { ...c, sublabel: e.target.value } : c
                    ),
                  }))
                }
                className="flex-1"
              />
              <button
                onClick={() =>
                  setFlagship((p) => ({
                    ...p,
                    feature_chips: p.feature_chips.filter((_, j) => j !== i),
                  }))
                }
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {flagship.feature_chips.length < 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFlagship((p) => ({
                  ...p,
                  feature_chips: [...p.feature_chips, { label: "", sublabel: "" }],
                }))
              }
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Chip
            </Button>
          )}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button 
          onClick={() => void saveSetting("flagship_showcase", flagship)} 
          disabled={saving}
          className="w-full sm:w-auto touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Flagship Showcase
        </Button>
      </div>
    </div>
  );

  // ── New arrivals tab ──────────────────────────────────────────────────────

  const NewArrivalsTab = () => (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        The "New Arrival Showcase" rotates through these products automatically every 7 seconds. Each entry shows the product's image and name from the catalog, plus the custom highlight features you define here.
      </p>
      {newArrivals.map((entry, i) => (
        <SectionCard key={i} title={`Showcase ${i + 1}`}>
          <div className="flex items-center justify-between">
            <Field label={`Product ID (currently: #${entry.productId})`}>
              <ProductPicker
                value={entry.productId}
                onChange={(id) =>
                  setNewArrivals((prev) =>
                    prev.map((e, j) => (j === i ? { ...e, productId: id } : e))
                  )
                }
              />
            </Field>
            {newArrivals.length > 1 && (
              <button
                onClick={() => setNewArrivals((prev) => prev.filter((_, j) => j !== i))}
                className="ml-4 mt-6 p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Highlight Features (up to 3)</p>
            {entry.features.map((feat, fi) => (
              <div key={fi} className="flex gap-2 items-center">
                <Input
                  placeholder="Label"
                  value={feat.label}
                  onChange={(e) =>
                    setNewArrivals((prev) =>
                      prev.map((en, j) =>
                        j !== i ? en : {
                          ...en,
                          features: en.features.map((f, k) =>
                            k === fi ? { ...f, label: e.target.value } : f
                          ),
                        }
                      )
                    )
                  }
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={feat.value}
                  onChange={(e) =>
                    setNewArrivals((prev) =>
                      prev.map((en, j) =>
                        j !== i ? en : {
                          ...en,
                          features: en.features.map((f, k) =>
                            k === fi ? { ...f, value: e.target.value } : f
                          ),
                        }
                      )
                    )
                  }
                  className="flex-1"
                />
                <button
                  onClick={() =>
                    setNewArrivals((prev) =>
                      prev.map((en, j) =>
                        j !== i ? en : { ...en, features: en.features.filter((_, k) => k !== fi) }
                      )
                    )
                  }
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {entry.features.length < 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setNewArrivals((prev) =>
                    prev.map((en, j) =>
                      j !== i ? en : { ...en, features: [...en.features, { label: "", value: "" }] }
                    )
                  )
                }
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Feature
              </Button>
            )}
          </div>
        </SectionCard>
      ))}
      {newArrivals.length < 5 && (
        <Button
          variant="outline"
          onClick={() =>
            setNewArrivals((prev) => [
              ...prev,
              { productId: 0, features: [{ label: "", value: "" }] },
            ])
          }
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Showcase Slot
        </Button>
      )}
      <div className="flex justify-end">
        <Button 
          onClick={() => void saveSetting("new_arrival_showcases", newArrivals)} 
          disabled={saving}
          className="w-full sm:w-auto touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          <Save className="h-4 w-4 mr-2" />
          Save New Arrivals
        </Button>
      </div>
    </div>
  );

  // ── Weekly favorites tab ──────────────────────────────────────────────────

  const TYPE_OPTIONS = [
    { value: "regular", label: "Regular" },
    { value: "greenLion", label: "Green Lion" },
    { value: "recharge", label: "Recharge Card" },
  ] as const;

  const WeeklyFavoritesTab = () => (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        "This Week's Favorites" shows a 6-product grid on the homepage. You can swap any slot with any product from your catalog. The first 2 slots often feature recharge cards.
      </p>
      <SectionCard title="6 Featured Products">
        <div className="space-y-3">
          {weeklyFavs.map((item, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border bg-muted/20">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <ProductPicker
                    value={item.id}
                    onChange={(id) =>
                      setWeeklyFavs((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, id } : x))
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col gap-1 flex-1 sm:flex-none sm:shrink-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Type</p>
                  <select
                    value={item.type}
                    onChange={(e) =>
                      setWeeklyFavs((prev) =>
                        prev.map((x, j) =>
                          j === i
                            ? { ...x, type: e.target.value as "regular" | "greenLion" | "recharge" }
                            : x
                        )
                      )
                    }
                    className="text-xs rounded-lg border bg-background px-2 py-1.5 min-w-[120px]"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setWeeklyFavs((prev) => prev.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0 touch-manipulation"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {weeklyFavs.length < 8 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setWeeklyFavs((prev) => [...prev, { id: 0, type: "regular" }])
              }
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Slot
            </Button>
          )}
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <Button 
          onClick={() => void saveSetting("weekly_favorites", weeklyFavs)} 
          disabled={saving}
          className="w-full sm:w-auto touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Weekly Favorites
        </Button>
      </div>
    </div>
  );

  // ─── Trending Sections Tab ──────────────────────────────────────────────────
  const [trendingSections, setTrendingSections] = useState(liveSettings.trending_sections || []);
  useEffect(() => { setTrendingSections(liveSettings.trending_sections || []); }, [liveSettings]);

  const TrendingTab = (
    <div className="space-y-6">
      <SectionCard title="Trending Product Sections">
        <p className="text-xs text-muted-foreground mb-4">
          Configure the "Trending in..." carousels on the homepage. Add product IDs (comma-separated) or leave blank to auto-generate from category.
        </p>
        <div className="space-y-4">
          {trendingSections.map((section, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Section {i + 1}</p>
                <button
                  onClick={() => setTrendingSections((prev) => prev.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Section Title</Label>
                  <Input
                    value={section.title}
                    onChange={(e) => setTrendingSections((prev) => prev.map((s, j) => j === i ? { ...s, title: e.target.value } : s))}
                    placeholder="e.g. Trending in Smartphones"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Category Filter</Label>
                  <Input
                    value={section.category}
                    onChange={(e) => setTrendingSections((prev) => prev.map((s, j) => j === i ? { ...s, category: e.target.value } : s))}
                    placeholder="e.g. Smartphones, Audio, Tablets..."
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Product IDs (comma-separated, leave blank for auto)</Label>
                <Input
                  value={(section.productIds || []).join(", ")}
                  onChange={(e) => {
                    const ids = e.target.value.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                    setTrendingSections((prev) => prev.map((s, j) => j === i ? { ...s, productIds: ids } : s));
                  }}
                  placeholder="e.g. 500, 501, 502 (blank = auto from category)"
                  className="text-sm font-mono"
                />
              </div>
            </div>
          ))}
          <Button
            variant="outline" size="sm"
            onClick={() => setTrendingSections((prev) => [...prev, { title: "", category: "", productIds: [] }])}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Trending Section
          </Button>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <Button onClick={() => void saveSetting("trending_sections", trendingSections)} disabled={saving} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" /> Save Trending Sections
        </Button>
      </div>
    </div>
  );

  // ─── Brands Tab ────────────────────────────────────────────────────────────
  const [brands, setBrands] = useState(liveSettings.brand_showcase || []);
  useEffect(() => { setBrands(liveSettings.brand_showcase || []); }, [liveSettings]);

  const BrandsTab = (
    <div className="space-y-6">
      <SectionCard title="Shop by Brand">
        <p className="text-xs text-muted-foreground mb-4">
          Configure which brands appear in the "Shop by Brand" section. Leave empty to auto-detect from product catalog.
        </p>
        <div className="space-y-3">
          {brands.map((brand, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border p-3 bg-muted/20">
              {brand.logoUrl && (
                <img src={brand.logoUrl} alt={brand.name} className="h-8 w-8 rounded object-cover border shrink-0" />
              )}
              <div className="flex-1 grid gap-2 sm:grid-cols-3">
                <Input
                  value={brand.name}
                  onChange={(e) => setBrands((prev) => prev.map((b, j) => j === i ? { ...b, name: e.target.value } : b))}
                  placeholder="Brand Name"
                  className="text-sm"
                />
                <Input
                  value={brand.logoUrl}
                  onChange={(e) => setBrands((prev) => prev.map((b, j) => j === i ? { ...b, logoUrl: e.target.value } : b))}
                  placeholder="Logo URL"
                  className="text-sm"
                />
                <Input
                  value={brand.link}
                  onChange={(e) => setBrands((prev) => prev.map((b, j) => j === i ? { ...b, link: e.target.value } : b))}
                  placeholder="Link (e.g. /category/Apple)"
                  className="text-sm"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={brand.featured}
                  onCheckedChange={(v) => setBrands((prev) => prev.map((b, j) => j === i ? { ...b, featured: v } : b))}
                />
                <button
                  onClick={() => setBrands((prev) => prev.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <Button
            variant="outline" size="sm"
            onClick={() => setBrands((prev) => [...prev, { name: "", logoUrl: "", link: "", featured: true }])}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Brand
          </Button>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <Button onClick={() => void saveSetting("brand_showcase", brands)} disabled={saving} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" /> Save Brands
        </Button>
      </div>
    </div>
  );

  // ─── Categories Tab ────────────────────────────────────────────────────────
  const [categories, setCategories] = useState(liveSettings.homepage_categories || []);
  useEffect(() => { setCategories(liveSettings.homepage_categories || []); }, [liveSettings]);

  const CategoriesTab = (
    <div className="space-y-6">
      <SectionCard title="Homepage Categories">
        <p className="text-xs text-muted-foreground mb-4">
          Control which categories appear on the homepage "Shop by Category" grid. Toggle visibility, rename, or reorder.
        </p>
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border p-3 bg-muted/20">
              <span className="text-xs text-muted-foreground w-5 text-center shrink-0">{i + 1}</span>
              <div className="flex-1 grid gap-2 sm:grid-cols-3">
                <Input
                  value={cat.name}
                  onChange={(e) => setCategories((prev) => prev.map((c, j) => j === i ? { ...c, name: e.target.value } : c))}
                  placeholder="Category Name"
                  className="text-sm"
                />
                <Input
                  value={cat.linkTo}
                  onChange={(e) => setCategories((prev) => prev.map((c, j) => j === i ? { ...c, linkTo: e.target.value } : c))}
                  placeholder="Link (e.g. /smartphones)"
                  className="text-sm"
                />
                <Input
                  value={cat.icon}
                  onChange={(e) => setCategories((prev) => prev.map((c, j) => j === i ? { ...c, icon: e.target.value } : c))}
                  placeholder="Icon name (e.g. Smartphone)"
                  className="text-sm"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={cat.enabled}
                  onCheckedChange={(v) => setCategories((prev) => prev.map((c, j) => j === i ? { ...c, enabled: v } : c))}
                />
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      if (i === 0) return;
                      setCategories((prev) => {
                        const next = [...prev];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        return next;
                      });
                    }}
                    disabled={i === 0}
                    className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronRight className="h-3 w-3 -rotate-90" />
                  </button>
                  <button
                    onClick={() => {
                      if (i === categories.length - 1) return;
                      setCategories((prev) => {
                        const next = [...prev];
                        [next[i], next[i + 1]] = [next[i + 1], next[i]];
                        return next;
                      });
                    }}
                    disabled={i === categories.length - 1}
                    className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronRight className="h-3 w-3 rotate-90" />
                  </button>
                </div>
                <button
                  onClick={() => setCategories((prev) => prev.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <Button
            variant="outline" size="sm"
            onClick={() => setCategories((prev) => [...prev, { name: "", icon: "Smartphone", linkTo: "/", enabled: true }])}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Category
          </Button>
        </div>
      </SectionCard>
      <div className="flex justify-end">
        <Button onClick={() => void saveSetting("homepage_categories", categories)} disabled={saving} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" /> Save Categories
        </Button>
      </div>
    </div>
  );

  const tabContent: Record<TabId, React.ReactNode> = {
    announcements:    <AnnouncementsTab />,
    hero:             <HeroTab />,
    flagship:         <FlagshipTab />,
    new_arrivals:     <NewArrivalsTab />,
    weekly_favorites: <WeeklyFavoritesTab />,
    trending:         TrendingTab,
    brands:           BrandsTab,
    categories:       CategoriesTab,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Layout className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span>Site Content</span>
            </h1>
            <Badge variant="outline" className="gap-1.5 shrink-0 text-xs">
              <Package className="h-3 w-3" />
              <span className="hidden xs:inline">8 sections</span>
              <span className="xs:hidden">8</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Control what's displayed in each section of your homepage. All changes go live instantly.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-muted/20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex overflow-x-auto no-scrollbar gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-all shrink-0 whitespace-nowrap",
                activeTab === id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{label.split(" ")[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
};

export default AdminSiteContent;
