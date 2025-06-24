// Test script for customer application to become junior baker
const baseUrl = 'http://localhost:5000';

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies for session
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// Test functions
async function testCustomerApplicationFlow() {
  console.log('🧪 Testing Customer Application Flow...\n');
  
  try {
    // Step 1: Login as a customer
    console.log('1. Logging in as a customer...');
    const loginResponse = await makeRequest(`${baseUrl}/api/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'password123'
      })
    });
    console.log('✅ Login successful:', loginResponse.user?.name);
    
    // Step 2: Check if customer already has an application
    console.log('\n2. Checking existing application status...');
    try {
      const statusResponse = await makeRequest(`${baseUrl}/api/customer/application-status`);
      console.log('✅ Application status:', statusResponse);
      
      if (statusResponse.hasActiveApplication) {
        console.log('⚠️  Customer already has an active application. Skipping application submission.');
        return;
      }
    } catch (error) {
      console.log('ℹ️  No existing application found (expected for new customer)');
    }
    
    // Step 3: Get list of main bakers
    console.log('\n3. Fetching main bakers...');
    const bakersResponse = await makeRequest(`${baseUrl}/api/main-bakers`);
    console.log('✅ Main bakers found:', bakersResponse.length);
    
    if (bakersResponse.length === 0) {
      console.log('❌ No main bakers available. Cannot proceed with application.');
      return;
    }
    
    // Step 4: Submit application
    console.log('\n4. Submitting baker application...');
    const applicationData = {
      mainBakerId: bakersResponse[0].id, // Use first main baker
      reason: 'I am passionate about baking and would love to learn from experienced bakers. I have experience with home baking and want to take my skills to the next level.'
    };
    
    const applicationResponse = await makeRequest(`${baseUrl}/api/baker-applications`, {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
    console.log('✅ Application submitted successfully:', applicationResponse);
    
    // Step 5: Verify application was created
    console.log('\n5. Verifying application status after submission...');
    const newStatusResponse = await makeRequest(`${baseUrl}/api/customer/application-status`);
    console.log('✅ Updated application status:', newStatusResponse);
    
    if (newStatusResponse.hasActiveApplication) {
      console.log('🎉 SUCCESS: Customer application flow completed successfully!');
    } else {
      console.log('❌ FAIL: Application was submitted but status not updated correctly');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Run the test
testCustomerApplicationFlow();
