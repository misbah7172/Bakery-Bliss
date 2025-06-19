import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { users, products, orders, orderItems, bakerTeams, bakerApplications } from './shared/schema.js';

dotenv.config();
neonConfig.webSocketConstructor = ws;

async function resetDatabase() {
  console.log('🔄 Connecting to database...');
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Create database connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { users } });
    
    console.log('✅ Database connected successfully!');
      // Clear existing data in correct order (to avoid foreign key constraints)
    console.log('🗑️ Clearing existing data...');
    
    try {
      await db.delete(orderItems);
      console.log('✅ Order items cleared');
    } catch (e) {
      console.log('ℹ️ Order items table empty or doesn\'t exist');
    }
    
    try {
      await db.delete(orders);
      console.log('✅ Orders cleared');
    } catch (e) {
      console.log('ℹ️ Orders table empty or doesn\'t exist');
    }
    
    try {
      await db.delete(bakerTeams);
      console.log('✅ Baker teams cleared');
    } catch (e) {
      console.log('ℹ️ Baker teams table empty or doesn\'t exist');
    }
    
    try {
      await db.delete(bakerApplications);
      console.log('✅ Baker applications cleared');
    } catch (e) {
      console.log('ℹ️ Baker applications table empty or doesn\'t exist');
    }
    
    try {
      await db.delete(products);
      console.log('✅ Products cleared');
    } catch (e) {
      console.log('ℹ️ Products table empty or doesn\'t exist');
    }
    
    try {
      await db.delete(users);
      console.log('✅ Users cleared');
    } catch (e) {
      console.log('ℹ️ Users table empty or doesn\'t exist');
    }
    
    // Create sample users
    console.log('👥 Creating sample users...');
      const sampleUsers = [
      {
        email: 'admin@bakery.com',
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        fullName: 'System Administrator',
        role: 'admin' as const,
        completedOrders: 0
      },
      {
        email: 'mainbaker@bakery.com',
        username: 'main_baker_1',
        password: await bcrypt.hash('baker123', 10),
        fullName: 'Master Baker Alice',
        role: 'main_baker' as const,
        completedOrders: 50
      },
      {
        email: 'mainbaker2@bakery.com',
        username: 'main_baker_2',
        password: await bcrypt.hash('baker123', 10),
        fullName: 'Master Baker Bob',
        role: 'main_baker' as const,
        completedOrders: 75
      },
      {
        email: 'juniorbaker@bakery.com',
        username: 'junior_baker_1',
        password: await bcrypt.hash('junior123', 10),
        fullName: 'Junior Baker Carol',
        role: 'junior_baker' as const,
        completedOrders: 25
      },
      {
        email: 'customer@bakery.com',
        username: 'customer_1',
        password: await bcrypt.hash('customer123', 10),
        fullName: 'Customer Dave',
        role: 'customer' as const,
        completedOrders: 0
      },
      {
        email: 'mmisba221373@bscse.uiu.ac.bd',
        username: 'bakery_bliss',
        password: await bcrypt.hash('password123', 10),
        fullName: 'Bakery Bliss',
        role: 'customer' as const,
        completedOrders: 0
      }
    ];
    
    // Insert users
    for (const user of sampleUsers) {
      try {
        const [insertedUser] = await db.insert(users).values(user).returning();
        console.log(`✅ Created ${insertedUser.role}: ${insertedUser.fullName} (${insertedUser.email})`);
      } catch (error) {
        console.error(`❌ Failed to create user ${user.email}:`, error.message);
      }
    }
    
    console.log('\n🎉 Database reset completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@bakery.com / admin123');
    console.log('Main Baker 1: mainbaker@bakery.com / baker123');
    console.log('Main Baker 2: mainbaker2@bakery.com / baker123');
    console.log('Junior Baker: juniorbaker@bakery.com / junior123');
    console.log('Customer 1: customer@bakery.com / customer123');
    console.log('Customer 2: mmisba221373@bscse.uiu.ac.bd / password123');
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }
}

resetDatabase();
