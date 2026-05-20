import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard, SaveBar } from "./shared";
import type { SiteContentPanelProps } from "./types";

export function TrendingPanel({
  trendingSections,
  setTrendingSections,
  saving,
  saveSetting,
}: SiteContentPanelProps) {
  return (
    <div className="space-y-6 min-w-0">
      <SectionCard title="Trending Product Sections">
        <p className="text-xs text-muted-foreground mb-4">
          Configure Trending in… carousels. Add product IDs (comma-separated) or leave blank to auto-generate from category.
        </p>
        <div className="space-y-4">
          {trendingSections.map((section, i) => (
            <div key={i} className="rounded-xl border p-4 space-y-3 bg-muted/20 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Section {i + 1}</p>
                <button
                  type="button"
                  onClick={() => setTrendingSections((prev) => prev.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1.5 min-w-0">
                  <Label className="text-xs">Section Title</Label>
                  <Input
                    value={section.title}
                    onChange={(e) =>
                      setTrendingSections((prev) =>
                        prev.map((s, j) => (j === i ? { ...s, title: e.target.value } : s))
                      )
                    }
                    placeholder="e.g. Trending in Smartphones"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <Label className="text-xs">Category Filter</Label>
                  <Input
                    value={section.category}
                    onChange={(e) =>
                      setTrendingSections((prev) =>
                        prev.map((s, j) => (j === i ? { ...s, category: e.target.value } : s))
                      )
                    }
                    placeholder="e.g. Smartphones, Audio…"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Product IDs (comma-separated)</Label>
                <Input
                  value={(section.productIds || []).join(", ")}
                  onChange={(e) => {
                    const ids = e.target.value
                      .split(",")
                      .map((s) => parseInt(s.trim(), 10))
                      .filter((n) => !Number.isNaN(n));
                    setTrendingSections((prev) =>
                      prev.map((s, j) => (j === i ? { ...s, productIds: ids } : s))
                    );
                  }}
                  placeholder="500, 501, 502"
                  className="text-sm font-mono"
                />
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setTrendingSections((prev) => [...prev, { title: "", category: "", productIds: [] }])
            }
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Trending Section
          </Button>
        </div>
      </SectionCard>
      <SaveBar
        label="Save Trending Sections"
        disabled={saving}
        onClick={() => void saveSetting("trending_sections", trendingSections)}
      />
    </div>
  );
}
