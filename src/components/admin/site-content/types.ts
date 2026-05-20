import type {
  Announcement,
  BrandEntry,
  FlagshipShowcaseSettings,
  HeroSettings,
  HomepageCategory,
  NewArrivalEntry,
  TrendingSection,
  WeeklyFavoriteEntry,
} from "@/context/SiteSettingsContext";
import type { CatalogHealthSummary } from "@/lib/adminCatalogSummary";

export type SiteContentTabId =
  | "announcements"
  | "hero"
  | "flagship"
  | "new_arrivals"
  | "weekly_favorites"
  | "trending"
  | "brands"
  | "categories"
  | "commerce";

export interface SiteContentDraftState {
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  hero: HeroSettings;
  setHero: React.Dispatch<React.SetStateAction<HeroSettings>>;
  flagship: FlagshipShowcaseSettings;
  setFlagship: React.Dispatch<React.SetStateAction<FlagshipShowcaseSettings>>;
  newArrivals: NewArrivalEntry[];
  setNewArrivals: React.Dispatch<React.SetStateAction<NewArrivalEntry[]>>;
  weeklyFavs: WeeklyFavoriteEntry[];
  setWeeklyFavs: React.Dispatch<React.SetStateAction<WeeklyFavoriteEntry[]>>;
  trendingSections: TrendingSection[];
  setTrendingSections: React.Dispatch<React.SetStateAction<TrendingSection[]>>;
  brands: BrandEntry[];
  setBrands: React.Dispatch<React.SetStateAction<BrandEntry[]>>;
  categories: HomepageCategory[];
  setCategories: React.Dispatch<React.SetStateAction<HomepageCategory[]>>;
  deliveryFee: string;
  setDeliveryFee: React.Dispatch<React.SetStateAction<string>>;
  freeShippingThreshold: string;
  setFreeShippingThreshold: React.Dispatch<React.SetStateAction<string>>;
  whatsappNumber: string;
  setWhatsappNumber: React.Dispatch<React.SetStateAction<string>>;
  instagramUrl: string;
  setInstagramUrl: React.Dispatch<React.SetStateAction<string>>;
  facebookUrl: string;
  setFacebookUrl: React.Dispatch<React.SetStateAction<string>>;
}

export interface SiteContentPanelProps extends SiteContentDraftState {
  saving: boolean;
  saveSetting: (key: string, value: unknown) => Promise<void>;
  catalogSummary: CatalogHealthSummary | null;
  catalogLoading: boolean;
  catalogBrands: string[];
  refreshLive?: () => void;
  saveCommerce?: () => Promise<void>;
}
