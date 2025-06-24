// Cart Fix Verification Test
// Run this in browser console to verify cart isolation

console.log("🛒 CART ISOLATION TEST");
console.log("=".repeat(50));

// Check current localStorage keys
const allKeys = Object.keys(localStorage);
const cartKeys = allKeys.filter(key => key.startsWith('bakeryBlissCart'));

console.log("📦 Current cart-related localStorage keys:");
cartKeys.forEach(key => {
  const data = localStorage.getItem(key);
  console.log(`  ${key}:`, data ? JSON.parse(data).length + " items" : "empty");
});

// Check session management
const sessionId = localStorage.getItem('bakeryBlissSessionId');
console.log("🔑 Anonymous session ID:", sessionId);

// Test scenarios
console.log("\n🧪 TO TEST CART ISOLATION:");
console.log("1. Add products to cart (should create user-specific or session-specific cart)");
console.log("2. Open incognito window - cart should be empty");
console.log("3. Login/logout - cart should change appropriately");
console.log("4. Check localStorage keys change based on user");

// Helper function to monitor cart changes
window.monitorCart = function() {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (key.includes('bakeryBlissCart')) {
      console.log(`🔄 Cart updated: ${key} →`, JSON.parse(value).length + " items");
    }
    return originalSetItem.apply(this, arguments);
  };
  console.log("✅ Cart monitoring enabled - add items to see updates");
};

console.log("\n💡 Run 'monitorCart()' to see real-time cart updates");
