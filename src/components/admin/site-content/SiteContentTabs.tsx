import {
  Megaphone, Layout, Star, Heart, RefreshCw, TrendingUp, Store, Grid3X3, Truck,
} from "lucide-react";
import { tabButtonClass } from "./shared";
import type { SiteContentTabId } from "./types";

export const SITE_CONTENT_TABS = [
  { id: "announcements" as const, label: "Announcements", icon: Megaphone },
  { id: "hero" as const, label: "Hero Section", icon: Layout },
  { id: "flagship" as const, label: "Flagship Showcase", icon: Star },
  { id: "new_arrivals" as const, label: "New Arrivals", icon: RefreshCw },
  { id: "weekly_favorites" as const, label: "Weekly Favorites", icon: Heart },
  { id: "trending" as const, label: "Trending Sections", icon: TrendingUp },
  { id: "brands" as const, label: "Shop by Brand", icon: Store },
  { id: "categories" as const, label: "Categories", icon: Grid3X3 },
  { id: "commerce" as const, label: "Commerce", icon: Truck },
] satisfies { id: SiteContentTabId; label: string; icon: typeof Megaphone }[];

export function SiteContentTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: SiteContentTabId;
  onTabChange: (id: SiteContentTabId) => void;
}) {
  return (
    <div className="flex overflow-x-auto overscroll-x-contain no-scrollbar gap-1 touch-pan-x -mx-1 px-1">
      {SITE_CONTENT_TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onTabChange(id)}
          className={tabButtonClass(activeTab === id)}
          style={{ touchAction: "manipulation" }}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{label.split(" ")[0]}</span>
        </button>
      ))}
    </div>
  );
}
