import CategoryPage from "./CategoryPage";
import { wearablesProducts } from "@/data/allProducts";

const Wearables = () => {
  return (
    <CategoryPage
      categoryName="Wearables"
      products={wearablesProducts}
      description="Stay connected and track your fitness with our selection of smartwatches and fitness trackers."
    />
  );
};

export default Wearables;

