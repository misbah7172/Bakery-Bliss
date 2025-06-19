// Test login credentials
const testCredentials = [
  { email: 'mainbaker@bakery.com', password: 'baker123' },
  { email: 'mainbaker2@bakery.com', password: 'baker123' },
  { email: 'misbah@gmail.com', password: 'baker123' },
  { email: 'baker@bakerybliss.com', password: 'baker123' },
  { email: 'misbah@gmail.com', password: 'password123' },
  { email: 'baker@bakerybliss.com', password: 'password123' }
];

async function testLogin(email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ SUCCESS: ${email} / ${password} -> ${result.user.role}`);
      return true;
    } else {
      console.log(`❌ FAILED: ${email} / ${password} -> ${result.message}`);
      return false;
    }
  } catch (error) {
    console.log(`💥 ERROR: ${email} / ${password} -> ${error.message}`);
    return false;
  }
}

async function testAllCredentials() {
  console.log('🧪 Testing all main baker credentials...\n');
  
  for (const cred of testCredentials) {
    await testLogin(cred.email, cred.password);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
  
  console.log('\n✅ Test completed!');
}

testAllCredentials();
