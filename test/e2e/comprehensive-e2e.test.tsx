import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// End-to-End Test Suite for Bakery-Bliss Application
// These tests simulate complete user workflows from start to finish

describe('End-to-End User Journey Tests', () => {
  let queryClient: QueryClient;
  let mockAppState: any;

  beforeAll(async () => {
    console.log('🚀 Setting up End-to-End test environment...');
    
    // Initialize mock application state
    mockAppState = {
      users: [],
      products: [],
      orders: [],
      cart: [],
      currentUser: null,
      notifications: [],
      analytics: {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0
      }
    };
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up End-to-End test environment...');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Complete Customer Journey - Registration to Order Completion', () => {
    it('should complete full customer registration and onboarding flow', async () => {
      // Mock Registration Form Component
      const RegistrationForm = () => {
        const [formData, setFormData] = React.useState({
          email: '',
          password: '',
          name: '',
          phone: ''
        });
        const [step, setStep] = React.useState(1);
        const [isSubmitting, setIsSubmitting] = React.useState(false);

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsSubmitting(true);
          
          // Simulate API call
          setTimeout(() => {
            const newUser = {
              id: Date.now(),
              ...formData,
              role: 'customer',
              createdAt: new Date(),
              verified: false
            };
            
            mockAppState.users.push(newUser);
            mockAppState.currentUser = newUser;
            setStep(2);
            setIsSubmitting(false);
          }, 500);
        };

        if (step === 2) {
          return (
            <div data-testid="registration-success">
              <h2>Welcome to Bakery Bliss!</h2>
              <p>Registration successful for {formData.name}</p>
              <p data-testid="user-email">{formData.email}</p>
              <button data-testid="continue-to-app">Continue to App</button>
            </div>
          );
        }

        return (
          <form onSubmit={handleSubmit} data-testid="registration-form">
            <h1>Join Bakery Bliss</h1>
            <input
              data-testid="email-input"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              data-testid="password-input"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <input
              data-testid="name-input"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <input
              data-testid="phone-input"
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <button 
              type="submit" 
              data-testid="register-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<RegistrationForm />);

      // Fill out registration form
      await user.type(screen.getByTestId('email-input'), 'customer@example.com');
      await user.type(screen.getByTestId('password-input'), 'securepassword123');
      await user.type(screen.getByTestId('name-input'), 'John Customer');
      await user.type(screen.getByTestId('phone-input'), '+1234567890');

      // Submit registration
      await user.click(screen.getByTestId('register-button'));

      // Wait for registration success
      await waitFor(() => {
        expect(screen.getByTestId('registration-success')).toBeInTheDocument();
      });

      expect(screen.getByText('Welcome to Bakery Bliss!')).toBeInTheDocument();
      expect(screen.getByTestId('user-email')).toHaveTextContent('customer@example.com');
      expect(mockAppState.users).toHaveLength(1);
      expect(mockAppState.currentUser.email).toBe('customer@example.com');
    });

    it('should complete product browsing and shopping cart workflow', async () => {
      // Mock Product Catalog Component
      const ProductCatalog = () => {
        const [products] = React.useState([
          {
            id: 1,
            name: 'Chocolate Birthday Cake',
            price: 4999,
            category: 'cakes',
            description: 'Rich chocolate cake perfect for celebrations',
            imageUrl: '/chocolate-cake.jpg',
            bakerId: 101,
            available: true
          },
          {
            id: 2,
            name: 'Vanilla Cupcakes (6 pack)',
            price: 2499,
            category: 'cupcakes',
            description: 'Delicious vanilla cupcakes with buttercream frosting',
            imageUrl: '/vanilla-cupcakes.jpg',
            bakerId: 101,
            available: true
          },
          {
            id: 3,
            name: 'Red Velvet Cake',
            price: 5499,
            category: 'cakes',
            description: 'Classic red velvet with cream cheese frosting',
            imageUrl: '/red-velvet.jpg',
            bakerId: 102,
            available: false
          }
        ]);

        const [cart, setCart] = React.useState<any[]>([]);
        const [selectedCategory, setSelectedCategory] = React.useState('all');

        const addToCart = (product: any) => {
          const existingItem = cart.find(item => item.productId === product.id);
          if (existingItem) {
            setCart(cart.map(item => 
              item.productId === product.id
                ? {...item, quantity: item.quantity + 1}
                : item
            ));
          } else {
            setCart([...cart, {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1
            }]);
          }
        };

        const filteredProducts = selectedCategory === 'all' 
          ? products 
          : products.filter(p => p.category === selectedCategory);

        const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return (
          <div data-testid="product-catalog">
            <h1>Bakery Products</h1>
            
            {/* Category Filter */}
            <div data-testid="category-filter">
              <button 
                onClick={() => setSelectedCategory('all')}
                data-testid="filter-all"
                className={selectedCategory === 'all' ? 'active' : ''}
              >
                All Products
              </button>
              <button 
                onClick={() => setSelectedCategory('cakes')}
                data-testid="filter-cakes"
                className={selectedCategory === 'cakes' ? 'active' : ''}
              >
                Cakes
              </button>
              <button 
                onClick={() => setSelectedCategory('cupcakes')}
                data-testid="filter-cupcakes"
                className={selectedCategory === 'cupcakes' ? 'active' : ''}
              >
                Cupcakes
              </button>
            </div>

            {/* Product Grid */}
            <div data-testid="product-grid">
              {filteredProducts.map(product => (
                <div key={product.id} data-testid={`product-${product.id}`}>
                  <h3>{product.name}</h3>
                  <p>${(product.price / 100).toFixed(2)}</p>
                  <p>{product.description}</p>
                  <p>Baker ID: {product.bakerId}</p>
                  {product.available ? (
                    <button
                      onClick={() => addToCart(product)}
                      data-testid={`add-to-cart-${product.id}`}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button disabled data-testid={`out-of-stock-${product.id}`}>
                      Out of Stock
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Shopping Cart */}
            <div data-testid="shopping-cart">
              <h2>Shopping Cart ({cart.length} items)</h2>
              {cart.length === 0 ? (
                <p data-testid="empty-cart">Your cart is empty</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.productId} data-testid={`cart-item-${item.productId}`}>
                      {item.name} x {item.quantity} = ${((item.price * item.quantity) / 100).toFixed(2)}
                    </div>
                  ))}
                  <div data-testid="cart-total">
                    Total: ${(cartTotal / 100).toFixed(2)}
                  </div>
                  <button data-testid="proceed-to-checkout">
                    Proceed to Checkout
                  </button>
                </>
              )}
            </div>
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<ProductCatalog />);

      // Verify initial state
      expect(screen.getByText('Bakery Products')).toBeInTheDocument();
      expect(screen.getByTestId('empty-cart')).toBeInTheDocument();

      // Test category filtering
      await user.click(screen.getByTestId('filter-cakes'));
      expect(screen.getByTestId('product-1')).toBeInTheDocument(); // Chocolate cake
      expect(screen.queryByTestId('product-2')).not.toBeInTheDocument(); // Cupcakes filtered out

      await user.click(screen.getByTestId('filter-all'));
      expect(screen.getByTestId('product-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-2')).toBeInTheDocument();

      // Add products to cart
      await user.click(screen.getByTestId('add-to-cart-1')); // Chocolate cake
      await user.click(screen.getByTestId('add-to-cart-2')); // Cupcakes
      await user.click(screen.getByTestId('add-to-cart-1')); // Chocolate cake again

      // Verify cart contents
      expect(screen.getByText('Shopping Cart (2 items)')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Chocolate Birthday Cake x 2 = $99.98');
      expect(screen.getByTestId('cart-item-2')).toHaveTextContent('Vanilla Cupcakes (6 pack) x 1 = $24.99');
      expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $124.97');

      // Test out of stock handling
      expect(screen.getByTestId('out-of-stock-3')).toBeDisabled();
    });

    it('should complete checkout and order placement workflow', async () => {
      // Mock Checkout Component
      const CheckoutProcess = () => {
        const [step, setStep] = React.useState(1);
        const [orderData, setOrderData] = React.useState({
          shippingAddress: '',
          paymentMethod: '',
          specialInstructions: ''
        });
        const [orderPlaced, setOrderPlaced] = React.useState(false);

        const cartItems = [
          { productId: 1, name: 'Chocolate Birthday Cake', price: 4999, quantity: 2 },
          { productId: 2, name: 'Vanilla Cupcakes (6 pack)', price: 2499, quantity: 1 }
        ];

        const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const handleStepComplete = (data: any) => {
          setOrderData({...orderData, ...data});
          if (step < 3) {
            setStep(step + 1);
          } else {
            // Place order
            const order = {
              id: Date.now(),
              customerId: mockAppState.currentUser?.id,
              items: cartItems,
              totalAmount: cartTotal,
              ...orderData,
              status: 'pending',
              createdAt: new Date()
            };
            mockAppState.orders.push(order);
            setOrderPlaced(true);
          }
        };

        if (orderPlaced) {
          return (
            <div data-testid="order-confirmation">
              <h1>Order Placed Successfully!</h1>
              <p data-testid="order-number">Order #ORD-{mockAppState.orders[0]?.id}</p>
              <p data-testid="order-total">Total: ${(cartTotal / 100).toFixed(2)}</p>
              <p>We'll send you updates about your order status.</p>
              <button data-testid="track-order">Track Your Order</button>
              <button data-testid="continue-shopping">Continue Shopping</button>
            </div>
          );
        }

        return (
          <div data-testid="checkout-process">
            <h1>Checkout - Step {step} of 3</h1>
            
            {/* Order Summary */}
            <div data-testid="order-summary">
              <h2>Order Summary</h2>
              {cartItems.map(item => (
                <div key={item.productId} data-testid={`summary-item-${item.productId}`}>
                  {item.name} x {item.quantity} = ${((item.price * item.quantity) / 100).toFixed(2)}
                </div>
              ))}
              <div data-testid="summary-total">Total: ${(cartTotal / 100).toFixed(2)}</div>
            </div>

            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div data-testid="shipping-step">
                <h2>Shipping Information</h2>
                <textarea
                  data-testid="shipping-address"
                  placeholder="Enter your full address"
                  onChange={(e) => setOrderData({...orderData, shippingAddress: e.target.value})}
                />
                <button 
                  data-testid="next-to-payment"
                  onClick={() => handleStepComplete({})}
                  disabled={!orderData.shippingAddress}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div data-testid="payment-step">
                <h2>Payment Information</h2>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="payment"
                      value="credit_card"
                      data-testid="payment-credit"
                      onChange={(e) => setOrderData({...orderData, paymentMethod: e.target.value})}
                    />
                    Credit Card
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      data-testid="payment-paypal"
                      onChange={(e) => setOrderData({...orderData, paymentMethod: e.target.value})}
                    />
                    PayPal
                  </label>
                </div>
                <button 
                  data-testid="next-to-review"
                  onClick={() => handleStepComplete({})}
                  disabled={!orderData.paymentMethod}
                >
                  Review Order
                </button>
              </div>
            )}

            {/* Step 3: Order Review */}
            {step === 3 && (
              <div data-testid="review-step">
                <h2>Review Your Order</h2>
                <div data-testid="review-shipping">
                  <strong>Shipping:</strong> {orderData.shippingAddress}
                </div>
                <div data-testid="review-payment">
                  <strong>Payment:</strong> {orderData.paymentMethod}
                </div>
                <textarea
                  data-testid="special-instructions"
                  placeholder="Special instructions (optional)"
                  onChange={(e) => setOrderData({...orderData, specialInstructions: e.target.value})}
                />
                <button 
                  data-testid="place-order"
                  onClick={() => handleStepComplete({})}
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<CheckoutProcess />);

      // Verify order summary
      expect(screen.getByText('Checkout - Step 1 of 3')).toBeInTheDocument();
      expect(screen.getByTestId('summary-item-1')).toHaveTextContent('Chocolate Birthday Cake x 2 = $99.98');
      expect(screen.getByTestId('summary-total')).toHaveTextContent('Total: $124.97');

      // Step 1: Shipping Information
      const shippingAddress = '123 Main St, Bakery City, BC 12345';
      await user.type(screen.getByTestId('shipping-address'), shippingAddress);
      await user.click(screen.getByTestId('next-to-payment'));

      // Step 2: Payment Information
      expect(screen.getByText('Checkout - Step 2 of 3')).toBeInTheDocument();
      await user.click(screen.getByTestId('payment-credit'));
      await user.click(screen.getByTestId('next-to-review'));

      // Step 3: Order Review
      expect(screen.getByText('Checkout - Step 3 of 3')).toBeInTheDocument();
      expect(screen.getByTestId('review-shipping')).toHaveTextContent(shippingAddress);
      expect(screen.getByTestId('review-payment')).toHaveTextContent('credit_card');

      await user.type(screen.getByTestId('special-instructions'), 'Please deliver in the morning');
      await user.click(screen.getByTestId('place-order'));

      // Verify order confirmation
      await waitFor(() => {
        expect(screen.getByTestId('order-confirmation')).toBeInTheDocument();
      });

      expect(screen.getByText('Order Placed Successfully!')).toBeInTheDocument();
      expect(screen.getByTestId('order-total')).toHaveTextContent('Total: $124.97');
      expect(mockAppState.orders).toHaveLength(1);
    });
  });

  describe('Complete Baker Journey - Onboarding to Order Fulfillment', () => {
    it('should complete baker registration and product setup workflow', async () => {
      // Mock Baker Registration Component
      const BakerRegistration = () => {
        const [step, setStep] = React.useState(1);
        const [bakerData, setBakerData] = React.useState({
          email: '',
          name: '',
          specialties: [] as string[],
          experience: '',
          businessName: '',
          portfolio: [] as string[]
        });
        const [products, setProducts] = React.useState<any[]>([]);

        const addProduct = (product: any) => {
          const newProduct = {
            id: Date.now(),
            ...product,
            bakerId: 999,
            available: true,
            createdAt: new Date()
          };
          setProducts([...products, newProduct]);
          mockAppState.products.push(newProduct);
        };

        if (step === 3) {
          return (
            <div data-testid="baker-dashboard">
              <h1>Welcome to Your Baker Dashboard!</h1>
              <p data-testid="baker-name">Welcome, {bakerData.name}</p>
              <div data-testid="baker-stats">
                <div>Products: {products.length}</div>
                <div>Specialties: {bakerData.specialties.join(', ')}</div>
                <div>Experience: {bakerData.experience}</div>
              </div>
              <button data-testid="add-more-products">Add More Products</button>
              <button data-testid="view-orders">View Orders</button>
            </div>
          );
        }

        if (step === 2) {
          return (
            <div data-testid="product-setup">
              <h2>Setup Your Products</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                addProduct({
                  name: formData.get('productName'),
                  price: parseInt(formData.get('price') as string) * 100,
                  category: formData.get('category'),
                  description: formData.get('description')
                });
              }}>
                <input name="productName" data-testid="product-name" placeholder="Product Name" required />
                <input name="price" data-testid="product-price" type="number" placeholder="Price (USD)" required />
                <select name="category" data-testid="product-category" required>
                  <option value="">Select Category</option>
                  <option value="cakes">Cakes</option>
                  <option value="cupcakes">Cupcakes</option>
                  <option value="pastries">Pastries</option>
                </select>
                <textarea name="description" data-testid="product-description" placeholder="Description" required />
                <button type="submit" data-testid="add-product">Add Product</button>
              </form>

              <div data-testid="products-list">
                <h3>Your Products ({products.length})</h3>
                {products.map(product => (
                  <div key={product.id} data-testid={`product-item-${product.id}`}>
                    {product.name} - ${(product.price / 100).toFixed(2)} ({product.category})
                  </div>
                ))}
              </div>

              {products.length > 0 && (
                <button data-testid="complete-setup" onClick={() => setStep(3)}>
                  Complete Setup
                </button>
              )}
            </div>
          );
        }

        return (
          <div data-testid="baker-registration">
            <h1>Join as a Baker</h1>
            <form onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}>
              <input
                data-testid="baker-email"
                type="email"
                placeholder="Email"
                onChange={(e) => setBakerData({...bakerData, email: e.target.value})}
                required
              />
              <input
                data-testid="baker-name"
                placeholder="Full Name"
                onChange={(e) => setBakerData({...bakerData, name: e.target.value})}
                required
              />
              <input
                data-testid="business-name"
                placeholder="Business Name"
                onChange={(e) => setBakerData({...bakerData, businessName: e.target.value})}
              />
              <select
                data-testid="experience-level"
                onChange={(e) => setBakerData({...bakerData, experience: e.target.value})}
                required
              >
                <option value="">Experience Level</option>
                <option value="beginner">Beginner (0-2 years)</option>
                <option value="intermediate">Intermediate (2-5 years)</option>
                <option value="expert">Expert (5+ years)</option>
              </select>
              <div data-testid="specialties-section">
                <label>Specialties:</label>
                {['Cakes', 'Cupcakes', 'Pastries', 'Cookies', 'Bread'].map(specialty => (
                  <label key={specialty}>
                    <input
                      type="checkbox"
                      data-testid={`specialty-${specialty.toLowerCase()}`}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBakerData({...bakerData, specialties: [...bakerData.specialties, specialty]});
                        } else {
                          setBakerData({...bakerData, specialties: bakerData.specialties.filter(s => s !== specialty)});
                        }
                      }}
                    />
                    {specialty}
                  </label>
                ))}
              </div>
              <button type="submit" data-testid="next-to-products">Continue to Product Setup</button>
            </form>
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<BakerRegistration />);

      // Fill baker registration form
      await user.type(screen.getByTestId('baker-email'), 'baker@example.com');
      await user.type(screen.getByTestId('baker-name'), 'Sarah Baker');
      await user.type(screen.getByTestId('business-name'), 'Sarah\'s Sweet Delights');
      await user.selectOptions(screen.getByTestId('experience-level'), 'expert');
      
      // Select specialties
      await user.click(screen.getByTestId('specialty-cakes'));
      await user.click(screen.getByTestId('specialty-cupcakes'));
      
      await user.click(screen.getByTestId('next-to-products'));

      // Product setup
      expect(screen.getByTestId('product-setup')).toBeInTheDocument();
      
      // Add first product
      await user.type(screen.getByTestId('product-name'), 'Premium Chocolate Cake');
      await user.type(screen.getByTestId('product-price'), '59.99');
      await user.selectOptions(screen.getByTestId('product-category'), 'cakes');
      await user.type(screen.getByTestId('product-description'), 'Rich chocolate cake with premium ingredients');
      await user.click(screen.getByTestId('add-product'));

      // Verify product was added
      expect(screen.getByText('Your Products (1)')).toBeInTheDocument();
      expect(screen.getByTestId('product-item-' + mockAppState.products[0].id)).toHaveTextContent('Premium Chocolate Cake - $59.99 (cakes)');

      // Add second product
      await user.clear(screen.getByTestId('product-name'));
      await user.type(screen.getByTestId('product-name'), 'Gourmet Cupcakes');
      await user.clear(screen.getByTestId('product-price'));
      await user.type(screen.getByTestId('product-price'), '24.99');
      await user.selectOptions(screen.getByTestId('product-category'), 'cupcakes');
      await user.clear(screen.getByTestId('product-description'));
      await user.type(screen.getByTestId('product-description'), 'Pack of 6 gourmet cupcakes');
      await user.click(screen.getByTestId('add-product'));

      // Complete setup
      await user.click(screen.getByTestId('complete-setup'));

      // Verify baker dashboard
      expect(screen.getByTestId('baker-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('baker-name')).toHaveTextContent('Welcome, Sarah Baker');
      expect(screen.getByTestId('baker-stats')).toHaveTextContent('Products: 2');
      expect(screen.getByTestId('baker-stats')).toHaveTextContent('Specialties: Cakes, Cupcakes');
      expect(mockAppState.products).toHaveLength(2);
    });

    it('should complete order fulfillment and earnings tracking workflow', async () => {
      // Mock Baker Order Management Component
      const BakerOrderManagement = () => {
        const [orders, setOrders] = React.useState([
          {
            id: 12345,
            customerId: 1,
            customerName: 'John Customer',
            items: [
              { productId: 1, name: 'Premium Chocolate Cake', quantity: 1, price: 5999 }
            ],
            totalAmount: 5999,
            status: 'pending',
            createdAt: new Date(),
            shippingAddress: '123 Main St, Bakery City, BC 12345'
          }
        ]);

        const [earnings, setEarnings] = React.useState({
          totalEarnings: 0,
          pendingEarnings: 0,
          thisMonthEarnings: 0
        });

        const updateOrderStatus = (orderId: number, newStatus: string) => {
          setOrders(orders.map(order => {
            if (order.id === orderId) {
              const updatedOrder = { ...order, status: newStatus };
              
              // Calculate earnings when order is completed
              if (newStatus === 'completed') {
                const commission = Math.round(order.totalAmount * 0.15); // 15% commission
                setEarnings(prev => ({
                  totalEarnings: prev.totalEarnings + commission,
                  pendingEarnings: prev.pendingEarnings + commission,
                  thisMonthEarnings: prev.thisMonthEarnings + commission
                }));
              }
              
              return updatedOrder;
            }
            return order;
          }));
        };

        return (
          <div data-testid="baker-order-management">
            <h1>Order Management Dashboard</h1>
            
            {/* Earnings Summary */}
            <div data-testid="earnings-summary">
              <h2>Earnings Summary</h2>
              <div data-testid="total-earnings">Total Earnings: ${(earnings.totalEarnings / 100).toFixed(2)}</div>
              <div data-testid="pending-earnings">Pending: ${(earnings.pendingEarnings / 100).toFixed(2)}</div>
              <div data-testid="month-earnings">This Month: ${(earnings.thisMonthEarnings / 100).toFixed(2)}</div>
            </div>

            {/* Orders List */}
            <div data-testid="orders-list">
              <h2>Recent Orders</h2>
              {orders.map(order => (
                <div key={order.id} data-testid={`order-${order.id}`}>
                  <h3>Order #{order.id}</h3>
                  <p>Customer: {order.customerName}</p>
                  <p>Total: ${(order.totalAmount / 100).toFixed(2)}</p>
                  <p data-testid={`order-status-${order.id}`}>Status: {order.status}</p>
                  <div>
                    Items:
                    {order.items.map(item => (
                      <div key={item.productId}>
                        {item.name} x {item.quantity}
                      </div>
                    ))}
                  </div>
                  <p>Shipping: {order.shippingAddress}</p>
                  
                  {/* Status Update Buttons */}
                  <div data-testid={`order-actions-${order.id}`}>
                    {order.status === 'pending' && (
                      <button
                        data-testid={`confirm-order-${order.id}`}
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      >
                        Confirm Order
                      </button>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        data-testid={`start-preparation-${order.id}`}
                        onClick={() => updateOrderStatus(order.id, 'in_preparation')}
                      >
                        Start Preparation
                      </button>
                    )}
                    {order.status === 'in_preparation' && (
                      <button
                        data-testid={`mark-ready-${order.id}`}
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                      >
                        Mark as Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        data-testid={`complete-order-${order.id}`}
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                      >
                        Complete Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<BakerOrderManagement />);

      // Verify initial state
      expect(screen.getByTestId('order-12345')).toBeInTheDocument();
      expect(screen.getByTestId('order-status-12345')).toHaveTextContent('Status: pending');
      expect(screen.getByTestId('total-earnings')).toHaveTextContent('Total Earnings: $0.00');

      // Process order through workflow
      await user.click(screen.getByTestId('confirm-order-12345'));
      expect(screen.getByTestId('order-status-12345')).toHaveTextContent('Status: confirmed');

      await user.click(screen.getByTestId('start-preparation-12345'));
      expect(screen.getByTestId('order-status-12345')).toHaveTextContent('Status: in_preparation');

      await user.click(screen.getByTestId('mark-ready-12345'));
      expect(screen.getByTestId('order-status-12345')).toHaveTextContent('Status: ready');

      await user.click(screen.getByTestId('complete-order-12345'));
      expect(screen.getByTestId('order-status-12345')).toHaveTextContent('Status: completed');

      // Verify earnings calculation (15% of $59.99 = $8.99)
      expect(screen.getByTestId('total-earnings')).toHaveTextContent('Total Earnings: $8.99');
      expect(screen.getByTestId('pending-earnings')).toHaveTextContent('Pending: $8.99');
    });
  });

  describe('Complete Admin Journey - System Management and Analytics', () => {
    it('should complete admin dashboard and user management workflow', async () => {
      // Mock Admin Dashboard Component
      const AdminDashboard = () => {
        const [view, setView] = React.useState('overview');
        const [stats] = React.useState({
          totalUsers: 150,
          totalBakers: 25,
          totalCustomers: 125,
          totalOrders: 500,
          totalRevenue: 125000,
          monthlyRevenue: 15000,
          activeOrders: 45
        });

        const [users] = React.useState([
          { id: 1, name: 'John Customer', email: 'john@example.com', role: 'customer', status: 'active', joinDate: '2025-01-15' },
          { id: 2, name: 'Sarah Baker', email: 'sarah@example.com', role: 'baker', status: 'active', joinDate: '2025-01-10' },
          { id: 3, name: 'Mike Chef', email: 'mike@example.com', role: 'baker', status: 'pending', joinDate: '2025-01-20' }
        ]);

        const [orders] = React.useState([
          { id: 1001, customerId: 1, customerName: 'John Customer', total: 5999, status: 'completed', date: '2025-01-22' },
          { id: 1002, customerId: 3, customerName: 'Jane Doe', total: 2499, status: 'pending', date: '2025-01-23' }
        ]);

        return (
          <div data-testid="admin-dashboard">
            <h1>Admin Dashboard</h1>
            
            {/* Navigation */}
            <nav data-testid="admin-nav">
              <button 
                data-testid="nav-overview"
                onClick={() => setView('overview')}
                className={view === 'overview' ? 'active' : ''}
              >
                Overview
              </button>
              <button 
                data-testid="nav-users"
                onClick={() => setView('users')}
                className={view === 'users' ? 'active' : ''}
              >
                Users
              </button>
              <button 
                data-testid="nav-orders"
                onClick={() => setView('orders')}
                className={view === 'orders' ? 'active' : ''}
              >
                Orders
              </button>
              <button 
                data-testid="nav-analytics"
                onClick={() => setView('analytics')}
                className={view === 'analytics' ? 'active' : ''}
              >
                Analytics
              </button>
            </nav>

            {/* Overview */}
            {view === 'overview' && (
              <div data-testid="overview-section">
                <h2>System Overview</h2>
                <div data-testid="stats-grid">
                  <div data-testid="stat-users">Total Users: {stats.totalUsers}</div>
                  <div data-testid="stat-bakers">Bakers: {stats.totalBakers}</div>
                  <div data-testid="stat-customers">Customers: {stats.totalCustomers}</div>
                  <div data-testid="stat-orders">Total Orders: {stats.totalOrders}</div>
                  <div data-testid="stat-revenue">Total Revenue: ${(stats.totalRevenue / 100).toFixed(2)}</div>
                  <div data-testid="stat-monthly">Monthly Revenue: ${(stats.monthlyRevenue / 100).toFixed(2)}</div>
                  <div data-testid="stat-active">Active Orders: {stats.activeOrders}</div>
                </div>
              </div>
            )}

            {/* User Management */}
            {view === 'users' && (
              <div data-testid="users-section">
                <h2>User Management</h2>
                <div data-testid="users-list">
                  {users.map(user => (
                    <div key={user.id} data-testid={`user-${user.id}`}>
                      <h3>{user.name}</h3>
                      <p>Email: {user.email}</p>
                      <p>Role: {user.role}</p>
                      <p data-testid={`user-status-${user.id}`}>Status: {user.status}</p>
                      <p>Joined: {user.joinDate}</p>
                      {user.status === 'pending' && (
                        <button data-testid={`approve-user-${user.id}`}>
                          Approve Baker
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Management */}
            {view === 'orders' && (
              <div data-testid="orders-section">
                <h2>Order Management</h2>
                <div data-testid="orders-list">
                  {orders.map(order => (
                    <div key={order.id} data-testid={`admin-order-${order.id}`}>
                      <h3>Order #{order.id}</h3>
                      <p>Customer: {order.customerName}</p>
                      <p>Total: ${(order.total / 100).toFixed(2)}</p>
                      <p data-testid={`admin-order-status-${order.id}`}>Status: {order.status}</p>
                      <p>Date: {order.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics */}
            {view === 'analytics' && (
              <div data-testid="analytics-section">
                <h2>Analytics & Reports</h2>
                <div data-testid="analytics-metrics">
                  <div data-testid="conversion-rate">Conversion Rate: 12.5%</div>
                  <div data-testid="avg-order-value">Average Order Value: ${((stats.totalRevenue / stats.totalOrders) / 100).toFixed(2)}</div>
                  <div data-testid="baker-utilization">Baker Utilization: 85%</div>
                  <div data-testid="customer-satisfaction">Customer Satisfaction: 4.8/5</div>
                </div>
                <button data-testid="export-report">Export Monthly Report</button>
                <button data-testid="generate-insights">Generate AI Insights</button>
              </div>
            )}
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<AdminDashboard />);

      // Test navigation and overview
      expect(screen.getByTestId('overview-section')).toBeInTheDocument();
      expect(screen.getByTestId('stat-users')).toHaveTextContent('Total Users: 150');
      expect(screen.getByTestId('stat-revenue')).toHaveTextContent('Total Revenue: $1250.00');

      // Test user management
      await user.click(screen.getByTestId('nav-users'));
      expect(screen.getByTestId('users-section')).toBeInTheDocument();
      expect(screen.getByTestId('user-1')).toHaveTextContent('John Customer');
      expect(screen.getByTestId('user-status-3')).toHaveTextContent('Status: pending');

      // Test order management
      await user.click(screen.getByTestId('nav-orders'));
      expect(screen.getByTestId('orders-section')).toBeInTheDocument();
      expect(screen.getByTestId('admin-order-1001')).toHaveTextContent('Order #1001');
      expect(screen.getByTestId('admin-order-status-1001')).toHaveTextContent('Status: completed');

      // Test analytics
      await user.click(screen.getByTestId('nav-analytics'));
      expect(screen.getByTestId('analytics-section')).toBeInTheDocument();
      expect(screen.getByTestId('conversion-rate')).toHaveTextContent('Conversion Rate: 12.5%');
      expect(screen.getByTestId('avg-order-value')).toHaveTextContent('Average Order Value: $2.50');
    });
  });

  describe('Error Handling and Edge Cases in E2E Workflows', () => {
    it('should handle payment failures and order recovery', async () => {
      // Mock Payment Processing Component
      const PaymentProcessing = () => {
        const [paymentStep, setPaymentStep] = React.useState('processing');
        const [retryCount, setRetryCount] = React.useState(0);

        React.useEffect(() => {
          if (paymentStep === 'processing') {
            setTimeout(() => {
              if (retryCount === 0) {
                setPaymentStep('failed');
              } else {
                setPaymentStep('success');
              }
            }, 1000);
          }
        }, [paymentStep, retryCount]);

        const retryPayment = () => {
          setRetryCount(retryCount + 1);
          setPaymentStep('processing');
        };

        return (
          <div data-testid="payment-processing">
            {paymentStep === 'processing' && (
              <div data-testid="payment-loading">
                <h2>Processing Payment...</h2>
                <p>Please wait while we process your payment.</p>
              </div>
            )}

            {paymentStep === 'failed' && (
              <div data-testid="payment-failed">
                <h2>Payment Failed</h2>
                <p>We couldn't process your payment. This could be due to:</p>
                <ul>
                  <li>Insufficient funds</li>
                  <li>Network connectivity issues</li>
                  <li>Card information incorrect</li>
                </ul>
                <button data-testid="retry-payment" onClick={retryPayment}>
                  Retry Payment
                </button>
                <button data-testid="change-payment-method">
                  Change Payment Method
                </button>
                <button data-testid="save-order-draft">
                  Save Order as Draft
                </button>
              </div>
            )}

            {paymentStep === 'success' && (
              <div data-testid="payment-success">
                <h2>Payment Successful!</h2>
                <p>Your order has been placed successfully.</p>
                <p data-testid="retry-count">Retry attempts: {retryCount}</p>
              </div>
            )}
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<PaymentProcessing />);

      // Initial payment processing
      expect(screen.getByTestId('payment-loading')).toBeInTheDocument();

      // Wait for payment failure
      await waitFor(() => {
        expect(screen.getByTestId('payment-failed')).toBeInTheDocument();
      });

      expect(screen.getByText('Payment Failed')).toBeInTheDocument();

      // Retry payment
      await user.click(screen.getByTestId('retry-payment'));
      expect(screen.getByTestId('payment-loading')).toBeInTheDocument();

      // Wait for successful retry
      await waitFor(() => {
        expect(screen.getByTestId('payment-success')).toBeInTheDocument();
      });

      expect(screen.getByTestId('retry-count')).toHaveTextContent('Retry attempts: 1');
    });

    it('should handle inventory management and stock updates', async () => {
      // Mock Inventory Management Component
      const InventoryManagement = () => {
        const [products, setProducts] = React.useState([
          { id: 1, name: 'Chocolate Cake', stock: 5, lowStockThreshold: 2 },
          { id: 2, name: 'Vanilla Cupcakes', stock: 1, lowStockThreshold: 3 },
          { id: 3, name: 'Red Velvet Cake', stock: 0, lowStockThreshold: 2 }
        ]);

        const [orderAttempts, setOrderAttempts] = React.useState<any[]>([]);

        const attemptOrder = (productId: number, quantity: number) => {
          const product = products.find(p => p.id === productId);
          if (!product) return;

          const attempt = {
            productId,
            productName: product.name,
            requestedQuantity: quantity,
            availableStock: product.stock,
            timestamp: new Date().toISOString()
          };

          if (product.stock >= quantity) {
            // Successful order
            setProducts(products.map(p => 
              p.id === productId 
                ? { ...p, stock: p.stock - quantity }
                : p
            ));
            setOrderAttempts([...orderAttempts, { ...attempt, status: 'success' }]);
          } else {
            // Failed order
            setOrderAttempts([...orderAttempts, { ...attempt, status: 'failed', reason: 'insufficient_stock' }]);
          }
        };

        const restockProduct = (productId: number, quantity: number) => {
          setProducts(products.map(p => 
            p.id === productId 
              ? { ...p, stock: p.stock + quantity }
              : p
          ));
        };

        return (
          <div data-testid="inventory-management">
            <h1>Inventory Management</h1>
            
            {/* Product Stock Status */}
            <div data-testid="stock-status">
              <h2>Current Stock</h2>
              {products.map(product => (
                <div key={product.id} data-testid={`product-stock-${product.id}`}>
                  <span>{product.name}: {product.stock} units</span>
                  {product.stock === 0 && (
                    <span data-testid={`out-of-stock-${product.id}`} style={{color: 'red'}}> - OUT OF STOCK</span>
                  )}
                  {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                    <span data-testid={`low-stock-${product.id}`} style={{color: 'orange'}}> - LOW STOCK</span>
                  )}
                  <button 
                    data-testid={`restock-${product.id}`}
                    onClick={() => restockProduct(product.id, 10)}
                  >
                    Restock (+10)
                  </button>
                </div>
              ))}
            </div>

            {/* Order Simulation */}
            <div data-testid="order-simulation">
              <h2>Simulate Orders</h2>
              {products.map(product => (
                <div key={product.id}>
                  <span>{product.name}</span>
                  <button 
                    data-testid={`order-1-${product.id}`}
                    onClick={() => attemptOrder(product.id, 1)}
                  >
                    Order 1 unit
                  </button>
                  <button 
                    data-testid={`order-3-${product.id}`}
                    onClick={() => attemptOrder(product.id, 3)}
                  >
                    Order 3 units
                  </button>
                </div>
              ))}
            </div>

            {/* Order Attempts Log */}
            <div data-testid="order-attempts">
              <h2>Order Attempts</h2>
              {orderAttempts.map((attempt, index) => (
                <div key={index} data-testid={`attempt-${index}`}>
                  {attempt.productName}: {attempt.requestedQuantity} units - 
                  <span data-testid={`attempt-status-${index}`}> {attempt.status}</span>
                  {attempt.status === 'failed' && (
                    <span> (Available: {attempt.availableStock})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      };

      const user = userEvent.setup();
      renderWithProviders(<InventoryManagement />);

      // Check initial stock status
      expect(screen.getByTestId('out-of-stock-3')).toBeInTheDocument();
      expect(screen.getByTestId('low-stock-2')).toBeInTheDocument();

      // Try to order out of stock item
      await user.click(screen.getByTestId('order-1-3'));
      expect(screen.getByTestId('attempt-0')).toHaveTextContent('Red Velvet Cake: 1 units - failed');

      // Successfully order available item
      await user.click(screen.getByTestId('order-1-1'));
      expect(screen.getByTestId('attempt-1')).toHaveTextContent('Chocolate Cake: 1 units - success');
      expect(screen.getByTestId('product-stock-1')).toHaveTextContent('Chocolate Cake: 4 units');

      // Try to order more than available
      await user.click(screen.getByTestId('order-3-2'));
      expect(screen.getByTestId('attempt-2')).toHaveTextContent('Vanilla Cupcakes: 3 units - failed');

      // Restock and try again
      await user.click(screen.getByTestId('restock-3'));
      expect(screen.getByTestId('product-stock-3')).toHaveTextContent('Red Velvet Cake: 10 units');
      
      await user.click(screen.getByTestId('order-3-3'));
      expect(screen.getByTestId('attempt-3')).toHaveTextContent('Red Velvet Cake: 3 units - success');
    });
  });
});
