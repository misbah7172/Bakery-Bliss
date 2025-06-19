import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import { users } from './shared/schema.js';

dotenv.config();
neonConfig.webSocketConstructor = ws;

async function checkUsers() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { users } });
    
    console.log('📋 Current users in database:');
    const allUsers = await db.select().from(users);
    
    allUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} | username: ${user.username} | id: ${user.id}`);
    });
    
    console.log('\n🔑 Test these exact credentials:');
    allUsers.forEach(user => {
      console.log(`${user.email} / [use the password from our reset script]`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUsers();
