import { useMemo } from "react";
import CategoryPage from "./CategoryPage";
import { buildWearablesProducts } from "@/data/allProducts";
import { useCatalog } from "@/context/CatalogContext";

const Wearables = () => {
  const { catalogTick } = useCatalog();
  const products = useMemo(() => buildWearablesProducts(), [catalogTick]);
  return (
    <CategoryPage
      categoryName="Wearables"
      products={products}
      description="Stay connected and track your fitness with our selection of smartwatches and fitness trackers."
    />
  );
};

export default Wearables;
