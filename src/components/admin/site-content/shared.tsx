import { useEffect, useState } from "react";
import { ChevronRight, Search, Save } from "lucide-react";
import { adminFetch } from "@/lib/adminApi";
import { resolveImageUrl } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4 min-w-0">
    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
    {children}
  </div>
);

export const Field = ({
  label,
  hint,
  children,
}: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5 min-w-0">
    <Label className="text-xs font-medium">{label}</Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

interface SearchResult {
  id: number;
  name: string;
  category: string;
  primaryImageUrl?: string;
}

export const ProductPicker = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (id: number) => void;
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await adminFetch(`/api/admin/products?search=${encodeURIComponent(query)}&limit=8`);
        if (!r.ok) {
          setResults([]);
          return;
        }
        const d = await r.json();
        setResults(d.products ?? []);
      } catch {
        /* ignore */
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="space-y-2 min-w-0">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="number"
          placeholder="ID (e.g. 500)"
          value={value === 0 ? "" : value || ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full sm:w-28 shrink-0"
        />
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      {results.length > 0 && (
        <div className="rounded-lg border bg-popover shadow-md max-h-52 overflow-y-auto overscroll-y-contain divide-y text-sm">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full text-left px-3 py-2.5 hover:bg-muted flex items-center gap-3 transition-colors touch-manipulation min-h-10"
              style={{ touchAction: "manipulation" }}
              onClick={() => {
                onChange(p.id);
                setQuery("");
                setResults([]);
              }}
            >
              {p.primaryImageUrl && (
                <img
                  src={resolveImageUrl(p.primaryImageUrl)}
                  alt=""
                  className="h-8 w-8 rounded object-contain border bg-muted shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {p.category} · #{p.id}
                </p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
            </button>
          ))}
        </div>
      )}
      {searching && <p className="text-xs text-muted-foreground">Searching…</p>}
    </div>
  );
};

export const SaveBar = ({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <div className="flex justify-end pt-2">
    <Button
      onClick={onClick}
      disabled={disabled}
      className="w-full sm:w-auto min-h-10 touch-manipulation"
      style={{ touchAction: "manipulation" }}
    >
      <Save className="h-4 w-4 mr-2" />
      {label}
    </Button>
  </div>
);

export const tabButtonClass = (active: boolean) =>
  cn(
    "flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-all shrink-0 whitespace-nowrap min-h-10 touch-manipulation",
    active
      ? "border-foreground text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground"
  );
