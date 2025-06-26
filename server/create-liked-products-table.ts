import "dotenv/config";
import { db } from "./db";
import { sql } from "drizzle-orm";

const createLikedProductsTable = async () => {
  try {
    console.log("Creating liked_products table...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "liked_products" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "product_id" integer NOT NULL,
        "created_at" timestamp DEFAULT now(),
        CONSTRAINT "liked_products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action,
        CONSTRAINT "liked_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE cascade ON UPDATE no action
      );
    `);
    
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "liked_products_user_product_unique" ON "liked_products" ("user_id","product_id");
    `);
    
    console.log("✅ liked_products table created successfully!");
    
  } catch (error) {
    console.error("❌ Error creating liked_products table:", error);
  }
  
  process.exit(0);
};

createLikedProductsTable();
