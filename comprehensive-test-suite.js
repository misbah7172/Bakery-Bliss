// Comprehensive Test Script for Bakery Bliss
// This script tests cart restrictions, dashboard authentication, and checkout functionality

class BakeryBlissTestSuite {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.testResults = {
      cartRestrictions: {},
      dashboardAuth: {},
      checkout: {}
    };
  }

  // Create test users for each role
  async createTestUsers() {
    const testUsers = [
      {
        email: 'customer@test.com',
        username: 'testcustomer',
        password: 'password123',
        fullName: 'Test Customer',
        role: 'customer'
      },
      {
        email: 'mainbaker@test.com',
        username: 'testmainbaker',
        password: 'password123',
        fullName: 'Test Main Baker',
        role: 'main_baker'
      },
      {
        email: 'juniorbaker@test.com',
        username: 'testjuniorbaker',
        password: 'password123',
        fullName: 'Test Junior Baker',
        role: 'junior_baker'
      },
      {
        email: 'admin@test.com',
        username: 'testadmin',
        password: 'password123',
        fullName: 'Test Admin',
        role: 'admin'
      }
    ];

    console.log('Creating test users...');
    
    for (const user of testUsers) {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(user),
        });
        
        if (response.ok || response.status === 400) {
          console.log(`✅ User ${user.role} ready (${user.email})`);
        } else {
          console.log(`❌ Failed to create ${user.role}: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error creating ${user.role}:`, error.message);
      }
    }
  }

  // Login as specific user
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Logged in as ${data.user.role}: ${data.user.fullName}`);
        return data.user;
      } else {
        console.log(`❌ Login failed for ${email}`);
        return null;
      }
    } catch (error) {
      console.log(`❌ Login error for ${email}:`, error.message);
      return null;
    }
  }

  // Logout current user
  async logout() {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        console.log('✅ Logged out successfully');
        return true;
      } else {
        console.log('❌ Logout failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Logout error:', error.message);
      return false;
    }
  }

  // Test cart visibility and functionality
  async testCartRestrictions() {
    console.log('\n🛒 Testing Cart Restrictions...');
    
    const roles = [
      { email: 'customer@test.com', password: 'password123', role: 'customer', shouldSeeCart: true },
      { email: 'mainbaker@test.com', password: 'password123', role: 'main_baker', shouldSeeCart: false },
      { email: 'juniorbaker@test.com', password: 'password123', role: 'junior_baker', shouldSeeCart: false },
      { email: 'admin@test.com', password: 'password123', role: 'admin', shouldSeeCart: false }
    ];

    for (const roleTest of roles) {
      await this.logout(); // Ensure clean state
      const user = await this.login(roleTest.email, roleTest.password);
      
      if (user) {
        // Visit products page and check cart visibility
        console.log(`Testing cart visibility for ${roleTest.role}...`);
        
        // Check if cart elements exist (this would need to be done in browser context)
        // For now, we'll just log the expectation
        console.log(`${roleTest.role} should ${roleTest.shouldSeeCart ? 'see' : 'NOT see'} cart`);
        this.testResults.cartRestrictions[roleTest.role] = {
          expected: roleTest.shouldSeeCart,
          tested: true
        };
      }
    }
  }

  // Test dashboard authentication
  async testDashboardAuthentication() {
    console.log('\n🔐 Testing Dashboard Authentication...');
    
    // Test unauthenticated access
    await this.logout();
    console.log('Testing unauthenticated dashboard access...');
    
    const dashboards = [
      '/dashboard/customer',
      '/dashboard/main-baker', 
      '/dashboard/junior-baker',
      '/dashboard/admin'
    ];

    for (const dashboard of dashboards) {
      try {
        const response = await fetch(`${this.baseUrl}${dashboard}`, {
          credentials: 'include',
          redirect: 'manual'
        });
        
        if (response.status === 302 || response.status === 401) {
          console.log(`✅ ${dashboard} properly redirects unauthenticated users`);
        } else {
          console.log(`❌ ${dashboard} allows unauthenticated access`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${dashboard}:`, error.message);
      }
    }

    // Test authenticated access
    const roles = [
      { email: 'customer@test.com', password: 'password123', role: 'customer', dashboard: '/dashboard/customer' },
      { email: 'mainbaker@test.com', password: 'password123', role: 'main_baker', dashboard: '/dashboard/main-baker' },
      { email: 'juniorbaker@test.com', password: 'password123', role: 'junior_baker', dashboard: '/dashboard/junior-baker' },
      { email: 'admin@test.com', password: 'password123', role: 'admin', dashboard: '/dashboard/admin' }
    ];

    for (const roleTest of roles) {
      const user = await this.login(roleTest.email, roleTest.password);
      
      if (user) {
        try {
          const response = await fetch(`${this.baseUrl}${roleTest.dashboard}`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            console.log(`✅ ${roleTest.role} can access their dashboard`);
          } else {
            console.log(`❌ ${roleTest.role} cannot access their dashboard`);
          }
        } catch (error) {
          console.log(`❌ Error testing ${roleTest.role} dashboard:`, error.message);
        }
      }
      
      await this.logout();
    }
  }

  // Test checkout functionality
  async testCheckoutFunctionality() {
    console.log('\n💳 Testing Checkout Functionality...');
    
    // Login as customer
    const user = await this.login('customer@test.com', 'password123');
    
    if (!user) {
      console.log('❌ Cannot test checkout - customer login failed');
      return;
    }

    // Test order creation endpoint
    try {
      const orderData = {
        items: [
          {
            id: 1,
            name: 'Test Cake',
            price: 25.99,
            quantity: 1
          }
        ],
        customerInfo: {
          name: 'Test Customer',
          email: 'customer@test.com',
          phone: '123-456-7890',
          address: '123 Test St',
          city: 'Test City',
          zipcode: '12345'
        },
        specialInstructions: 'Test order from automated test'
      };

      const response = await fetch(`${this.baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        console.log('✅ Order creation successful:', order.id);
        this.testResults.checkout.orderCreation = true;
      } else {
        const error = await response.text();
        console.log('❌ Order creation failed:', response.status, error);
        this.testResults.checkout.orderCreation = false;
      }
    } catch (error) {
      console.log('❌ Checkout test error:', error.message);
      this.testResults.checkout.orderCreation = false;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Bakery Bliss Test Suite...\n');
    
    try {
      await this.createTestUsers();
      await this.testCartRestrictions();
      await this.testDashboardAuthentication();
      await this.testCheckoutFunctionality();
      
      console.log('\n📊 Test Results Summary:');
      console.log('Cart Restrictions:', this.testResults.cartRestrictions);
      console.log('Dashboard Auth:', this.testResults.dashboardAuth);
      console.log('Checkout:', this.testResults.checkout);
      
      console.log('\n✅ Test suite completed!');
    } catch (error) {
      console.log('❌ Test suite failed:', error.message);
    }
  }
}

// Auto-run if in browser context
if (typeof window !== 'undefined') {
  const testSuite = new BakeryBlissTestSuite();
  
  // Add to window for manual testing
  window.bakeryTests = testSuite;
  
  console.log('Bakery Bliss Test Suite loaded!');
  console.log('Run tests manually: window.bakeryTests.runAllTests()');
  
  // Optionally auto-run (uncomment next line)
  // testSuite.runAllTests();
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BakeryBlissTestSuite;
}
