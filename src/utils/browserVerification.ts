// Manual Product Verification Test
// Run this script in the browser console to verify all products

// Import the verification functions (these would be available in development)
import { generateVerificationReport, getAllProductMappings, verifyProductDetailPage } from './productVerification';

// Declare window interface extensions
declare global {
  interface Window {
    runProductVerification: () => any;
    testProduct: (productId: string | number) => any;
    testCategory: (categoryName: string) => any;
  }
}

// Function to run verification in browser
window.runProductVerification = () => {
  console.log('🔍 Starting Product Verification...\n');
  
  try {
    // Get all products
    const allProducts = getAllProductMappings();
    console.log(`Total products found: ${allProducts.length}`);
    
    // Test each product
    const results = {
      total: allProducts.length,
      working: 0,
      broken: 0,
      issues: []
    };
    
    allProducts.forEach(product => {
      const verification = verifyProductDetailPage(product.id);
      
      if (verification.exists) {
        results.working++;
      } else {
        results.broken++;
        results.issues.push({
          id: product.id,
          name: product.name,
          category: product.category,
          error: verification.error
        });
      }
    });
    
    // Display results
    console.log('\n📊 VERIFICATION RESULTS:');
    console.log(`Total Products: ${results.total}`);
    console.log(`Working Links: ${results.working} ✅`);
    console.log(`Broken Links: ${results.broken} ❌`);
    
    if (results.issues.length > 0) {
      console.log('\n❌ BROKEN LINKS:');
      results.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.name} (ID: ${issue.id})`);
        console.log(`   Category: ${issue.category}`);
        console.log(`   Error: ${issue.error}`);
        console.log(`   URL: /product/${issue.id}\n`);
      });
    } else {
      console.log('\n✅ All product detail pages are working correctly!');
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error running verification:', error);
    return null;
  }
};

// Function to test specific product
window.testProduct = (productId) => {
  const verification = verifyProductDetailPage(Number(productId));
  console.log(`Testing Product ID: ${productId}`);
  console.log(`Result: ${verification.exists ? '✅ Working' : '❌ Broken'}`);
  if (!verification.exists) {
    console.log(`Error: ${verification.error}`);
  }
  if (verification.product) {
    console.log(`Product: ${verification.product.name}`);
    console.log(`Category: ${verification.product.category}`);
    console.log(`Brand: ${verification.product.brand}`);
  }
  return verification;
};

// Function to test category
window.testCategory = (categoryName) => {
  const allProducts = getAllProductMappings();
  const categoryProducts = allProducts.filter(p => 
    p.category.toLowerCase() === categoryName.toLowerCase()
  );
  
  console.log(`\n🎮 Testing Category: ${categoryName}`);
  console.log(`Found ${categoryProducts.length} products\n`);
  
  categoryProducts.slice(0, 5).forEach(product => {
    const verification = verifyProductDetailPage(product.id);
    console.log(`${product.name} (ID: ${product.id}): ${verification.exists ? '✅' : '❌'}`);
    if (!verification.exists) {
      console.log(`  Error: ${verification.error}`);
    }
  });
  
  return categoryProducts;
};

console.log('🚀 Product Verification Tools Loaded!');
console.log('Available commands:');
console.log('- runProductVerification() - Test all products');
console.log('- testProduct(productId) - Test specific product');
console.log('- testCategory(categoryName) - Test specific category');
console.log('\nExample: runProductVerification()');
