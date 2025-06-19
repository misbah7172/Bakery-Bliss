import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { users, products, orders, orderItems, bakerTeams, bakerApplications } from './shared/schema.js';
import { eq } from 'drizzle-orm';

dotenv.config();
neonConfig.webSocketConstructor = ws;

async function cleanDatabase() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { users } });
    
    console.log('🧹 Cleaning database completely...');
    
    // Clear ALL data
    try { await db.delete(orderItems); } catch (e) {}
    try { await db.delete(orders); } catch (e) {}
    try { await db.delete(bakerTeams); } catch (e) {}
    try { await db.delete(bakerApplications); } catch (e) {}
    try { await db.delete(products); } catch (e) {}
    try { await db.delete(users); } catch (e) {}
    
    console.log('✅ All data cleared');
    
    // Create ONLY our test users
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
      }
    ];
    
    console.log('👥 Creating clean test users...');
    
    for (const user of sampleUsers) {
      const [insertedUser] = await db.insert(users).values(user).returning();
      console.log(`✅ Created ${insertedUser.role}: ${insertedUser.fullName} (${insertedUser.email})`);
    }
    
    console.log('\n🎉 Database cleaned and reset successfully!');
    console.log('\n📋 Login Credentials (EXACT):');
    console.log('👑 Admin: admin@bakery.com / admin123');
    console.log('👨‍🍳 Main Baker 1: mainbaker@bakery.com / baker123');
    console.log('👨‍🍳 Main Baker 2: mainbaker2@bakery.com / baker123');
    console.log('🧑‍🍳 Junior Baker: juniorbaker@bakery.com / junior123');
    console.log('👤 Customer: customer@bakery.com / customer123');
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database error:', error);
    process.exit(1);
  }
}

cleanDatabase();
