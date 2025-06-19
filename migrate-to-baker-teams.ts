import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import { users, bakerTeams } from './shared/schema.js';
import { eq, and } from 'drizzle-orm';

dotenv.config();
neonConfig.webSocketConstructor = ws;

async function migrateToBakerTeams() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { users, bakerTeams } });
    
    console.log('🔄 Migrating junior baker assignments to baker_teams table...\n');
    
    // Get all junior bakers who have a mainBakerId assigned
    const juniorBakersWithMainBaker = await db.select()
      .from(users)
      .where(and(
        eq(users.role, 'junior_baker')
        // We removed mainBakerId from schema, so we'll manually assign them
      ));
    
    console.log('👥 Junior bakers found:', juniorBakersWithMainBaker.length);
    
    // For now, let's assign them manually based on what we know from the previous script
    const assignments = [
      { juniorBakerId: 2, mainBakerId: 1, juniorName: 'Master Baker (baker@bakery.com)', mainName: 'MD Habibulla Misba' },
      { juniorBakerId: 7, mainBakerId: 6, juniorName: 'Junior Baker (junior@bakerybliss.com)', mainName: 'Main Baker (baker@bakerybliss.com)' },
      { juniorBakerId: 12, mainBakerId: 10, juniorName: 'Junior Baker Carol (juniorbaker@bakery.com)', mainName: 'Master Baker Alice (mainbaker@bakery.com)' }
    ];
    
    console.log('🔗 Creating baker team assignments:\n');
    
    for (const assignment of assignments) {
      // Check if assignment already exists
      const [existingAssignment] = await db.select()
        .from(bakerTeams)
        .where(and(
          eq(bakerTeams.juniorBakerId, assignment.juniorBakerId),
          eq(bakerTeams.mainBakerId, assignment.mainBakerId),
          eq(bakerTeams.isActive, true)
        ));
      
      if (existingAssignment) {
        console.log(`✅ Assignment already exists: ${assignment.juniorName} → ${assignment.mainName}`);
      } else {
        // Create new assignment
        await db.insert(bakerTeams).values({
          mainBakerId: assignment.mainBakerId,
          juniorBakerId: assignment.juniorBakerId,
          isActive: true
        });
        
        console.log(`🆕 Created assignment: ${assignment.juniorName} → ${assignment.mainName}`);
      }
    }
    
    console.log('\n📊 Final baker teams:');
    
    // Show all active assignments
    const allAssignments = await db.select()
      .from(bakerTeams)
      .innerJoin(users, eq(bakerTeams.juniorBakerId, users.id))
      .where(eq(bakerTeams.isActive, true));
    
    for (const assignment of allAssignments) {
      const [mainBaker] = await db.select()
        .from(users)
        .where(eq(users.id, assignment.baker_teams.mainBakerId));
      
      console.log(`👨‍🍳 ${assignment.users.fullName} works under ${mainBaker?.fullName || 'Unknown'}`);
    }
    
    // Check for unassigned junior bakers
    const allJuniorBakers = await db.select()
      .from(users)
      .where(eq(users.role, 'junior_baker'));
    
    const assignedJuniorIds = allAssignments.map(a => a.baker_teams.juniorBakerId);
    const unassigned = allJuniorBakers.filter(jb => !assignedJuniorIds.includes(jb.id));
    
    if (unassigned.length > 0) {
      console.log('\n⚠️ Unassigned junior bakers:');
      unassigned.forEach(jb => {
        console.log(`   - ${jb.fullName} (${jb.email})`);
      });
    } else {
      console.log('\n✅ All junior bakers are assigned to teams!');
    }
    
    console.log('\n🎉 Migration to baker_teams table completed!');
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

migrateToBakerTeams();
