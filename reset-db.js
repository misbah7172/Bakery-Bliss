import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Use a workaround to import from TypeScript file
const schema = await import('./shared/schema.ts');
const { users } = schema;

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
    
    // Clear existing users
    console.log('🗑️ Clearing existing user data...');
    await db.delete(users);
    console.log('✅ User data cleared');
    
    // Create sample users
    console.log('👥 Creating sample users...');
    
    const sampleUsers = [
      {
        email: 'admin@bakery.com',
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        fullName: 'System Administrator',
        role: 'admin',
        completedOrders: 0
      },
      {
        email: 'mainbaker@bakery.com',
        username: 'main_baker_1',
        password: await bcrypt.hash('baker123', 10),
        fullName: 'Master Baker Alice',
        role: 'main_baker',
        completedOrders: 50
      },
      {
        email: 'mainbaker2@bakery.com',
        username: 'main_baker_2',
        password: await bcrypt.hash('baker123', 10),
        fullName: 'Master Baker Bob',
        role: 'main_baker',
        completedOrders: 75
      },
      {
        email: 'juniorbaker@bakery.com',
        username: 'junior_baker_1',
        password: await bcrypt.hash('junior123', 10),
        fullName: 'Junior Baker Carol',
        role: 'junior_baker',
        completedOrders: 25
      },
      {
        email: 'customer@bakery.com',
        username: 'customer_1',
        password: await bcrypt.hash('customer123', 10),
        fullName: 'Customer Dave',
        role: 'customer',
        completedOrders: 0
      },
      {
        email: 'mmisba221373@bscse.uiu.ac.bd',
        username: 'bakery_bliss',
        password: await bcrypt.hash('password123', 10),
        fullName: 'Bakery Bliss',
        role: 'customer',
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
