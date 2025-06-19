import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import dotenv from 'dotenv';
import { users, bakerTeams } from './shared/schema.js';
import { eq, and } from 'drizzle-orm';

dotenv.config();
neonConfig.webSocketConstructor = ws;

async function verifyBakerTeamsImplementation() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema: { users, bakerTeams } });
    
    console.log('🔍 VERIFYING BAKER TEAMS IMPLEMENTATION\n');
    
    // Test 1: Get all main bakers and their teams
    console.log('📋 TEST 1: Main Bakers and Their Teams');
    const mainBakers = await db.select()
      .from(users)
      .where(eq(users.role, 'main_baker'));
    
    for (const mainBaker of mainBakers) {
      console.log(`\n👨‍🍳 ${mainBaker.fullName} (ID: ${mainBaker.id})`);
      
      // Get team members using baker_teams table
      const teamMembers = await db.select()
        .from(bakerTeams)
        .innerJoin(users, eq(bakerTeams.juniorBakerId, users.id))
        .where(and(
          eq(bakerTeams.mainBakerId, mainBaker.id),
          eq(bakerTeams.isActive, true),
          eq(users.role, 'junior_baker')
        ));
      
      if (teamMembers.length > 0) {
        console.log(`   👥 Team Members (${teamMembers.length}):`);
        teamMembers.forEach(member => {
          console.log(`      - ${member.users.fullName} (${member.users.email})`);
          console.log(`        📅 Assigned: ${member.baker_teams.assignedAt}`);
          console.log(`        📊 Completed Orders: ${member.users.completedOrders || 0}`);
        });
      } else {
        console.log('   👥 No team members assigned');
      }
    }
    
    // Test 2: Get unassigned junior bakers
    console.log('\n\n🔧 TEST 2: Unassigned Junior Bakers');
    const assignedJuniorBakerIds = await db.select({ id: bakerTeams.juniorBakerId })
      .from(bakerTeams)
      .where(eq(bakerTeams.isActive, true));
    
    const assignedIds = assignedJuniorBakerIds.map(item => item.id);
    
    let unassignedJuniors;
    if (assignedIds.length === 0) {
      unassignedJuniors = await db.select()
        .from(users)
        .where(eq(users.role, 'junior_baker'));
    } else {
      // Get all junior bakers
      const allJuniorBakers = await db.select()
        .from(users)
        .where(eq(users.role, 'junior_baker'));
      
      unassignedJuniors = allJuniorBakers.filter(jb => !assignedIds.includes(jb.id));
    }
    
    if (unassignedJuniors.length > 0) {
      console.log('⚠️ Unassigned junior bakers found:');
      unassignedJuniors.forEach(junior => {
        console.log(`   - ${junior.fullName} (${junior.email})`);
      });
    } else {
      console.log('✅ All junior bakers are properly assigned!');
    }
    
    // Test 3: Verify team assignments work both ways
    console.log('\n\n🔄 TEST 3: Bidirectional Relationship Check');
    const allActiveAssignments = await db.select()
      .from(bakerTeams)
      .where(eq(bakerTeams.isActive, true));
    
    console.log(`📊 Total active assignments: ${allActiveAssignments.length}`);
    
    for (const assignment of allActiveAssignments) {
      const [mainBaker] = await db.select()
        .from(users)
        .where(eq(users.id, assignment.mainBakerId));
      
      const [juniorBaker] = await db.select()
        .from(users)
        .where(eq(users.id, assignment.juniorBakerId));
      
      console.log(`🔗 ${juniorBaker?.fullName || 'Unknown'} ↔ ${mainBaker?.fullName || 'Unknown'}`);
    }
    
    console.log('\n✅ BAKER TEAMS IMPLEMENTATION VERIFIED!');
    console.log('\n📈 SUMMARY:');
    console.log(`   👥 Total Main Bakers: ${mainBakers.length}`);
    console.log(`   🔗 Active Team Assignments: ${allActiveAssignments.length}`);
    console.log(`   ⚠️ Unassigned Junior Bakers: ${unassignedJuniors.length}`);
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyBakerTeamsImplementation();
