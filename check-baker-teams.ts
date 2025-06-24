import { db } from "./server/db.ts";
import { users, bakerTeams } from "./drizzle/schema.ts";
import { eq, and } from "drizzle-orm";

async function checkBakerTeams() {
  console.log("=== Checking Baker Teams ===");
  
  // Get all main bakers
  const mainBakers = await db.select().from(users).where(eq(users.role, 'main_baker'));
  console.log("Main bakers:", mainBakers.length);
  
  for (const mainBaker of mainBakers) {
    console.log(`\nMain Baker: ${mainBaker.fullName} (ID: ${mainBaker.id})`);
    
    // Get junior bakers for this main baker
    const teamMembers = await db.select()
      .from(bakerTeams)
      .innerJoin(users, eq(bakerTeams.juniorBakerId, users.id))
      .where(and(
        eq(bakerTeams.mainBakerId, mainBaker.id),
        eq(bakerTeams.isActive, true),
        eq(users.role, 'junior_baker')
      ));
    
    console.log(`  Team size: ${teamMembers.length}`);
    teamMembers.forEach(member => {
      console.log(`  - ${member.users.fullName} (ID: ${member.users.id})`);
    });
  }
  
  // Get all junior bakers
  const juniorBakers = await db.select().from(users).where(eq(users.role, 'junior_baker'));
  console.log(`\nTotal junior bakers: ${juniorBakers.length}`);
  
  // Get all baker team relationships
  const allTeams = await db.select().from(bakerTeams).where(eq(bakerTeams.isActive, true));
  console.log(`Active team relationships: ${allTeams.length}`);
  
  process.exit(0);
}

checkBakerTeams().catch(console.error);
