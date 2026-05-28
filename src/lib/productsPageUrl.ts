/** URL param sync for /products filters */

export type ProductsAvailabilityFilter = "in" | "out" | "all";

export interface ProductsFilterState {
  searchQuery: string;
  selectedCategories: string[];
  selectedBrands: string[];
  sortBy: string;
  availability: ProductsAvailabilityFilter;
  minRating: number | null;
}

export function parseProductsFiltersFromSearchParams(
  params: URLSearchParams
): ProductsFilterState {
  const categoryParam = params.get("category");
  const brandParam = params.get("brand");
  const availabilityParam = params.get("availability") as ProductsAvailabilityFilter | null;

  let availability: ProductsAvailabilityFilter = "in";
  if (availabilityParam === "out" || availabilityParam === "all") {
    availability = availabilityParam;
  }

  const ratingParam = params.get("rating");
  const minRating = ratingParam ? Number.parseInt(ratingParam, 10) : null;

  return {
    searchQuery: params.get("search") ?? "",
    selectedCategories: categoryParam
      ? categoryParam.split(",").map((c) => c.trim()).filter(Boolean)
      : [],
    selectedBrands: brandParam
      ? brandParam.split(",").map((b) => b.trim()).filter(Boolean)
      : [],
    sortBy: params.get("sort") ?? "default",
    availability,
    minRating: minRating != null && !Number.isNaN(minRating) ? minRating : null,
  };
}

export function buildProductsSearchParams(state: ProductsFilterState): URLSearchParams {
  const params = new URLSearchParams();
  const search = state.searchQuery.trim();
  if (search) params.set("search", search);
  if (state.selectedCategories.length > 0) {
    params.set("category", state.selectedCategories.join(","));
  }
  if (state.selectedBrands.length > 0) {
    params.set("brand", state.selectedBrands.join(","));
  }
  if (state.sortBy && state.sortBy !== "default") {
    params.set("sort", state.sortBy);
  }
  if (state.availability === "out") params.set("availability", "out");
  else if (state.availability === "all") params.set("availability", "all");
  if (state.minRating != null) params.set("rating", String(state.minRating));
  return params;
}

export function availabilityToStockFlags(availability: ProductsAvailabilityFilter): {
  filterInStock: boolean;
  filterOutOfStock: boolean;
} {
  if (availability === "out") return { filterInStock: false, filterOutOfStock: true };
  if (availability === "all") return { filterInStock: true, filterOutOfStock: true };
  return { filterInStock: true, filterOutOfStock: false };
}

export function stockFlagsToAvailability(
  filterInStock: boolean,
  filterOutOfStock: boolean
): ProductsAvailabilityFilter {
  if (filterInStock && filterOutOfStock) return "all";
  if (!filterInStock && filterOutOfStock) return "out";
  return "in";
}
