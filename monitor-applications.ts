import { db } from "./server/db";
import { bakerApplications, users } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function checkApplications() {
  console.log("🔍 Checking baker applications in database...\n");
  
  try {
    // Get all applications
    const applications = await db
      .select({
        id: bakerApplications.id,
        userId: bakerApplications.userId,
        mainBakerId: bakerApplications.mainBakerId,
        currentRole: bakerApplications.currentRole,
        requestedRole: bakerApplications.requestedRole,
        reason: bakerApplications.reason,
        status: bakerApplications.status,
        createdAt: bakerApplications.createdAt,
        userName: users.fullName
      })
      .from(bakerApplications)
      .leftJoin(users, eq(bakerApplications.userId, users.id));
    
    console.log(`📝 Total applications: ${applications.length}\n`);
    
    if (applications.length > 0) {
      console.log("Applications:");
      applications.forEach((app, index) => {
        console.log(`${index + 1}. Application #${app.id}`);
        console.log(`   User: ${app.userName} (ID: ${app.userId})`);
        console.log(`   Main Baker ID: ${app.mainBakerId}`);
        console.log(`   Role Change: ${app.currentRole} → ${app.requestedRole}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Created: ${app.createdAt}`);
        console.log(`   Reason: ${app.reason?.substring(0, 100)}...`);
        console.log("");
      });
    } else {
      console.log("No applications found.");
    }
    
  } catch (error) {
    console.error("❌ Error checking applications:", error);
  }
}

// Check initially
checkApplications();

// Check again in 10 seconds to see if any new applications were created
setTimeout(() => {
  console.log("\n🔄 Rechecking applications...");
  checkApplications();
}, 10000);
