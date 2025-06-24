import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

import { db } from "./server/db.js";
import { orders, users, products } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";

async function debugAndCreateTestData() {
  console.log("=== DEBUG: Current Database State ===");
  
  // Get all users
  const allUsers = await db.select().from(users);
  console.log("\nAll Users:");
  allUsers.forEach(user => {
    console.log(`- ID: ${user.id}, Name: ${user.fullName}, Email: ${user.email}, Role: ${user.role}`);
  });
  
  // Get all orders
  const allOrders = await db.select().from(orders);
  console.log("\nAll Orders:");
  allOrders.forEach(order => {
    console.log(`- Order ID: ${order.id}, OrderID: ${order.orderId}, Status: ${order.status}, MainBaker: ${order.mainBakerId}, JuniorBaker: ${order.juniorBakerId}, Customer: ${order.userId}`);
  });
  
  // Get all products
  const allProducts = await db.select().from(products);
  console.log("\nAll Products:");
  allProducts.forEach(product => {
    console.log(`- Product ID: ${product.id}, Name: ${product.name}, MainBaker: ${product.mainBakerId}`);
  });
  
  // Find main bakers
  const mainBakers = allUsers.filter(user => user.role === 'main_baker');
  const customers = allUsers.filter(user => user.role === 'customer');
  
  if (mainBakers.length === 0) {
    console.log("\n❌ No main bakers found. Please create a main baker user first.");
    return;
  }
  
  if (customers.length === 0) {
    console.log("\n❌ No customers found. Please create a customer user first.");
    return;
  }
  
  console.log(`\n✅ Found ${mainBakers.length} main baker(s) and ${customers.length} customer(s)`);
  
  // Create a test order if none exist for the main baker
  const mainBaker = mainBakers[0];
  const customer = customers[0];
  
  const existingOrdersForMainBaker = allOrders.filter(order => order.mainBakerId === mainBaker.id);
  
  if (existingOrdersForMainBaker.length === 0) {
    console.log(`\n🔄 Creating test order for main baker ${mainBaker.fullName}...`);
    
    // Create a test order
    const newOrder = {
      orderId: `BB-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: customer.id,
      status: 'pending',
      totalAmount: 25.99,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      mainBakerId: mainBaker.id,
      juniorBakerId: null
    };
    
    const [createdOrder] = await db.insert(orders).values(newOrder).returning();
    console.log(`✅ Created test order: ${createdOrder.orderId} for main baker ${mainBaker.fullName}`);
  } else {
    console.log(`\n✅ Main baker ${mainBaker.fullName} already has ${existingOrdersForMainBaker.length} order(s)`);
  }
  
  // Show final state
  const finalOrders = await db.select().from(orders).where(eq(orders.mainBakerId, mainBaker.id));
  console.log(`\nFinal orders for main baker ${mainBaker.fullName}:`);
  finalOrders.forEach(order => {
    console.log(`- ${order.orderId}: ${order.status} (Customer: ${order.userId})`);
  });
}

debugAndCreateTestData().catch(console.error).finally(() => process.exit(0));
