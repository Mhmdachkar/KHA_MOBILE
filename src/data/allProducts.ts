// Centralized product data for all categories
import { getProductsByCategory, wearablesProducts as realWearables } from "./products";
import { greenLionProducts, getGreenLionProductsByCategory } from "./greenLionProducts";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
}

// Smartphones products (real data from products.ts)
export const smartphonesProducts: Product[] = getProductsByCategory("Smartphones").map(product => ({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  rating: product.rating,
  category: product.category,
}));

// Audio products (merging mock data with real accessories + Green Lion audio)
export const audioProducts: Product[] = [
  // Real audio accessories
  ...getProductsByCategory("Audio").map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    rating: product.rating,
    category: product.category,
  })),
  // Green Lion audio products
  ...getGreenLionProductsByCategory("Audio").map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    rating: product.rating,
    category: product.category,
  })),
  // Additional mock audio products
  {
    id: 111,
    name: "Sony WH-1000XM5",
    price: 399,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&h=500&fit=crop",
    rating: 4.8,
    category: "Audio"
  },
  {
    id: 112,
    name: "Bose QuietComfort",
    price: 349,
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop",
    rating: 4.7,
    category: "Audio"
  },
  {
    id: 113,
    name: "Beats Studio Pro",
    price: 349,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    rating: 4.6,
    category: "Audio"
  },
  {
    id: 114,
    name: "B&O Beoplay HX",
    price: 499,
    image: "https://images.unsplash.com/photo-1577174881658-0f30157f72c4?w=500&h=500&fit=crop",
    rating: 4.8,
    category: "Audio"
  },
];

// Computers products
export const computersProducts: Product[] = [
  {
    id: 11,
    name: "MacBook Pro 16",
    price: 2499,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop",
    rating: 4.9,
    category: "Computers"
  },
  {
    id: 12,
    name: "Dell XPS 15",
    price: 1899,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop",
    rating: 4.7,
    category: "Computers"
  },
  {
    id: 13,
    name: "HP Spectre x360",
    price: 1299,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&h=500&fit=crop",
    rating: 4.6,
    category: "Computers"
  },
  {
    id: 14,
    name: "Lenovo ThinkPad X1",
    price: 1499,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop",
    rating: 4.8,
    category: "Computers"
  },
  {
    id: 15,
    name: "ASUS ROG Zephyrus",
    price: 1999,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=500&fit=crop",
    rating: 4.7,
    category: "Computers"
  },
];

// Wearables products - using real products from products.ts + Green Lion smartwatches
export const wearablesProducts: Product[] = [
  ...realWearables.map(product => ({
  id: product.id,
  name: product.name,
  price: product.price,
  image: product.image,
  rating: product.rating,
  category: product.category,
  })),
  // Green Lion smartwatches
  ...getGreenLionProductsByCategory("Wearables").map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    rating: product.rating,
    category: product.category,
  })),
];

// Gaming products (merging mock data with real accessories + Green Lion gaming)
export const gamingProducts: Product[] = [
  // Real gaming accessories
  ...getProductsByCategory("Gaming").map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    rating: product.rating,
    category: product.category,
  })),
  // Green Lion gaming accessories
  ...greenLionProducts.filter(p => 
    p.secondaryCategories?.includes("Gaming") || p.name.toLowerCase().includes("gaming")
  ).map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    rating: product.rating,
    category: product.category,
  })),
  // Additional mock gaming products
  {
    id: 201,
    name: "PlayStation 5",
    price: 499,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&h=500&fit=crop",
    rating: 4.9,
    category: "Gaming"
  },
  {
    id: 202,
    name: "Xbox Series X",
    price: 499,
    image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500&h=500&fit=crop",
    rating: 4.8,
    category: "Gaming"
  },
  {
    id: 203,
    name: "Nintendo Switch OLED",
    price: 349,
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop",
    rating: 4.7,
    category: "Gaming"
  },
];

// Helper function to get products by category
export const getProductsByCategoryName = (categoryName: string): Product[] => {
  switch (categoryName.toLowerCase()) {
    case "smartphones":
      return smartphonesProducts;
    case "audio":
      return audioProducts;
    case "computers":
      return computersProducts;
    case "wearables":
      return wearablesProducts;
    case "gaming":
      return gamingProducts;
    default:
      return [];
  }
};

