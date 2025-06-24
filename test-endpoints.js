// Simple test to check API endpoints and user session
const baseUrl = 'http://localhost:5000';

async function checkEndpoints() {
  console.log('🔍 Checking API endpoints...\n');
  
  try {
    // Check if we have an active session
    console.log('1. Checking current user session...');
    const userResponse = await fetch(`${baseUrl}/api/user`, {
      credentials: 'include'
    });
    
    if (userResponse.ok) {
      const user = await userResponse.json();
      console.log('✅ Current user:', user);
    } else {
      console.log('ℹ️  No active session');
    }
    
    // Try to get main bakers without authentication
    console.log('\n2. Testing main bakers endpoint...');
    const bakersResponse = await fetch(`${baseUrl}/api/main-bakers`, {
      credentials: 'include'
    });
    
    if (bakersResponse.ok) {
      const bakers = await bakersResponse.json();
      console.log('✅ Main bakers:', bakers.length, 'found');
    } else {
      console.log('❌ Main bakers endpoint failed:', bakersResponse.status);
    }
    
    // Test customer application status endpoint
    console.log('\n3. Testing application status endpoint...');
    const statusResponse = await fetch(`${baseUrl}/api/customer/application-status`, {
      credentials: 'include'
    });
    
    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log('✅ Application status:', status);
    } else {
      console.log('❌ Application status endpoint failed:', statusResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkEndpoints();
