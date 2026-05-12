// Centralized product data for all categories (merged with API via productLookup).
import { wearablesProducts as realWearables, electronicsProducts as realElectronics } from "./products";
import {
  getProductsByCategoryMerged,
  getGreenLionProductsByCategoryMerged,
  getAllGreenLionProductsMerged,
} from "./productLookup";

export interface Product {
  id: number;
  name: string;
  price: number | string;
  image: string;
  rating: number;
  category: string;
}

// Helper to reliably compare prices (handling both string and number)
const comparePrices = (a: any, b: any) => {
  const priceA = typeof a.price === "string" ? parseFloat(a.price) : a.price;
  const priceB = typeof b.price === "string" ? parseFloat(b.price) : b.price;
  return priceB - priceA;
};

export function buildSmartphonesProducts(): Product[] {
  return getProductsByCategoryMerged("Smartphones")
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating,
      category: product.category,
    }))
    .sort(comparePrices);
}

export function buildTabletProducts(): Product[] {
  return getProductsByCategoryMerged("Tablets")
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating,
      category: product.category,
    }))
    .sort(comparePrices);
}

export function buildAudioProducts(): Product[] {
  return [
    ...getProductsByCategoryMerged("Audio").map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating,
      category: product.category,
    })),
    ...getProductsByCategoryMerged("Accessories")
      .filter((p) => p.id === 151 || p.id === 152 || p.id === 153 || p.id === 154)
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        rating: product.rating,
        category: product.category,
      })),
    ...getGreenLionProductsByCategoryMerged("Audio").map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      rating: product.rating,
      category: product.category,
    })),
    {
      id: 111,
      name: "Sony WH-1000XM5",
      price: 399,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&h=500&fit=crop",
      rating: 4.8,
      category: "Audio",
    },
    {
      id: 112,
      name: "Bose QuietComfort",
      price: 349,
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop",
      rating: 4.7,
      category: "Audio",
    },
    {
      id: 113,
      name: "Beats Studio Pro",
      price: 349,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      rating: 4.6,
      category: "Audio",
    },
    {
      id: 114,
      name: "B&O Beoplay HX",
      price: 499,
      image: "https://images.unsplash.com/photo-1577174881658-0f30157f72c4?w=500&h=500&fit=crop",
      rating: 4.8,
      category: "Audio",
    },
  ].sort(comparePrices);
}

const STATIC_COMPUTERS: Product[] = [
  {
    id: 11,
    name: "MacBook Pro 16",
    price: 2499,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop",
    rating: 4.9,
    category: "Computers",
  },
  {
    id: 12,
    name: "Dell XPS 15",
    price: 1899,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop",
    rating: 4.7,
    category: "Computers",
  },
  {
    id: 13,
    name: "HP Spectre x360",
    price: 1299,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&h=500&fit=crop",
    rating: 4.6,
    category: "Computers",
  },
  {
    id: 14,
    name: "Lenovo ThinkPad X1",
    price: 1499,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop",
    rating: 4.8,
    category: "Computers",
  },
  {
    id: 15,
    name: "ASUS ROG Zephyrus",
    price: 1999,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=500&fit=crop",
    rating: 4.7,
    category: "Computers",
  },
];

export function buildComputersProducts(): Product[] {
  return STATIC_COMPUTERS;
}

export function buildWearablesProducts(): Product[] {
  return [
    ...realWearables.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating,
      category: product.category,
    })),
    ...getGreenLionProductsByCategoryMerged("Wearables").map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      rating: product.rating,
      category: product.category,
    })),
  ].sort(comparePrices);
}

export function buildGamingProducts(): Product[] {
  return [
    ...getProductsByCategoryMerged("Gaming").map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating,
      category: product.category,
    })),
    ...getAllGreenLionProductsMerged()
      .filter(
        (p) => p.secondaryCategories?.includes("Gaming") || p.name.toLowerCase().includes("gaming")
      )
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        rating: product.rating,
        category: product.category,
      })),
  ].sort(comparePrices);
}

export function buildElectronicsProducts(): Product[] {
  return realElectronics
    .map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      rating: product.rating,
      category: product.category,
    }))
    .sort(comparePrices);
}

export const getProductsByCategoryName = (categoryName: string): Product[] => {
  switch (categoryName.toLowerCase()) {
    case "smartphones":
      return buildSmartphonesProducts();
    case "audio":
      return buildAudioProducts();
    case "computers":
      return buildComputersProducts();
    case "wearables":
      return buildWearablesProducts();
    case "gaming":
      return buildGamingProducts();
    case "electronics":
      return buildElectronicsProducts();
    default:
      return [];
  }
};
