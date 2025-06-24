import { db } from "./server/db";
import { users, bakerApplications } from "./drizzle/schema";

async function checkDatabaseState() {
  console.log("🔍 Checking database state...\n");
  
  try {
    // Check users
    const allUsers = await db.select().from(users);
    console.log(`👥 Total users: ${allUsers.length}`);
      if (allUsers.length > 0) {
      console.log("\nUsers:");
      allUsers.forEach(user => {
        console.log(`- ${user.fullName} (${user.email}) - Role: ${user.role}`);
      });
    }
    
    // Check baker applications
    const applications = await db.select().from(bakerApplications);
    console.log(`\n📝 Total baker applications: ${applications.length}`);
    
    if (applications.length > 0) {
      console.log("\nApplications:");
      applications.forEach(app => {
        console.log(`- User ${app.userId} -> Main Baker ${app.mainBakerId} - Status: ${app.status}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error checking database:", error);
  }
}

checkDatabaseState();
