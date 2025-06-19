import { db } from './db';
import { users } from '@shared/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function resetDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic database connection
    const result = await db.execute(`SELECT 1 as test`);
    console.log('✅ Database connection successful:', result);

    console.log('🗑️ Clearing existing users...');
    
    // Clear all existing users
    await db.delete(users);
    console.log('✅ All users cleared');

    console.log('👥 Creating sample users...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const mainBakerPassword = await bcrypt.hash('mainbaker123', 10);
    const juniorBakerPassword = await bcrypt.hash('juniorbaker123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    // Insert sample users
    const newUsers = await db.insert(users).values([
      {
        email: 'admin@bakery.com',
        username: 'admin',
        password: adminPassword,
        fullName: 'System Administrator',
        role: 'admin',
        completedOrders: 0
      },
      {
        email: 'mainbaker@bakery.com',
        username: 'mainbaker',
        password: mainBakerPassword,
        fullName: 'Master Baker',
        role: 'main_baker',
        completedOrders: 150
      },
      {
        email: 'juniorbaker@bakery.com',
        username: 'juniorbaker',
        password: juniorBakerPassword,
        fullName: 'Junior Baker',
        role: 'junior_baker',
        completedOrders: 45
      },
      {
        email: 'customer@bakery.com',
        username: 'customer',
        password: customerPassword,
        fullName: 'Happy Customer',
        role: 'customer',
        completedOrders: 0
      },
      {
        email: 'mmisba221373@bscse.uiu.ac.bd',
        username: 'bakery_bliss',
        password: customerPassword,
        fullName: 'Bakery Bliss',
        role: 'customer',
        completedOrders: 0
      }
    ]).returning();

    console.log('✅ Sample users created:');
    newUsers.forEach(user => {
      console.log(`  - ${user.role}: ${user.email} (${user.fullName})`);
    });

    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@bakery.com / admin123');
    console.log('Main Baker: mainbaker@bakery.com / mainbaker123');
    console.log('Junior Baker: juniorbaker@bakery.com / juniorbaker123');
    console.log('Customer: customer@bakery.com / customer123');
    console.log('Existing Customer: mmisba221373@bscse.uiu.ac.bd / customer123');

    // Test fetching users
    console.log('\n🔍 Testing user queries...');
    const adminUser = await db.select().from(users).where(eq(users.email, 'admin@bakery.com'));
    console.log('Admin user found:', adminUser.length > 0 ? '✅' : '❌');

    const allUsers = await db.select().from(users);
    console.log(`Total users in database: ${allUsers.length}`);

  } catch (error) {
    console.error('❌ Database operation failed:', error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase()
  .then(() => {
    console.log('\n🎉 Database reset completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Reset failed:', error);
    process.exit(1);
  });
