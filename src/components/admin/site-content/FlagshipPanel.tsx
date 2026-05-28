import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Field, ProductPicker, SectionCard, SaveBar } from "./shared";
import type { SiteContentPanelProps } from "./types";

export function FlagshipPanel({ flagship, setFlagship, saving, saveSetting }: SiteContentPanelProps) {
  return (
    <div className="space-y-5 min-w-0">
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex gap-3">
        <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Swap product</strong> — choose any product from your catalog by ID. Or use <strong>Custom</strong> mode for manual content.
        </p>
      </div>
      <SectionCard title="Showcase Mode">
        <div className="flex flex-col sm:flex-row gap-3">
          {(["product", "custom"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFlagship((p) => ({ ...p, mode: m }))}
              className={cn(
                "flex-1 py-3 rounded-xl border text-sm font-medium transition-all min-h-10",
                flagship.mode === m
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              )}
            >
              {m === "product" ? "Swap Product" : "Custom Content"}
            </button>
          ))}
        </div>
      </SectionCard>
      {flagship.mode === "product" ? (
        <SectionCard title="Featured Product">
          <Field label="Product ID">
            <ProductPicker
              value={flagship.productId}
              onChange={(id) =>
                setFlagship((p) => ({ ...p, productId: id, cta1_url: `/product/${id}` }))
              }
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
            <Field label="CTA 1 label"><Input value={flagship.cta1_label} onChange={(e) => setFlagship((p) => ({ ...p, cta1_label: e.target.value }))} /></Field>
            <Field label="CTA 2 label"><Input value={flagship.cta2_label} onChange={(e) => setFlagship((p) => ({ ...p, cta2_label: e.target.value }))} /></Field>
            <Field label="CTA 1 URL"><Input value={flagship.cta1_url} onChange={(e) => setFlagship((p) => ({ ...p, cta1_url: e.target.value }))} /></Field>
            <Field label="CTA 2 URL"><Input value={flagship.cta2_url} onChange={(e) => setFlagship((p) => ({ ...p, cta2_url: e.target.value }))} /></Field>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Custom Content">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Badge"><Input value={flagship.custom_badge} onChange={(e) => setFlagship((p) => ({ ...p, custom_badge: e.target.value }))} /></Field>
            <Field label="Product name"><Input value={flagship.custom_name} onChange={(e) => setFlagship((p) => ({ ...p, custom_name: e.target.value }))} /></Field>
            <Field label="Tagline"><Input value={flagship.custom_tagline} onChange={(e) => setFlagship((p) => ({ ...p, custom_tagline: e.target.value }))} /></Field>
            <Field label="Image URL"><Input placeholder="https://…" value={flagship.custom_image_url} onChange={(e) => setFlagship((p) => ({ ...p, custom_image_url: e.target.value }))} /></Field>
          </div>
          <Field label="Description">
            <Textarea rows={3} value={flagship.custom_description} onChange={(e) => setFlagship((p) => ({ ...p, custom_description: e.target.value }))} />
          </Field>
        </SectionCard>
      )}
      <SectionCard title="Feature Chips (4 highlight boxes)">
        <div className="space-y-2">
          {(flagship.feature_chips || []).map((chip, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                placeholder="Label"
                value={chip.label}
                onChange={(e) =>
                  setFlagship((p) => ({
                    ...p,
                    feature_chips: (p.feature_chips ?? []).map((c, j) => (j === i ? { ...c, label: e.target.value } : c)),
                  }))
                }
                className="flex-1 min-w-0"
              />
              <Input
                placeholder="Sub-label"
                value={chip.sublabel}
                onChange={(e) =>
                  setFlagship((p) => ({
                    ...p,
                    feature_chips: (p.feature_chips ?? []).map((c, j) => (j === i ? { ...c, sublabel: e.target.value } : c)),
                  }))
                }
                className="flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={() =>
                  setFlagship((p) => ({ ...p, feature_chips: (p.feature_chips ?? []).filter((_, j) => j !== i) }))
                }
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 self-end sm:self-center"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {(flagship.feature_chips || []).length < 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFlagship((p) => ({ ...p, feature_chips: [...(p.feature_chips ?? []), { label: "", sublabel: "" }] }))
              }
              className="gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add Chip
            </Button>
          )}
        </div>
      </SectionCard>
      <SaveBar label="Save Flagship Showcase" disabled={saving} onClick={() => void saveSetting("flagship_showcase", flagship)} />
    </div>
  );
}
