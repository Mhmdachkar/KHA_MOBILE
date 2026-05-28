import { Skeleton } from "@/components/ui/skeleton";

const ProductDetailSkeleton = () => (
  <div className="min-h-screen bg-background w-full pb-36">
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Skeleton className="h-4 w-48 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <Skeleton className="aspect-square w-full max-w-lg mx-auto rounded-2xl" />
          <div className="grid grid-cols-4 gap-2 mt-4 max-w-lg mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-2 pt-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-20 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-24 w-full max-w-lg mt-4" />
          <Skeleton className="h-12 w-full max-w-xs mt-6 hidden md:block" />
        </div>
      </div>
    </div>
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background p-4 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  </div>
);

export default ProductDetailSkeleton;
