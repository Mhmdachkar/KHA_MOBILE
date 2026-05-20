import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Layout, Package } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useAdminMergedCatalog } from "@/lib/useAdminMergedCatalog";
import { buildCatalogHealthSummary } from "@/lib/adminCatalogSummary";
import { getDistinctBrands } from "@/lib/adminCatalogTaxonomy";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { SiteContentTabs } from "@/components/admin/site-content/SiteContentTabs";
import { AnnouncementsPanel } from "@/components/admin/site-content/AnnouncementsPanel";
import { HeroPanel } from "@/components/admin/site-content/HeroPanel";
import { FlagshipPanel } from "@/components/admin/site-content/FlagshipPanel";
import { NewArrivalsPanel } from "@/components/admin/site-content/NewArrivalsPanel";
import { WeeklyFavoritesPanel } from "@/components/admin/site-content/WeeklyFavoritesPanel";
import { TrendingPanel } from "@/components/admin/site-content/TrendingPanel";
import { BrandsPanel } from "@/components/admin/site-content/BrandsPanel";
import { CategoriesPanel } from "@/components/admin/site-content/CategoriesPanel";
import { CommercePanel } from "@/components/admin/site-content/CommercePanel";
import type { SiteContentTabId } from "@/components/admin/site-content/types";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const AdminSiteContent = () => {
  const { toast } = useToast();
  const { settings: liveSettings, refresh: refreshLive } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<SiteContentTabId>("announcements");
  const [saving, setSaving] = useState(false);
  const needsCatalog = activeTab === "brands" || activeTab === "categories";
  const { products: catalogProducts, loading: catalogLoading } = useAdminMergedCatalog({
    enabled: needsCatalog,
  });
  const catalogSummary = useMemo(
    () => (catalogProducts.length > 0 ? buildCatalogHealthSummary(catalogProducts) : null),
    [catalogProducts]
  );
  const catalogBrands = useMemo(() => getDistinctBrands(catalogProducts), [catalogProducts]);

  const [announcements, setAnnouncements] = useState(liveSettings.announcements);
  const [hero, setHero] = useState(liveSettings.hero);
  const [flagship, setFlagship] = useState(liveSettings.flagship_showcase);
  const [newArrivals, setNewArrivals] = useState(liveSettings.new_arrival_showcases);
  const [weeklyFavs, setWeeklyFavs] = useState(liveSettings.weekly_favorites);
  const [trendingSections, setTrendingSections] = useState(liveSettings.trending_sections || []);
  const [brands, setBrands] = useState(liveSettings.brand_showcase || []);
  const [categories, setCategories] = useState(liveSettings.homepage_categories || []);
  const [deliveryFee, setDeliveryFee] = useState(String(liveSettings.delivery_fee));
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    String(liveSettings.free_shipping_threshold ?? 50)
  );
  const [whatsappNumber, setWhatsappNumber] = useState(liveSettings.whatsapp_number);
  const [instagramUrl, setInstagramUrl] = useState(liveSettings.instagram_url ?? "");
  const [facebookUrl, setFacebookUrl] = useState(liveSettings.facebook_url ?? "");

  const initialLoadRef = useRef(true);
  useEffect(() => {
    if (!initialLoadRef.current) return;
    initialLoadRef.current = false;
    setAnnouncements(liveSettings.announcements);
    setHero(liveSettings.hero);
    setFlagship(liveSettings.flagship_showcase);
    setNewArrivals(liveSettings.new_arrival_showcases);
    setWeeklyFavs(liveSettings.weekly_favorites);
    setTrendingSections(liveSettings.trending_sections || []);
    setBrands(liveSettings.brand_showcase || []);
    setCategories(liveSettings.homepage_categories || []);
    setDeliveryFee(String(liveSettings.delivery_fee));
    setFreeShippingThreshold(String(liveSettings.free_shipping_threshold ?? 50));
    setWhatsappNumber(liveSettings.whatsapp_number);
    setInstagramUrl(liveSettings.instagram_url ?? "");
    setFacebookUrl(liveSettings.facebook_url ?? "");
  }, [liveSettings]);

  const saveSetting = useCallback(
    async (key: string, value: unknown) => {
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
    },
    [toast, refreshLive]
  );

  const saveCommerce = useCallback(async () => {
    const fee = parseFloat(deliveryFee);
    const threshold = parseFloat(freeShippingThreshold);
    if (!Number.isFinite(fee) || fee < 0) {
      toast({ title: "Invalid delivery fee", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(threshold) || threshold <= 0) {
      toast({ title: "Invalid free shipping threshold", variant: "destructive" });
      return;
    }
    if (!whatsappNumber.trim()) {
      toast({ title: "WhatsApp number is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payloads: [string, unknown][] = [
        ["delivery_fee", fee],
        ["free_shipping_threshold", threshold],
        ["whatsapp_number", whatsappNumber.trim()],
        ["instagram_url", instagramUrl.trim()],
        ["facebook_url", facebookUrl.trim()],
      ];
      for (const [key, value] of payloads) {
        const r = await adminFetch(`/api/admin/settings/${key}`, {
          method: "PUT",
          body: JSON.stringify({ value }),
          headers: { "Content-Type": "application/json" },
        });
        if (!r.ok) throw new Error(await r.text());
      }
      toast({ title: "Saved!", description: "Commerce settings updated on the live site." });
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
  }, [
    deliveryFee,
    freeShippingThreshold,
    whatsappNumber,
    instagramUrl,
    facebookUrl,
    toast,
    refreshLive,
  ]);

  const panelProps = {
    announcements,
    setAnnouncements,
    hero,
    setHero,
    flagship,
    setFlagship,
    newArrivals,
    setNewArrivals,
    weeklyFavs,
    setWeeklyFavs,
    trendingSections,
    setTrendingSections,
    brands,
    setBrands,
    categories,
    setCategories,
    deliveryFee,
    setDeliveryFee,
    freeShippingThreshold,
    setFreeShippingThreshold,
    whatsappNumber,
    setWhatsappNumber,
    instagramUrl,
    setInstagramUrl,
    facebookUrl,
    setFacebookUrl,
    saving,
    saveSetting,
    catalogSummary,
    catalogLoading,
    catalogBrands,
    saveCommerce,
  };

  const activePanel = (() => {
    switch (activeTab) {
      case "announcements":
        return <AnnouncementsPanel {...panelProps} />;
      case "hero":
        return <HeroPanel {...panelProps} />;
      case "flagship":
        return <FlagshipPanel {...panelProps} />;
      case "new_arrivals":
        return <NewArrivalsPanel {...panelProps} />;
      case "weekly_favorites":
        return <WeeklyFavoritesPanel {...panelProps} />;
      case "trending":
        return <TrendingPanel {...panelProps} />;
      case "brands":
        return <BrandsPanel {...panelProps} />;
      case "categories":
        return <CategoriesPanel {...panelProps} />;
      case "commerce":
        return <CommercePanel {...panelProps} />;
      default:
        return null;
    }
  })();

  return (
    <AdminPageShell
      maxWidth="md"
      title={
        <span className="flex items-center gap-2">
          <Layout className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          Site Content
        </span>
      }
      description="Control what's displayed in each section of your homepage. All changes go live instantly."
      headerExtra={
        <Badge variant="outline" className="gap-1.5 shrink-0 text-xs">
          <Package className="h-3 w-3" />
          9 sections
        </Badge>
      }
      tabs={<SiteContentTabs activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {activePanel}
    </AdminPageShell>
  );
};

export default AdminSiteContent;
