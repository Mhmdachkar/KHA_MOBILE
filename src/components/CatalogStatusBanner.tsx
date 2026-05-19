import { AlertCircle, RefreshCw } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import { Button } from "@/components/ui/button";

/** Shown when catalog fetch fails — avoids silent empty storefront. */
const CatalogStatusBanner = () => {
  const { lastError, loading, refreshCatalog } = useCatalog();

  if (!lastError || loading) return null;

  return (
    <div
      role="alert"
      className="bg-destructive/10 border-b border-destructive/20 text-destructive px-4 py-3"
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <p>
            We couldn&apos;t refresh the product catalog. Some items may be outdated.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0"
          onClick={() => void refreshCatalog()}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden />
          Retry
        </Button>
      </div>
    </div>
  );
};

export default CatalogStatusBanner;
