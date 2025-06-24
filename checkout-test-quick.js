// Quick test script to verify the "Place Order" button fix
async function testCheckoutFlow() {
  console.log('🧪 Testing Checkout Flow...');
  
  // Step 1: Login as customer
  console.log('Step 1: Logging in as customer...');
  const loginResponse = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      email: 'customer@bakerybliss.com',
      password: 'customer123'
    }),
  });
  
  if (loginResponse.ok) {
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.user.email);
  } else {
    console.log('❌ Login failed');
    return;
  }
  
  // Step 2: Test order creation
  console.log('Step 2: Testing order creation...');
  const orderData = {
    items: [
      {
        productId: 8,
        customCakeId: null,
        quantity: 1,
        pricePerItem: 12
      }
    ],
    totalAmount: 12,
    status: 'pending',
    shippingInfo: {
      fullName: 'Test Customer',
      email: 'customer@bakerybliss.com',
      phone: '123-456-7890',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      paymentMethod: 'cash'
    }
  };

  const orderResponse = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(orderData),
  });

  if (orderResponse.ok) {
    const order = await orderResponse.json();
    console.log('✅ Order creation successful!');
    console.log('Order ID:', order.id);
    console.log('Order Status:', order.status);
    console.log('🎉 Place Order button should now work!');
  } else {
    const error = await orderResponse.text();
    console.log('❌ Order creation failed:', orderResponse.status, error);
  }
}

// Add button to run test
const testButton = document.createElement('button');
testButton.textContent = '🧪 Test Checkout Flow';
testButton.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 9999;
  padding: 10px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
`;
testButton.onclick = testCheckoutFlow;
document.body.appendChild(testButton);

console.log('🔧 Checkout test script loaded! Click the green button to test.');
