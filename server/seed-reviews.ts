import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_FEcUKuz6A7SO@ep-plain-river-a5bahlde-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
}

import { db } from "./db";
import { reviews, users, orders } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

async function seedReviews() {
  try {
    console.log("Starting to seed reviews...");

    // Get some users and orders to create reviews for
    const sampleUsers = await db.select().from(users).limit(5);
    const sampleOrders = await db.select().from(orders).limit(10);

    if (sampleUsers.length === 0 || sampleOrders.length === 0) {
      console.log("No users or orders found. Please ensure the database has sample data first.");
      return;
    }

    // Sample reviews data
    const sampleReviews = [
      {
        orderId: sampleOrders[0]?.id || 1,
        userId: sampleUsers[0]?.id || 1,
        juniorBakerId: sampleUsers[1]?.id || 2,
        rating: 5,
        comment: "Absolutely amazing! The custom birthday cake was exactly what I dreamed of. The layers were moist, the frosting was perfectly sweet, and the decorations were stunning. My daughter's face lit up when she saw it!",
        isVerifiedPurchase: true
      },
      {
        orderId: sampleOrders[1]?.id || 2,
        userId: sampleUsers[1]?.id || 2,
        juniorBakerId: sampleUsers[2]?.id || 3,
        rating: 5,
        comment: "I ordered cupcakes for my office party and everyone was raving about them! The chocolate ones were incredibly rich and the vanilla had the perfect balance of flavors. Will definitely order again!",
        isVerifiedPurchase: true
      },
      {
        orderId: sampleOrders[2]?.id || 3,
        userId: sampleUsers[2]?.id || 3,
        juniorBakerId: sampleUsers[1]?.id || 2,
        rating: 4,
        comment: "Great selection of pastries! The croissants were flaky and buttery, just like the ones I had in Paris. The only reason I'm not giving 5 stars is that my order was delayed by 30 minutes, but the quality more than made up for it.",
        isVerifiedPurchase: true
      },
      {
        orderId: sampleOrders[3]?.id || 4,
        userId: sampleUsers[3]?.id || 4,
        juniorBakerId: sampleUsers[2]?.id || 3,
        rating: 5,
        comment: "The wedding cake was a masterpiece! Not only did it look absolutely beautiful with the intricate sugar flowers, but it tasted divine. Our guests are still talking about it weeks later. Thank you for making our special day even more magical!",
        isVerifiedPurchase: true
      },
      {
        orderId: sampleOrders[4]?.id || 5,
        userId: sampleUsers[4]?.id || 5,
        juniorBakerId: sampleUsers[1]?.id || 2,
        rating: 5,
        comment: "I've been a regular customer for over a year now, and the consistency in quality is remarkable. The sourdough bread is my weekly staple - perfectly crusty outside, soft and airy inside. The staff is always friendly and helpful too!",
        isVerifiedPurchase: true
      },
      {
        orderId: sampleOrders[5]?.id || 6,
        userId: sampleUsers[0]?.id || 1,
        juniorBakerId: sampleUsers[2]?.id || 3,
        rating: 4,
        comment: "Tried the seasonal pumpkin spice muffins and they were delightful! Perfect amount of spice and not too sweet. The texture was spot on. Looking forward to trying more seasonal offerings.",
        isVerifiedPurchase: true
      }
    ];

    // Insert sample reviews
    for (const reviewData of sampleReviews) {
      try {
        await db.insert(reviews).values(reviewData);
        console.log(`Inserted review for order ${reviewData.orderId}`);
      } catch (error) {
        console.log(`Skipping review for order ${reviewData.orderId} (might already exist)`);
      }
    }

    console.log("Sample reviews seeded successfully!");
    
    // Fetch and display all reviews to verify
    const allReviews = await db.select().from(reviews).orderBy(desc(reviews.createdAt));
    console.log(`Total reviews in database: ${allReviews.length}`);
    
  } catch (error) {
    console.error("Error seeding reviews:", error);
  }
}

// Run the seed function
seedReviews().then(() => {
  console.log("Review seeding completed");
  process.exit(0);
}).catch((error) => {
  console.error("Error running seed:", error);
  process.exit(1);
});
