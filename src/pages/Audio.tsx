import { useMemo } from "react";
import CategoryPage from "./CategoryPage";
import { buildAudioProducts } from "@/data/allProducts";
import { useCatalog } from "@/context/CatalogContext";

const Audio = () => {
  const { catalogTick } = useCatalog();
  const products = useMemo(() => buildAudioProducts(), [catalogTick]);
  return (
    <CategoryPage
      categoryName="Audio"
      products={products}
      description="Experience premium sound quality with our curated collection of headphones, earbuds, and audio accessories."
    />
  );
};

export default Audio;
