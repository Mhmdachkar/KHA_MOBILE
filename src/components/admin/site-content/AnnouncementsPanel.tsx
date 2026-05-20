import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SectionCard, SaveBar } from "./shared";
import type { SiteContentPanelProps } from "./types";

export function AnnouncementsPanel({
  announcements,
  setAnnouncements,
  saving,
  saveSetting,
}: SiteContentPanelProps) {
  return (
    <div className="space-y-5 min-w-0">
      <p className="text-sm text-muted-foreground">
        These messages rotate in the announcement bar at the very top of every page. Changes go live immediately after saving.
      </p>
      <SectionCard title="Rotating Messages">
        <div className="space-y-2">
          {announcements.map((a, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
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
                className="flex-1 text-sm min-w-0"
              />
              <button
                type="button"
                onClick={() => setAnnouncements((prev) => prev.filter((_, j) => j !== i))}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0 self-end sm:self-center"
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
      <SaveBar
        label="Save Announcements"
        disabled={saving}
        onClick={() => void saveSetting("announcements", announcements)}
      />
    </div>
  );
}
