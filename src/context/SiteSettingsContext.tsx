import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiBase } from "@/lib/adminApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Announcement {
  text: string;
  highlight?: boolean;
}

export interface HeroSettings {
  badge: string;
  headline1: string;
  headline2: string;
  description: string;
  cta1_label: string;
  cta1_url: string;
  cta2_label: string;
  cta2_url: string;
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  stat3_value: string;
  stat3_label: string;
}

export interface FeatureChip {
  label: string;
  sublabel: string;
}

export interface FlagshipShowcaseSettings {
  mode: "product" | "custom";
  productId: number;
  custom_badge: string;
  custom_name: string;
  custom_tagline: string;
  custom_description: string;
  custom_image_url: string;
  cta1_label: string;
  cta1_url: string;
  cta2_label: string;
  cta2_url: string;
  feature_chips: FeatureChip[];
}

export interface ShowcaseFeature {
  label: string;
  value: string;
}

export interface NewArrivalEntry {
  productId: number;
  features: ShowcaseFeature[];
}

export interface WeeklyFavoriteEntry {
  id: number;
  type: "regular" | "greenLion" | "recharge";
}

export interface TrendingSection {
  title: string;
  category: string;
  productIds: number[];
}

export interface BrandEntry {
  name: string;
  logoUrl: string;
  link: string;
  featured: boolean;
}

export interface HomepageCategory {
  name: string;
  icon: string;
  linkTo: string;
  enabled: boolean;
}

export interface SiteSettings {
  announcements: Announcement[];
  hero: HeroSettings;
  flagship_showcase: FlagshipShowcaseSettings;
  new_arrival_showcases: NewArrivalEntry[];
  weekly_favorites: WeeklyFavoriteEntry[];
  trending_sections: TrendingSection[];
  brand_showcase: BrandEntry[];
  homepage_categories: HomepageCategory[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: SiteSettings = {
  announcements: [
    { text: "🎉 10% OFF Premium Gaming Accessories", highlight: true },
    { text: "Cutting-Edge Smartphones & Latest Tech" },
    { text: "Crystal-Clear Audio Excellence" },
    { text: "🎁 Instant Digital Gift Cards Worldwide" },
    { text: "PlayStation Store Cards – 10% OFF", highlight: true },
    { text: "Lightning-Fast Delivery • Free Shipping" },
  ],
  hero: {
    badge: "New Collection 2026",
    headline1: "Future",
    headline2: "Is Now",
    description:
      "Experience the pinnacle of technology with our curated collection of premium devices, smart accessories, and cutting-edge innovations.",
    cta1_label: "Explore Collection",
    cta1_url: "/products",
    cta2_label: "View Deals",
    cta2_url: "/products",
    stat1_value: "10K+",
    stat1_label: "Happy Customers",
    stat2_value: "4.9",
    stat2_label: "Average Rating",
    stat3_value: "50K+",
    stat3_label: "Products Sold",
  },
  flagship_showcase: {
    mode: "product",
    productId: 500,
    custom_badge: "Flagship Innovation",
    custom_name: "iPhone 16",
    custom_tagline: "Redefining Excellence",
    custom_description:
      "Experience unparalleled performance with the A18 chip, stunning camera system, and revolutionary design.",
    custom_image_url: "",
    cta1_label: "Order Now",
    cta1_url: "/product/500",
    cta2_label: "View All iPhones",
    cta2_url: "/smartphones",
    feature_chips: [
      { label: "A18 Pro Chip", sublabel: "Next-Gen Performance" },
      { label: "ProMotion", sublabel: "120Hz Display" },
      { label: "48MP Camera", sublabel: "Pro Photography" },
      { label: "All-Day Battery", sublabel: "Up to 29 Hours" },
    ],
  },
  new_arrival_showcases: [
    {
      productId: 5019,
      features: [
        { label: "Stabilization", value: "3-Axis Gimbal" },
        { label: "Smart Tracking", value: "Face & Object Tracking" },
        { label: "Working Time", value: "7-10 Hours" },
      ],
    },
    {
      productId: 5002,
      features: [
        { label: "Power", value: "40W High Torque" },
        { label: "Speed Levels", value: "4 Adjustable Speeds" },
        { label: "Quiet Motor", value: "<55dB Noise Level" },
      ],
    },
    {
      productId: 5034,
      features: [
        { label: "Color Temperature", value: "3000±300K" },
        { label: "Power Input", value: "9V/3A, 27W Max" },
        { label: "Wireless Output", value: "15W Max" },
      ],
    },
  ],
  weekly_favorites: [
    { id: 7, type: "recharge" },
    { id: 9, type: "recharge" },
    { id: 309, type: "regular" },
    { id: 5031, type: "greenLion" },
    { id: 5027, type: "greenLion" },
    { id: 401, type: "regular" },
  ],
  trending_sections: [
    { title: "Trending in Smartphones", category: "Smartphones", productIds: [] },
    { title: "Tech Essentials", category: "Audio", productIds: [] },
  ],
  brand_showcase: [],
  homepage_categories: [
    { name: "Smartphones", icon: "Smartphone", linkTo: "/smartphones", enabled: true },
    { name: "Audio", icon: "Headphones", linkTo: "/audio", enabled: true },
    { name: "Tablets", icon: "Tablet", linkTo: "/tablets", enabled: true },
    { name: "Streaming", icon: "Tv", linkTo: "/streaming-services", enabled: true },
    { name: "Wearables", icon: "Watch", linkTo: "/wearables", enabled: true },
    { name: "Gaming", icon: "Gamepad2", linkTo: "/gaming", enabled: true },
    { name: "Recharges", icon: "CreditCard", linkTo: "/recharges", enabled: true },
    { name: "Gift Cards", icon: "Gift", linkTo: "/gift-cards", enabled: true },
    { name: "Accessories", icon: "Zap", linkTo: "/accessories", enabled: true },
    { name: "Electronics", icon: "Cpu", linkTo: "/electronics", enabled: true },
    { name: "iPhone Cases", icon: "Smartphone", linkTo: "/category/iPhone Cases", enabled: true },
  ],
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface SiteSettingsContextValue {
  settings: SiteSettings;
  loaded: boolean;
  refresh: () => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  refresh: () => {},
});

export const useSiteSettings = () => useContext(SiteSettingsContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

const ALL_KEYS = [
  "announcements",
  "hero",
  "flagship_showcase",
  "new_arrival_showcases",
  "weekly_favorites",
  "trending_sections",
  "brand_showcase",
  "homepage_categories",
];

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await window.fetch(
        `${apiBase()}/api/public/settings?keys=${ALL_KEYS.join(",")}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data = await res.json();
      setSettings((prev) => ({
        ...prev,
        ...(data.announcements ? { announcements: data.announcements } : {}),
        ...(data.hero ? { hero: data.hero } : {}),
        ...(data.flagship_showcase
          ? { flagship_showcase: data.flagship_showcase }
          : {}),
        ...(data.new_arrival_showcases
          ? { new_arrival_showcases: data.new_arrival_showcases }
          : {}),
        ...(data.weekly_favorites
          ? { weekly_favorites: data.weekly_favorites }
          : {}),
        ...(data.trending_sections
          ? { trending_sections: data.trending_sections }
          : {}),
        ...(data.brand_showcase
          ? { brand_showcase: data.brand_showcase }
          : {}),
        ...(data.homepage_categories
          ? { homepage_categories: data.homepage_categories }
          : {}),
      }));
    } catch {
      // keep defaults if API unreachable
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loaded, refresh: fetch }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
