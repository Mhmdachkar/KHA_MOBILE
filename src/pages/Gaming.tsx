import CategoryPage from "./CategoryPage";
import { gamingProducts } from "@/data/allProducts";

const Gaming = () => {
  return (
    <CategoryPage
      categoryName="Gaming"
      products={gamingProducts}
      description="Level up your gaming experience with consoles, controllers, and gaming accessories."
    />
  );
};

export default Gaming;

