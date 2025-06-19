import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

dotenv.config();
neonConfig.webSocketConstructor = ws;

async function assignJuniorBakersToMainBakers() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { users } });
    
    console.log('🔗 Assigning junior bakers to main bakers...\n');
    
    // Get all main bakers
    const mainBakers = await db.select()
      .from(users)
      .where(eq(users.role, 'main_baker'));
    
    console.log('📋 Available main bakers:');
    mainBakers.forEach((baker, index) => {
      console.log(`${index + 1}. ${baker.fullName} (${baker.email}) - ID: ${baker.id}`);
    });
    
    if (mainBakers.length === 0) {
      console.log('❌ No main bakers found! Cannot assign junior bakers.');
      await pool.end();
      return;
    }
    
    // Get all junior bakers
    const juniorBakers = await db.select()
      .from(users)
      .where(eq(users.role, 'junior_baker'));
    
    console.log('\n👥 Junior bakers to assign:');
    juniorBakers.forEach((baker) => {
      console.log(`- ${baker.fullName} (${baker.email}) - ID: ${baker.id}`);
    });
    
    if (juniorBakers.length === 0) {
      console.log('ℹ️ No junior bakers found to assign.');
      await pool.end();
      return;
    }
    
    console.log('\n🔄 Assigning junior bakers...');
    
    // Assign each junior baker to a main baker (round-robin style)
    for (let i = 0; i < juniorBakers.length; i++) {
      const juniorBaker = juniorBakers[i];
      const mainBaker = mainBakers[i % mainBakers.length]; // Round-robin assignment
      
      // Update the junior baker's mainBakerId
      await db.update(users)
        .set({ mainBakerId: mainBaker.id })
        .where(eq(users.id, juniorBaker.id));
      
      console.log(`✅ Assigned ${juniorBaker.fullName} → ${mainBaker.fullName}`);
    }
    
    console.log('\n🎉 All junior bakers have been assigned to main bakers!');
    
    // Show final assignments
    console.log('\n📊 Final Assignments:');
    const updatedJuniorBakers = await db.select()
      .from(users)
      .where(eq(users.role, 'junior_baker'));
    
    for (const juniorBaker of updatedJuniorBakers) {
      if (juniorBaker.mainBakerId) {
        const [mainBaker] = await db.select()
          .from(users)
          .where(eq(users.id, juniorBaker.mainBakerId));
        
        console.log(`👨‍🍳 ${juniorBaker.fullName} works under ${mainBaker?.fullName || 'Unknown'}`);
      } else {
        console.log(`⚠️ ${juniorBaker.fullName} is not assigned to any main baker`);
      }
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

assignJuniorBakersToMainBakers();
