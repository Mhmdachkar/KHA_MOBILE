// Product Verification Test Runner
// This script runs comprehensive tests on all products and their detail pages

import { generateVerificationReport, getAllProductMappings, verifyProductDetailPage, getVerifiedProductsByCategory } from './productVerification';

// Test runner function
export const runProductVerificationTests = () => {
  console.log('🔍 Starting Comprehensive Product Verification...\n');
  
  // Generate full report
  const report = generateVerificationReport();
  
  // Display summary
  console.log('📊 VERIFICATION SUMMARY');
  console.log('======================');
  console.log(`Total Products: ${report.totalProducts}`);
  console.log(`Regular Products: ${report.regularProducts}`);
  console.log(`Green Lion Products: ${report.greenLionProducts}`);
  console.log(`Unique IDs: ${report.uniqueIds}`);
  console.log(`Duplicate IDs: ${report.duplicateIds}`);
  console.log(`Missing Images: ${report.missingImages}`);
  console.log(`Invalid Prices: ${report.invalidPrices}`);
  console.log(`Broken Links: ${report.brokenLinks}\n`);
  
  // Display issues if any
  if (report.issues.length > 0) {
    console.log('⚠️  ISSUES FOUND');
    console.log('================');
    report.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.type.toUpperCase()}`);
      console.log(`   Product ID: ${issue.productId}`);
      console.log(`   Product Name: ${issue.productName}`);
      console.log(`   Description: ${issue.description}\n`);
    });
  } else {
    console.log('✅ No issues found! All products are properly configured.\n');
  }
  
  return report;
};

// Test specific categories
export const testSpecificCategories = () => {
  console.log('🎮 TESTING SPECIFIC CATEGORIES');
  console.log('=============================\n');
  
  const categories = ['Gaming', 'Smartphones', 'Audio', 'Wearables', 'Accessories', 'Electronics'];
  
  categories.forEach(category => {
    const products = getVerifiedProductsByCategory(category);
    console.log(`${category}: ${products.length} products`);
    
    // Test first few products in each category
    products.slice(0, 3).forEach(product => {
      const verification = verifyProductDetailPage(product.id);
      console.log(`  - ${product.name} (ID: ${product.id}): ${verification.exists ? '✅' : '❌'}`);
      if (!verification.exists) {
        console.log(`    Error: ${verification.error}`);
      }
    });
    console.log('');
  });
};

// Test recently added products
export const testRecentProducts = () => {
  console.log('🆕 TESTING RECENTLY ADDED PRODUCTS');
  console.log('===================================\n');
  
  const allProducts = getAllProductMappings();
  
  // Test products with high IDs (recently added)
  const recentProducts = allProducts
    .filter(p => p.id >= 500) // Recent gaming consoles and new products
    .sort((a, b) => b.id - a.id)
    .slice(0, 10);
  
  console.log(`Found ${recentProducts.length} recent products (ID >= 500):\n`);
  
  recentProducts.forEach(product => {
    const verification = verifyProductDetailPage(product.id);
    console.log(`${product.name} (ID: ${product.id})`);
    console.log(`  Category: ${product.category}`);
    console.log(`  Brand: ${product.brand}`);
    console.log(`  Price: ${product.price}`);
    console.log(`  Detail Page: ${verification.exists ? '✅ Working' : '❌ Broken'}`);
    
    if (!verification.exists) {
      console.log(`  Error: ${verification.error}`);
    }
    
    console.log(`  URL: /product/${product.id}\n`);
  });
};

// Test product image loading
export const testProductImages = () => {
  console.log('🖼️  TESTING PRODUCT IMAGES');
  console.log('==========================\n');
  
  const allProducts = getAllProductMappings();
  const productsWithoutImages = allProducts.filter(p => !p.imageExists);
  
  console.log(`Products without images: ${productsWithoutImages.length}`);
  
  if (productsWithoutImages.length > 0) {
    console.log('\nProducts missing images:');
    productsWithoutImages.forEach(product => {
      console.log(`  - ${product.name} (ID: ${product.id})`);
    });
  } else {
    console.log('✅ All products have images!\n');
  }
};

// Main test execution
export const runAllTests = () => {
  console.log('🚀 RUNNING ALL PRODUCT VERIFICATION TESTS');
  console.log('========================================\n');
  
  try {
    // Run comprehensive verification
    const report = runProductVerificationTests();
    
    // Test specific categories
    testSpecificCategories();
    
    // Test recent products
    testRecentProducts();
    
    // Test images
    testProductImages();
    
    // Final summary
    console.log('📋 FINAL SUMMARY');
    console.log('================');
    if (report.issues.length === 0) {
      console.log('✅ All tests passed! All products are correctly linked to their detail pages.');
    } else {
      console.log(`❌ Found ${report.issues.length} issues that need to be resolved.`);
    }
    
    return report;
  } catch (error) {
    console.error('❌ Error running tests:', error);
    throw error;
  }
};

// Export for use in development
export default runAllTests;
