import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

dotenv.config();
neonConfig.webSocketConstructor = ws;

async function showBakerTeamStatus() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { users } });
    
    console.log('👥 BAKER TEAM RELATIONSHIPS\n');
    
    // Get all main bakers
    const mainBakers = await db.select()
      .from(users)
      .where(eq(users.role, 'main_baker'));
    
    console.log('🎯 MAIN BAKERS:');
    for (const mainBaker of mainBakers) {
      console.log(`\n📋 ${mainBaker.fullName} (${mainBaker.email})`);
      console.log(`   ID: ${mainBaker.id}`);
      
      // Get junior bakers assigned to this main baker
      const juniorBakers = await db.select()
        .from(users)
        .where(eq(users.mainBakerId, mainBaker.id));
      
      if (juniorBakers.length > 0) {
        console.log(`   👥 Team Members (${juniorBakers.length}):`);
        juniorBakers.forEach(junior => {
          console.log(`      - ${junior.fullName} (${junior.email})`);
          console.log(`        📊 Completed Orders: ${junior.completedOrders || 0}`);
        });
      } else {
        console.log(`   👥 Team Members: None assigned yet`);
      }
    }
    
    console.log('\n\n🔧 UNASSIGNED JUNIOR BAKERS:');
    const unassignedJuniors = await db.select()
      .from(users)
      .where(eq(users.role, 'junior_baker'))
      .then(juniors => juniors.filter(j => !j.mainBakerId));
    
    if (unassignedJuniors.length > 0) {
      unassignedJuniors.forEach(junior => {
        console.log(`   ⚠️ ${junior.fullName} (${junior.email}) - Not assigned to any main baker`);
      });
    } else {
      console.log('   ✅ All junior bakers are assigned to main bakers');
    }
    
    console.log('\n✅ Database relationship check complete!');
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

showBakerTeamStatus();
