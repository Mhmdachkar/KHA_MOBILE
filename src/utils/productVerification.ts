// Comprehensive Product Mapping and Verification Script
// This script creates a complete database of all products and verifies their detail page links

import { phoneAccessories, wearablesProducts, smartphoneProducts, tabletProducts, gamingConsoles, electronicsProducts, getProductById } from "@/data/products";
import { greenLionProducts, getGreenLionProductById } from "@/data/greenLionProducts";

// Type definitions
interface ProductMapping {
  id: number;
  name: string;
  category: string;
  brand: string;
  source: 'regular' | 'greenlion';
  detailPageUrl: string;
  hasValidId: boolean;
  imageExists: boolean;
  price: number | string;
  inStock: boolean;
}

interface VerificationReport {
  totalProducts: number;
  regularProducts: number;
  greenLionProducts: number;
  uniqueIds: number;
  duplicateIds: number;
  missingImages: number;
  invalidPrices: number;
  brokenLinks: number;
  issues: Array<{
    type: 'duplicate-id' | 'missing-image' | 'invalid-price' | 'broken-link';
    productId: number;
    productName: string;
    description: string;
  }>;
}

// Create comprehensive product mapping
export const createProductMapping = (): ProductMapping[] => {
  const allProducts: ProductMapping[] = [];
  
  // Process regular products
  const regularProductArrays = [
    { products: phoneAccessories, source: 'regular' as const },
    { products: wearablesProducts, source: 'regular' as const },
    { products: smartphoneProducts, source: 'regular' as const },
    { products: tabletProducts, source: 'regular' as const },
    { products: gamingConsoles, source: 'regular' as const },
    { products: electronicsProducts, source: 'regular' as const },
  ];

  regularProductArrays.forEach(({ products, source }) => {
    products.forEach((product) => {
      allProducts.push({
        id: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        source,
        detailPageUrl: `/product/${product.id}`,
        hasValidId: !!product.id && typeof product.id === 'number' && product.id > 0,
        imageExists: !!(product.image || (product as any).images),
        price: product.price,
        inStock: !product.isPreorder || String(product.price) !== "0.00"
      });
    });
  });

  // Process Green Lion products
  greenLionProducts.forEach((product) => {
    allProducts.push({
      id: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      source: 'greenlion',
      detailPageUrl: `/product/${product.id}`,
      hasValidId: !!product.id && typeof product.id === 'number' && product.id > 0,
      imageExists: !!(product.images && product.images.length > 0),
      price: product.price,
      inStock: !product.isPreorder || String(product.price) !== "0.00"
    });
  });

  return allProducts;
};

// Verify product IDs are unique
export const verifyUniqueIds = (products: ProductMapping[]): { unique: number; duplicates: Array<{ id: number; products: string[] }> } => {
  const idMap = new Map<number, string[]>();
  
  products.forEach(product => {
    if (!idMap.has(product.id)) {
      idMap.set(product.id, []);
    }
    idMap.get(product.id)!.push(product.name);
  });

  const duplicates: Array<{ id: number; products: string[] }> = [];
  let uniqueCount = 0;

  idMap.forEach((productNames, id) => {
    if (productNames.length > 1) {
      duplicates.push({ id, products: productNames });
    } else {
      uniqueCount++;
    }
  });

  return { unique: uniqueCount, duplicates };
};

// Test product detail page routing
export const testProductDetailRouting = (products: ProductMapping[]): { working: number; broken: number; brokenProducts: ProductMapping[] } => {
  const brokenProducts: ProductMapping[] = [];
  let workingCount = 0;

  products.forEach(product => {
    try {
      // Test if product can be found by ID
      const foundProduct = product.source === 'greenlion' 
        ? getGreenLionProductById(product.id)
        : getProductById(product.id);
      
      if (foundProduct) {
        workingCount++;
      } else {
        brokenProducts.push(product);
      }
    } catch (error) {
      brokenProducts.push(product);
    }
  });

  return { working: workingCount, broken: brokenProducts.length, brokenProducts };
};

// Check product data consistency
export const checkDataConsistency = (products: ProductMapping[]): VerificationReport['issues'] => {
  const issues: VerificationReport['issues'] = [];

  products.forEach(product => {
    // Check for invalid IDs
    if (!product.hasValidId) {
      issues.push({
        type: 'broken-link',
        productId: product.id,
        productName: product.name,
        description: 'Invalid or missing product ID'
      });
    }

    // Check for missing images
    if (!product.imageExists) {
      issues.push({
        type: 'missing-image',
        productId: product.id,
        productName: product.name,
        description: 'Product image is missing'
      });
    }

    // Check for invalid prices
    if (String(product.price) === "0.00" || product.price === 0 || !product.price) {
      issues.push({
        type: 'invalid-price',
        productId: product.id,
        productName: product.name,
        description: 'Product has invalid or zero price'
      });
    }
  });

  return issues;
};

// Generate comprehensive verification report
export const generateVerificationReport = (): VerificationReport => {
  const allProducts = createProductMapping();
  const idVerification = verifyUniqueIds(allProducts);
  const routingTest = testProductDetailRouting(allProducts);
  const consistencyIssues = checkDataConsistency(allProducts);

  const issues: VerificationReport['issues'] = [
    ...idVerification.duplicates.map(dup => ({
      type: 'duplicate-id' as const,
      productId: dup.id,
      productName: dup.products.join(', '),
      description: `Duplicate ID used by ${dup.products.length} products`
    })),
    ...consistencyIssues
  ];

  return {
    totalProducts: allProducts.length,
    regularProducts: allProducts.filter(p => p.source === 'regular').length,
    greenLionProducts: allProducts.filter(p => p.source === 'greenlion').length,
    uniqueIds: idVerification.unique,
    duplicateIds: idVerification.duplicates.length,
    missingImages: issues.filter(i => i.type === 'missing-image').length,
    invalidPrices: issues.filter(i => i.type === 'invalid-price').length,
    brokenLinks: routingTest.broken,
    issues
  };
};

// Export product mapping for external use
export const getAllProductMappings = createProductMapping;

// Helper function to get product by category with verification
export const getVerifiedProductsByCategory = (category: string): ProductMapping[] => {
  const allProducts = createProductMapping();
  return allProducts.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
};

// Helper function to check if product detail page will work
export const verifyProductDetailPage = (productId: number): { exists: boolean; product?: ProductMapping; error?: string } => {
  const allProducts = createProductMapping();
  const product = allProducts.find(p => p.id === productId);
  
  if (!product) {
    return { exists: false, error: `Product with ID ${productId} not found` };
  }
  
  if (!product.hasValidId) {
    return { exists: false, product, error: 'Product has invalid ID' };
  }
  
  const foundProduct = product.source === 'greenlion' 
    ? getGreenLionProductById(productId)
    : getProductById(productId);
  
  if (!foundProduct) {
    return { exists: false, product, error: 'Product cannot be retrieved using existing functions' };
  }
  
  return { exists: true, product };
};
