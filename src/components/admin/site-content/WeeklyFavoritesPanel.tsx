import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductPicker, SectionCard, SaveBar } from "./shared";
import type { SiteContentPanelProps } from "./types";

const TYPE_OPTIONS = [
  { value: "regular", label: "Regular" },
  { value: "greenLion", label: "Green Lion" },
  { value: "recharge", label: "Recharge Card" },
] as const;

export function WeeklyFavoritesPanel({
  weeklyFavs,
  setWeeklyFavs,
  saving,
  saveSetting,
}: SiteContentPanelProps) {
  return (
    <div className="space-y-5 min-w-0">
      <p className="text-sm text-muted-foreground">
        This Week&apos;s Favorites shows a 6-product grid on the homepage.
      </p>
      <SectionCard title="6 Featured Products">
        <div className="space-y-3">
          {weeklyFavs.map((item, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border bg-muted/20 min-w-0"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <ProductPicker
                    value={item.id}
                    onChange={(id) =>
                      setWeeklyFavs((prev) => prev.map((x, j) => (j === i ? { ...x, id } : x)))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col gap-1 flex-1 sm:flex-none">
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
                    className="text-xs rounded-lg border bg-background px-2 py-1.5 min-w-0 w-full sm:min-w-[120px]"
                  >
                    {TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setWeeklyFavs((prev) => prev.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
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
              onClick={() => setWeeklyFavs((prev) => [...prev, { id: 0, type: "regular" }])}
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Slot
            </Button>
          )}
        </div>
      </SectionCard>
      <SaveBar
        label="Save Weekly Favorites"
        disabled={saving}
        onClick={() => void saveSetting("weekly_favorites", weeklyFavs)}
      />
    </div>
  );
}
