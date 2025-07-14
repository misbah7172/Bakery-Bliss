import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock components for integration testing
const MockBakerEarnings = ({ bakerId }: { bakerId: number }) => {
  const [earnings, setEarnings] = React.useState({
    total: 0,
    pending: 0,
    paid: 0
  });

  React.useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setEarnings({
        total: 1050,
        pending: 500,
        paid: 550
      });
    }, 100);
  }, [bakerId]);

  return (
    <div data-testid="baker-earnings">
      <h2>Baker Earnings</h2>
      <div data-testid="total-earnings">Total: ${earnings.total / 100}</div>
      <div data-testid="pending-earnings">Pending: ${earnings.pending / 100}</div>
      <div data-testid="paid-earnings">Paid: ${earnings.paid / 100}</div>
    </div>
  );
};

const MockProductCard = ({ product, onAddToCart }: { 
  product: any; 
  onAddToCart: (productId: number) => void;
}) => {
  return (
    <div data-testid={`product-${product.id}`}>
      <h3>{product.name}</h3>
      <p>${product.price / 100}</p>
      <button 
        onClick={() => onAddToCart(product.id)}
        data-testid={`add-to-cart-${product.id}`}
      >
        Add to Cart
      </button>
    </div>
  );
};

const MockOrderSummary = ({ orderId }: { orderId: number }) => {
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setOrder({
        id: orderId,
        total: 6998,
        status: 'confirmed',
        items: [
          { id: 1, name: 'Test Cake', quantity: 2, price: 3499 }
        ]
      });
      setLoading(false);
    }, 100);
  }, [orderId]);

  if (loading) return <div data-testid="loading">Loading...</div>;

  return (
    <div data-testid="order-summary">
      <h2>Order #{order.id}</h2>
      <p data-testid="order-status">Status: {order.status}</p>
      <p data-testid="order-total">Total: ${order.total / 100}</p>
      <div data-testid="order-items">
        {order.items.map((item: any) => (
          <div key={item.id} data-testid={`item-${item.id}`}>
            {item.name} x {item.quantity} = ${(item.price * item.quantity) / 100}
          </div>
        ))}
      </div>
    </div>
  );
};

const MockCart = () => {
  const [items, setItems] = React.useState<any[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  const addItem = (productId: number) => {
    const existingItem = items.find(item => item.productId === productId);
    if (existingItem) {
      setItems(items.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, { productId, quantity: 1, price: 3499 }]);
    }
  };

  const removeItem = (productId: number) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const getTotalItems = () => items.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        data-testid="cart-toggle"
      >
        Cart ({getTotalItems()})
      </button>
      {isOpen && (
        <div data-testid="cart-drawer">
          <h3>Shopping Cart</h3>
          {items.length === 0 ? (
            <p data-testid="empty-cart">Cart is empty</p>
          ) : (
            <>
              {items.map(item => (
                <div key={item.productId} data-testid={`cart-item-${item.productId}`}>
                  Product {item.productId} x {item.quantity}
                  <button 
                    onClick={() => removeItem(item.productId)}
                    data-testid={`remove-${item.productId}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div data-testid="cart-total">
                Total: ${getTotalPrice() / 100}
              </div>
            </>
          )}
        </div>
      )}
      {/* Expose addItem for testing */}
      <div style={{ display: 'none' }}>
        <button 
          onClick={() => addItem(1)}
          data-testid="test-add-item"
        >
          Test Add Item
        </button>
      </div>
    </div>
  );
};

describe('Component Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('BakerEarnings Component Integration', () => {
    it('should load and display baker earnings data', async () => {
      renderWithProviders(<MockBakerEarnings bakerId={123} />);

      expect(screen.getByText('Baker Earnings')).toBeInTheDocument();
      
      // Wait for async data loading
      await waitFor(() => {
        expect(screen.getByTestId('total-earnings')).toHaveTextContent('Total: $10.5');
      });

      expect(screen.getByTestId('pending-earnings')).toHaveTextContent('Pending: $5');
      expect(screen.getByTestId('paid-earnings')).toHaveTextContent('Paid: $5.5');
    });

    it('should handle different baker IDs', async () => {
      const { rerender } = renderWithProviders(<MockBakerEarnings bakerId={123} />);

      await waitFor(() => {
        expect(screen.getByTestId('total-earnings')).toHaveTextContent('Total: $10.5');
      });

      // Change baker ID
      rerender(
        <QueryClientProvider client={queryClient}>
          <MockBakerEarnings bakerId={456} />
        </QueryClientProvider>
      );

      // Should reload data for new baker
      await waitFor(() => {
        expect(screen.getByTestId('total-earnings')).toHaveTextContent('Total: $10.5');
      });
    });
  });

  describe('Product and Cart Integration', () => {
    it('should handle product addition to cart flow', async () => {
      const user = userEvent.setup();
      const mockProduct = {
        id: 1,
        name: 'Test Cake',
        price: 3499
      };

      let cartItems: number[] = [];
      const handleAddToCart = (productId: number) => {
        cartItems.push(productId);
      };

      render(
        <div>
          <MockProductCard product={mockProduct} onAddToCart={handleAddToCart} />
          <MockCart />
        </div>
      );

      // Check product display
      expect(screen.getByText('Test Cake')).toBeInTheDocument();
      expect(screen.getByText('$34.99')).toBeInTheDocument();

      // Add to cart
      await user.click(screen.getByTestId('add-to-cart-1'));
      expect(cartItems).toContain(1);

      // Test cart functionality
      await user.click(screen.getByTestId('test-add-item'));
      await user.click(screen.getByTestId('cart-toggle'));

      expect(screen.getByTestId('cart-drawer')).toBeInTheDocument();
      expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
    });

    it('should handle cart item removal', async () => {
      const user = userEvent.setup();
      
      render(<MockCart />);

      // Add item to cart
      await user.click(screen.getByTestId('test-add-item'));
      await user.click(screen.getByTestId('cart-toggle'));

      expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();

      // Remove item
      await user.click(screen.getByTestId('remove-1'));
      expect(screen.getByTestId('empty-cart')).toBeInTheDocument();
    });

    it('should calculate cart totals correctly', async () => {
      const user = userEvent.setup();
      
      render(<MockCart />);

      // Add multiple items
      await user.click(screen.getByTestId('test-add-item'));
      await user.click(screen.getByTestId('test-add-item'));
      await user.click(screen.getByTestId('cart-toggle'));

      expect(screen.getByTestId('cart-total')).toHaveTextContent('Total: $69.98');
    });
  });

  describe('Order Processing Integration', () => {
    it('should load and display order summary', async () => {
      renderWithProviders(<MockOrderSummary orderId={12345} />);

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Wait for order data to load
      await waitFor(() => {
        expect(screen.getByText('Order #12345')).toBeInTheDocument();
      });

      expect(screen.getByTestId('order-status')).toHaveTextContent('Status: confirmed');
      expect(screen.getByTestId('order-total')).toHaveTextContent('Total: $69.98');
      expect(screen.getByTestId('item-1')).toHaveTextContent('Test Cake x 2 = $69.98');
    });

    it('should handle order loading states', async () => {
      renderWithProviders(<MockOrderSummary orderId={12345} />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.getByTestId('order-summary')).toBeInTheDocument();
      });
    });
  });

  describe('User Interaction Integration', () => {
    it('should handle complex user workflows', async () => {
      const user = userEvent.setup();
      
      const MockApp = () => {
        const [currentView, setCurrentView] = React.useState('products');
        const [selectedOrder, setSelectedOrder] = React.useState<number | null>(null);

        return (
          <div>
            <nav>
              <button 
                onClick={() => setCurrentView('products')}
                data-testid="nav-products"
              >
                Products
              </button>
              <button 
                onClick={() => setCurrentView('orders')}
                data-testid="nav-orders"
              >
                Orders
              </button>
              <button 
                onClick={() => setCurrentView('earnings')}
                data-testid="nav-earnings"
              >
                Earnings
              </button>
            </nav>

            {currentView === 'products' && (
              <div data-testid="products-view">
                <MockProductCard 
                  product={{ id: 1, name: 'Test Cake', price: 3499 }}
                  onAddToCart={() => {}}
                />
                <MockCart />
              </div>
            )}

            {currentView === 'orders' && (
              <div data-testid="orders-view">
                <button 
                  onClick={() => setSelectedOrder(12345)}
                  data-testid="view-order-12345"
                >
                  View Order #12345
                </button>
                {selectedOrder && <MockOrderSummary orderId={selectedOrder} />}
              </div>
            )}

            {currentView === 'earnings' && (
              <div data-testid="earnings-view">
                <MockBakerEarnings bakerId={123} />
              </div>
            )}
          </div>
        );
      };

      renderWithProviders(<MockApp />);

      // Start at products view
      expect(screen.getByTestId('products-view')).toBeInTheDocument();

      // Navigate to orders
      await user.click(screen.getByTestId('nav-orders'));
      expect(screen.getByTestId('orders-view')).toBeInTheDocument();

      // View specific order
      await user.click(screen.getByTestId('view-order-12345'));
      await waitFor(() => {
        expect(screen.getByText('Order #12345')).toBeInTheDocument();
      });

      // Navigate to earnings
      await user.click(screen.getByTestId('nav-earnings'));
      expect(screen.getByTestId('earnings-view')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('total-earnings')).toHaveTextContent('Total: $10.5');
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle component error states gracefully', async () => {
      const ErrorProneComponent = ({ shouldError }: { shouldError: boolean }) => {
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          if (shouldError) {
            setTimeout(() => {
              setError('Failed to load data');
            }, 100);
          }
        }, [shouldError]);

        if (error) {
          return <div data-testid="error-message">{error}</div>;
        }

        return <div data-testid="success-content">Data loaded successfully</div>;
      };

      const { rerender } = render(<ErrorProneComponent shouldError={false} />);
      expect(screen.getByTestId('success-content')).toBeInTheDocument();

      rerender(<ErrorProneComponent shouldError={true} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load data');
      });
    });

    it('should handle network error simulation', async () => {
      const NetworkComponent = () => {
        const [loading, setLoading] = React.useState(true);
        const [error, setError] = React.useState<string | null>(null);
        const [data, setData] = React.useState(null);

        React.useEffect(() => {
          // Simulate network request
          setTimeout(() => {
            // Simulate network failure
            setError('Network request failed');
            setLoading(false);
          }, 100);
        }, []);

        if (loading) return <div data-testid="network-loading">Loading...</div>;
        if (error) return <div data-testid="network-error">{error}</div>;
        return <div data-testid="network-success">Data loaded</div>;
      };

      render(<NetworkComponent />);
      
      expect(screen.getByTestId('network-loading')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('network-error')).toHaveTextContent('Network request failed');
      });
    });
  });
});
