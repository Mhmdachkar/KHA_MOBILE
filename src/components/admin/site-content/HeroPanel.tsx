import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SectionCard, SaveBar } from "./shared";
import type { SiteContentPanelProps } from "./types";

export function HeroPanel({ hero, setHero, saving, saveSetting }: SiteContentPanelProps) {
  return (
    <div className="space-y-5 min-w-0">
      <p className="text-sm text-muted-foreground">
        Customize the main hero banner at the top of the homepage — headline, description, call-to-action buttons, and the trust stats.
      </p>
      <SectionCard title="Text Content">
        <Field label="Badge text" hint="Shown above the headline (e.g. 'New Collection 2026')">
          <Input value={hero.badge} onChange={(e) => setHero((p) => ({ ...p, badge: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <p className="text-sm text-muted-foreground mb-4">
          Marketing copy for the homepage hero — not calculated from orders, reviews, or analytics.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      <SaveBar label="Save Hero Section" disabled={saving} onClick={() => void saveSetting("hero", hero)} />
    </div>
  );
}
