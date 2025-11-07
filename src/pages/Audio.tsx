import CategoryPage from "./CategoryPage";
import { audioProducts } from "@/data/allProducts";

const Audio = () => {
  return (
    <CategoryPage
      categoryName="Audio"
      products={audioProducts}
      description="Experience premium sound quality with our curated collection of headphones, earbuds, and audio accessories."
    />
  );
};

export default Audio;

