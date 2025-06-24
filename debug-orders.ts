import * as dotenv from 'dotenv';
dotenv.config();

import { db } from "./server/db";
import { orders, users } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function debugOrders() {
  console.log("=== DEBUG: Orders and Main Bakers ===");
  
  // Get all main bakers
  const mainBakers = await db.select()
    .from(users)
    .where(eq(users.role, 'main_baker'));
  
  console.log("\nMain Bakers:");
  mainBakers.forEach(baker => {
    console.log(`- ID: ${baker.id}, Name: ${baker.fullName}, Email: ${baker.email}`);
  });
  
  // Get all orders
  const allOrders = await db.select().from(orders);
  
  console.log("\nAll Orders:");
  allOrders.forEach(order => {
    console.log(`- Order ID: ${order.id}, OrderID: ${order.orderId}, Status: ${order.status}, MainBaker: ${order.mainBakerId}, JuniorBaker: ${order.juniorBakerId}, Customer: ${order.userId}`);
  });
  
  // Get orders for each main baker
  for (const baker of mainBakers) {
    const bakerOrders = await db.select()
      .from(orders)
      .where(eq(orders.mainBakerId, baker.id));
    
    console.log(`\nOrders for Main Baker ${baker.fullName} (ID: ${baker.id}):`);
    if (bakerOrders.length === 0) {
      console.log("  No orders found");
    } else {
      bakerOrders.forEach(order => {
        console.log(`  - ${order.orderId}: ${order.status} (Customer: ${order.userId})`);
      });
    }
  }
}

debugOrders().catch(console.error);
