// Browser Console Test Script for Customer Application Feature
// Copy and paste this script into the browser console when on http://localhost:5000

console.log("🧪 Starting Customer Application Browser Test...\n");

// Test configuration
const TEST_CONFIG = {
  customer: {
    email: "customer@bakery.com",
    password: "password123"
  },
  testReason: "I am passionate about baking and would love to learn from experienced bakers. I have been practicing at home for several years and feel ready to take my skills to the next level."
};

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check current page
const getCurrentPath = () => window.location.pathname;

// Test functions
const tests = {
  async checkCurrentPage() {
    console.log(`📍 Current page: ${getCurrentPath()}`);
    return getCurrentPath();
  },

  async navigateToLogin() {
    console.log("🔑 Navigating to login page...");
    window.location.href = "/login";
    await wait(2000);
  },

  async navigateToCustomerDashboard() {
    console.log("🏠 Navigating to customer dashboard...");
    window.location.href = "/dashboard/customer";
    await wait(2000);
  },

  async navigateToApplyPage() {
    console.log("📝 Navigating to apply page...");
    window.location.href = "/dashboard/customer/apply";
    await wait(2000);
  },

  async testMainBakersAPI() {
    console.log("👨‍🍳 Testing main bakers API...");
    try {
      const response = await fetch("/api/main-bakers", {
        credentials: "include"
      });
      
      if (response.ok) {
        const bakers = await response.json();
        console.log(`✅ Main bakers loaded: ${bakers.length} found`);
        console.log("Bakers:", bakers.map(b => b.fullName).join(", "));
        return bakers;
      } else {
        console.log(`❌ Main bakers API failed: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.log("❌ Main bakers API error:", error);
      return null;
    }
  },

  async testApplicationStatusAPI() {
    console.log("📊 Testing application status API...");
    try {
      const response = await fetch("/api/customer/application-status", {
        credentials: "include"
      });
      
      if (response.ok) {
        const status = await response.json();
        console.log("✅ Application status:", status);
        return status;
      } else {
        console.log(`❌ Application status API failed: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.log("❌ Application status API error:", error);
      return null;
    }
  },

  async testSubmitApplication(mainBakerId) {
    console.log("📤 Testing application submission...");
    try {
      const applicationData = {
        mainBakerId: mainBakerId,
        currentRole: "customer",
        requestedRole: "junior_baker",
        reason: TEST_CONFIG.testReason
      };

      const response = await fetch("/api/baker-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(applicationData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Application submitted successfully:", result);
        return result;
      } else {
        const error = await response.text();
        console.log(`❌ Application submission failed: ${response.status} - ${error}`);
        return null;
      }
    } catch (error) {
      console.log("❌ Application submission error:", error);
      return null;
    }
  },

  async runFullTest() {
    console.log("🚀 Running full customer application test...\n");
    
    try {
      // Check current page
      await this.checkCurrentPage();
      
      // Test APIs (assuming user is logged in)
      const bakers = await this.testMainBakersAPI();
      if (!bakers || bakers.length === 0) {
        console.log("❌ Cannot proceed without main bakers");
        return;
      }

      // Check initial application status
      const initialStatus = await this.testApplicationStatusAPI();
      
      if (initialStatus?.hasActiveApplication) {
        console.log("⚠️ User already has an active application. Test will check status only.");
        return;
      }

      // Submit new application
      const submitResult = await this.testSubmitApplication(bakers[0].id);
      
      if (submitResult) {
        // Check status after submission
        await wait(1000);
        const finalStatus = await this.testApplicationStatusAPI();
        
        if (finalStatus?.hasActiveApplication) {
          console.log("🎉 SUCCESS: Complete application flow working!");
          console.log("✅ Application created and status updated correctly");
        } else {
          console.log("⚠️ WARNING: Application submitted but status not updated");
        }
      }

    } catch (error) {
      console.log("❌ Full test failed:", error);
    }
  }
};

// Instructions for manual testing
console.log("📋 Instructions:");
console.log("1. Make sure you're logged in as a customer");
console.log("2. Run: tests.runFullTest()");
console.log("3. Or run individual tests:");
console.log("   - tests.checkCurrentPage()");
console.log("   - tests.testMainBakersAPI()");
console.log("   - tests.testApplicationStatusAPI()");
console.log("   - tests.testSubmitApplication(bakerId)");
console.log("\n🔧 Available test functions:");
console.log(Object.keys(tests).join(", "));

// Make tests available globally
window.customerAppTests = tests;

console.log("\n✅ Test script loaded. Use 'customerAppTests.runFullTest()' to start testing.");
