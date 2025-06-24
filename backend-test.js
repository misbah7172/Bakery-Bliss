// Simple Node.js test script for backend endpoints
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000';

async function testBackend() {
  console.log('🚀 Testing Backend Endpoints...\n');
  
  // Test 1: Create test users
  console.log('1. Creating test users...');
  
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
    }
  ];

  for (const user of testUsers) {
    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      
      if (response.ok || response.status === 400) {
        console.log(`✅ User ${user.role} ready`);
      } else {
        console.log(`❌ Failed to create ${user.role}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error creating ${user.role}:`, error.message);
    }
  }

  // Test 2: Login test
  console.log('\n2. Testing login...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'customer@test.com',
        password: 'password123'
      }),
    });
    
    if (response.ok) {
      console.log('✅ Login endpoint working');
    } else {
      console.log('❌ Login endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Login test error:', error.message);
  }

  // Test 3: Order creation
  console.log('\n3. Testing order creation...');
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
      specialInstructions: 'Test order'
    };

    const response = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const order = await response.json();
      console.log('✅ Order creation successful:', order.id);
    } else {
      const error = await response.text();
      console.log('❌ Order creation failed:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Order creation error:', error.message);
  }

  console.log('\n✅ Backend tests completed!');
}

testBackend().catch(console.error);
