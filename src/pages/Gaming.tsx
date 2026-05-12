import { useMemo } from "react";
import CategoryPage from "./CategoryPage";
import { buildGamingProducts } from "@/data/allProducts";
import { useCatalog } from "@/context/CatalogContext";

const Gaming = () => {
  const { catalogTick } = useCatalog();
  const products = useMemo(() => buildGamingProducts(), [catalogTick]);
  return (
    <CategoryPage
      categoryName="Gaming"
      products={products}
      description="Level up your gaming experience with consoles, controllers, and gaming accessories."
    />
  );
};

export default Gaming;
