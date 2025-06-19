// Test the trimming fix by simulating a login with whitespace
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'mainbaker@bakery.com',
    password: 'baker123\t'  // Adding a tab character like we saw in the logs
  })
})
.then(response => response.json())
.then(data => {
  console.log('Response:', data);
  if (data.user) {
    console.log('✅ LOGIN SUCCESS! The trimming fix worked!');
    console.log('User:', data.user);
  } else {
    console.log('❌ Login still failed:', data.message);
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});
