import bcrypt from 'bcryptjs';

async function testPassword() {
  const storedHash = '$2b$10$V.XmwHWG7VFp.uTjteyXfOC6eVCmUob45fyb0OSvzCkdiPD0iur7i';
  
  // Test various possible passwords
  const possiblePasswords = [
    'baker123',
    'password123', 
    'admin123',
    'junior123',
    'customer123',
    'mainbaker',
    'password',
    '123456',
    'bakery123'
  ];
  
  console.log('🔐 Testing passwords against stored hash...\n');
  
  for (const password of possiblePasswords) {
    const isMatch = await bcrypt.compare(password, storedHash);
    console.log(`${isMatch ? '✅' : '❌'} "${password}" -> ${isMatch ? 'MATCH!' : 'No match'}`);
  }
  
  console.log('\n🔧 Generating new hash for "baker123":');
  const newHash = await bcrypt.hash('baker123', 10);
  console.log('New hash:', newHash);
  
  // Verify the new hash works
  const verification = await bcrypt.compare('baker123', newHash);
  console.log('Verification of new hash:', verification ? '✅ SUCCESS' : '❌ FAILED');
}

testPassword();
