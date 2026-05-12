import { useMemo } from "react";
import CategoryPage from "./CategoryPage";
import { buildComputersProducts } from "@/data/allProducts";
import { useCatalog } from "@/context/CatalogContext";

const Computers = () => {
  const { catalogTick } = useCatalog();
  const products = useMemo(() => buildComputersProducts(), [catalogTick]);
  return (
    <CategoryPage
      categoryName="Computers"
      products={products}
      description="Powerful laptops and desktops for work, creativity, and gaming. Find the perfect computer for your needs."
    />
  );
};

export default Computers;
