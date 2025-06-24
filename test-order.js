const fetch = require('node-fetch');

async function testOrderCreation() {
  const sessionCookie = 'connect.sid=s%3AiUXMwVf5Fwj3hZQcdFUnZyuVy3XUqj4A.pYhJJN9mHxEiGF1W5DQCBvEQ8zJpLZEE0CtOOPhiCCY'; // Example, this won't work without real session
  
  console.log('Testing order creation...');
  
  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify({
        items: [
          {
            productId: 8,
            customCakeId: null,
            quantity: 1,
            pricePerItem: 12
          }
        ],
        totalAmount: 12,
        status: "pending",
        shippingInfo: {
          fullName: "Test Customer",
          email: "test@example.com",
          phone: "1234567890",
          address: "Test Address",
          city: "Test City",
          state: "Test State",
          zipCode: "12345",
          paymentMethod: "cash"
        }
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Order created successfully:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testOrderCreation();
