import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

dotenv.config();
neonConfig.webSocketConstructor = ws;

async function verifyUserPassword() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { users } });
    
    // Get the main baker user
    const [user] = await db.select().from(users).where(eq(users.email, 'mainbaker@bakery.com'));
    
    console.log('🔍 User details:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Stored hash:', user.password);
    
    // Test the password
    console.log('\n🧪 Testing password verification:');
    const testPassword = 'baker123';
    console.log('Test password:', `"${testPassword}"`);
    console.log('Test password length:', testPassword.length);
    console.log('Test password bytes:', Buffer.from(testPassword).toString('hex'));
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('bcrypt.compare result:', isValid);
    
    if (isValid) {
      console.log('✅ Password is correct! The issue is elsewhere.');
    } else {
      console.log('❌ Password verification failed. Let\'s fix it...');
      
      // Generate new hash and update
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash generated:', newHash);
      
      // Update the user
      await db.update(users)
        .set({ password: newHash })
        .where(eq(users.email, 'mainbaker@bakery.com'));
      
      console.log('✅ Password updated in database');
      
      // Verify the update worked
      const [updatedUser] = await db.select().from(users).where(eq(users.email, 'mainbaker@bakery.com'));
      const verifyUpdate = await bcrypt.compare(testPassword, updatedUser.password);
      console.log('Verification after update:', verifyUpdate ? '✅ SUCCESS' : '❌ FAILED');
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verifyUserPassword();
