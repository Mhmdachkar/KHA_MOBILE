import { useMemo } from "react";
import CategoryPage from "./CategoryPage";
import { buildSmartphonesProducts } from "@/data/allProducts";
import { useCatalog } from "@/context/CatalogContext";

const Smartphones = () => {
  const { catalogTick } = useCatalog();
  const products = useMemo(() => buildSmartphonesProducts(), [catalogTick]);
  return (
    <CategoryPage
      categoryName="Smartphones"
      products={products}
      description="Discover the latest smartphones with cutting-edge technology, powerful processors, and stunning displays."
    />
  );
};

export default Smartphones;
