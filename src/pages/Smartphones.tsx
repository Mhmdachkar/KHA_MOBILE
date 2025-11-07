import CategoryPage from "./CategoryPage";
import { smartphonesProducts } from "@/data/allProducts";

const Smartphones = () => {
  return (
    <CategoryPage
      categoryName="Smartphones"
      products={smartphonesProducts}
      description="Discover the latest smartphones with cutting-edge technology, powerful processors, and stunning displays."
    />
  );
};

export default Smartphones;

