// Simple test to check storage method calls
import { storage } from "./server/storage.ts";

async function testStorageMethods() {
  try {
    console.log("Testing storage methods...");
    
    // Test getUserByEmail
    console.log("Testing getUserByEmail...");
    const user = await storage.getUserByEmail("test@test.com");
    console.log("getUserByEmail result:", user);
    
    console.log("All tests passed!");
  } catch (error) {
    console.error("Storage test failed:", error);
  }
}

testStorageMethods();
