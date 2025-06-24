// Backend API test using curl-like requests
// This tests the API endpoints without the frontend

import fetch from 'node-fetch';

const baseUrl = 'http://localhost:5000';

// Cookie jar to maintain session
let cookies = '';

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies,
      ...options.headers
    }
  });
  
  // Store cookies for session management
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    cookies = setCookie;
  }
  
  return response;
}

async function testBackendAPI() {
  console.log('🔧 Testing Backend API Endpoints...\n');
  
  try {
    // Test 1: Login
    console.log('1. Testing login...');
    const loginResponse = await makeRequest(`${baseUrl}/api/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'customer@bakery.com',
        password: 'password123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData.user?.fullName);
    } else {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }
    
    // Test 2: Get main bakers
    console.log('\n2. Testing main bakers endpoint...');
    const bakersResponse = await makeRequest(`${baseUrl}/api/main-bakers`);
    
    if (bakersResponse.ok) {
      const bakers = await bakersResponse.json();
      console.log(`✅ Main bakers loaded: ${bakers.length} found`);
      console.log('Main bakers:', bakers.map(b => b.fullName).join(', '));
    } else {
      console.log('❌ Main bakers failed:', bakersResponse.status);
    }
    
    // Test 3: Check application status (should be none initially)
    console.log('\n3. Testing application status...');
    const statusResponse = await makeRequest(`${baseUrl}/api/customer/application-status`);
    
    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log('✅ Application status:', status);
    } else {
      console.log('❌ Application status failed:', statusResponse.status);
    }
    
    // Test 4: Submit application
    console.log('\n4. Testing application submission...');
    const applicationData = {
      mainBakerId: 1, // Use first main baker ID
      currentRole: 'customer',
      requestedRole: 'junior_baker',
      reason: 'I am passionate about baking and would love to learn from experienced bakers. I have been practicing at home for several years and feel ready to take my skills to the next level. I am eager to contribute to the team and develop my professional baking skills.'
    };
    
    const submitResponse = await makeRequest(`${baseUrl}/api/baker-applications`, {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
    
    if (submitResponse.ok) {
      const submitData = await submitResponse.json();
      console.log('✅ Application submitted:', submitData);
    } else {
      const error = await submitResponse.text();
      console.log('❌ Application submission failed:', submitResponse.status, error);
    }
    
    // Test 5: Check application status again (should show active application)
    console.log('\n5. Testing application status after submission...');
    const newStatusResponse = await makeRequest(`${baseUrl}/api/customer/application-status`);
    
    if (newStatusResponse.ok) {
      const newStatus = await newStatusResponse.json();
      console.log('✅ Updated application status:', newStatus);
      
      if (newStatus.hasActiveApplication) {
        console.log('🎉 SUCCESS: Complete flow working correctly!');
      } else {
        console.log('⚠️  WARNING: Application submitted but status not updated');
      }
    } else {
      console.log('❌ Updated status check failed:', newStatusResponse.status);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testBackendAPI();
