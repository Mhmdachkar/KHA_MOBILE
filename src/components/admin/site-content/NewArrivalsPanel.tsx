import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, ProductPicker, SectionCard, SaveBar } from "./shared";
import type { SiteContentPanelProps } from "./types";

export function NewArrivalsPanel({
  newArrivals,
  setNewArrivals,
  saving,
  saveSetting,
}: SiteContentPanelProps) {
  return (
    <div className="space-y-5 min-w-0">
      <p className="text-sm text-muted-foreground">
        The New Arrival Showcase rotates through these products every 7 seconds.
      </p>
      {newArrivals.map((entry, i) => (
        <SectionCard key={i} title={`Showcase ${i + 1}`}>
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <Field label={`Product ID (currently: #${entry.productId})`} >
              <ProductPicker
                value={entry.productId}
                onChange={(id) =>
                  setNewArrivals((prev) => prev.map((e, j) => (j === i ? { ...e, productId: id } : e)))
                }
              />
            </Field>
            {newArrivals.length > 1 && (
              <button
                type="button"
                onClick={() => setNewArrivals((prev) => prev.filter((_, j) => j !== i))}
                className="sm:mt-6 p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 self-end"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Highlight Features (up to 3)</p>
            {entry.features.map((feat, fi) => (
              <div key={fi} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <Input
                  placeholder="Label"
                  value={feat.label}
                  onChange={(e) =>
                    setNewArrivals((prev) =>
                      prev.map((en, j) =>
                        j !== i
                          ? en
                          : {
                              ...en,
                              features: en.features.map((f, k) =>
                                k === fi ? { ...f, label: e.target.value } : f
                              ),
                            }
                      )
                    )
                  }
                  className="flex-1 min-w-0"
                />
                <Input
                  placeholder="Value"
                  value={feat.value}
                  onChange={(e) =>
                    setNewArrivals((prev) =>
                      prev.map((en, j) =>
                        j !== i
                          ? en
                          : {
                              ...en,
                              features: en.features.map((f, k) =>
                                k === fi ? { ...f, value: e.target.value } : f
                              ),
                            }
                      )
                    )
                  }
                  className="flex-1 min-w-0"
                />
                <button
                  type="button"
                  onClick={() =>
                    setNewArrivals((prev) =>
                      prev.map((en, j) =>
                        j !== i ? en : { ...en, features: en.features.filter((_, k) => k !== fi) }
                      )
                    )
                  }
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 self-end sm:self-center"
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
            setNewArrivals((prev) => [...prev, { productId: 0, features: [{ label: "", value: "" }] }])
          }
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Showcase Slot
        </Button>
      )}
      <SaveBar
        label="Save New Arrivals"
        disabled={saving}
        onClick={() => void saveSetting("new_arrival_showcases", newArrivals)}
      />
    </div>
  );
}
