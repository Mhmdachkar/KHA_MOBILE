// Secondary Categories Verification Script
// This script verifies that products appear in their secondary categories

import { getProductsByCategory } from "@/data/products";

// Test secondary categories
const testSecondaryCategories = () => {
  console.log('🔍 Testing Secondary Categories Implementation');
  console.log('=============================================\n');

  // Test cases: products that should appear in secondary categories
  const testCases = [
    {
      productName: "Samsung Galaxy Watch 3",
      primaryCategory: "Wearables",
      secondaryCategories: ["Smartwatches", "Fitness", "Premium"],
      testCategories: ["Smartwatches", "Fitness", "Premium"]
    },
    {
      productName: "Original Samsung Adapter 65W",
      primaryCategory: "Accessories", 
      secondaryCategories: ["Charging", "Electronics"],
      testCategories: ["Charging", "Electronics"]
    },
    {
      productName: "Apple Original Adapter 20W",
      primaryCategory: "Accessories",
      secondaryCategories: ["Charging", "Electronics"], 
      testCategories: ["Charging", "Electronics"]
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. Testing: ${testCase.productName}`);
    console.log(`   Primary: ${testCase.primaryCategory}`);
    console.log(`   Secondary: ${testCase.secondaryCategories.join(', ')}`);
    
    // Check if product appears in secondary categories
    testCase.testCategories.forEach(category => {
      const categoryProducts = getProductsByCategory(category);
      const foundInCategory = categoryProducts.some(p => p.name === testCase.productName);
      
      console.log(`   ✅ ${category}: ${foundInCategory ? 'FOUND' : 'NOT FOUND'}`);
      
      if (foundInCategory) {
        const product = categoryProducts.find(p => p.name === testCase.productName);
        console.log(`      - ID: ${product?.id}, Price: $${product?.price}`);
      }
    });
    console.log('');
  });

  // Test some specific categories to show all products
  console.log('📋 All products in "Charging" category:');
  const chargingProducts = getProductsByCategory('Charging');
  chargingProducts.forEach(product => {
    const isPrimary = product.category === 'Charging';
    const isSecondary = product.secondaryCategories?.includes('Charging');
    const type = isPrimary ? 'PRIMARY' : 'SECONDARY';
    console.log(`   - ${product.name} (${type}) - $${product.price}`);
  });

  console.log('\n📋 All products in "Electronics" category:');
  const electronicsProducts = getProductsByCategory('Electronics');
  electronicsProducts.forEach(product => {
    const isPrimary = product.category === 'Electronics';
    const isSecondary = product.secondaryCategories?.includes('Electronics');
    const type = isPrimary ? 'PRIMARY' : 'SECONDARY';
    console.log(`   - ${product.name} (${type}) - $${product.price}`);
  });

  console.log('\n📋 All products in "Smartwatches" category:');
  const smartwatchesProducts = getProductsByCategory('Smartwatches');
  smartwatchesProducts.forEach(product => {
    const isPrimary = product.category === 'Smartwatches';
    const isSecondary = product.secondaryCategories?.includes('Smartwatches');
    const type = isPrimary ? 'PRIMARY' : 'SECONDARY';
    console.log(`   - ${product.name} (${type}) - $${product.price}`);
  });
};

// Run the test
testSecondaryCategories();

console.log('\n✅ Secondary Categories Verification Complete!');
console.log('All products should appear in their primary AND secondary categories.');
