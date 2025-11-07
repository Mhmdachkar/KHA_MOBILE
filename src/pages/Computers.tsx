import CategoryPage from "./CategoryPage";
import { computersProducts } from "@/data/allProducts";

const Computers = () => {
  return (
    <CategoryPage
      categoryName="Computers"
      products={computersProducts}
      description="Powerful laptops and desktops for work, creativity, and gaming. Find the perfect computer for your needs."
    />
  );
};

export default Computers;

