import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, CustomCake } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface CartItem {
  id: string;  // Unique identifier: product-{id} or custom-cake-{id}
  product?: Product;
  customCake?: CustomCake;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product | CustomCake, quantity?: number, isCustomCake?: boolean) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  clearAnonymousCartData: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  toggleCart: () => void;
}

// Generate a unique session ID for anonymous users
const generateSessionId = (): string => {
  return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Get or create session ID for anonymous users
const getAnonymousSessionId = (): string => {
  let sessionId = localStorage.getItem("bakeryBlissSessionId");
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem("bakeryBlissSessionId", sessionId);
  }
  return sessionId;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get user-specific cart key
  const getCartKey = (): string => {
    if (user) {
      return `bakeryBlissCart_user_${user.id}`;
    } else {
      return `bakeryBlissCart_${getAnonymousSessionId()}`;
    }
  };
  
  // Load cart from localStorage based on user/session
  const loadCartFromStorage = () => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  };
  
  // Save cart to localStorage with user/session specific key
  const saveCartToStorage = (items: CartItem[]) => {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(items));
  };
  
  // Load cart when component mounts or user changes
  useEffect(() => {
    loadCartFromStorage();
  }, [user]); // Re-load cart when user changes (login/logout)
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0 || user) { // Always save for authenticated users, even if empty
      saveCartToStorage(cartItems);
    }
  }, [cartItems, user]);
  
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };
  
  const addToCart = (
    item: Product | CustomCake, 
    quantity = 1, 
    isCustomCake = false
  ) => {
    setCartItems(prev => {
      const itemId = isCustomCake ? `custom-cake-${item.id}` : `product-${item.id}`;
      const existingItemIndex = prev.findIndex(cartItem => cartItem.id === itemId);
      
      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        const newCartItems = [...prev];
        newCartItems[existingItemIndex].quantity += quantity;
        
        toast({
          title: "Cart updated",
          description: `Quantity increased to ${newCartItems[existingItemIndex].quantity}`,
        });
        
        return newCartItems;
      } else {
        // Item doesn't exist, add new item
        const newItem: CartItem = {
          id: itemId,
          ...(isCustomCake ? { customCake: item as CustomCake } : { product: item as Product }),
          quantity
        };
        
        toast({
          title: "Added to cart",
          description: isCustomCake 
            ? "Your custom cake has been added to cart" 
            : `${(item as Product).name} has been added to cart`,
        });
        
        return [...prev, newItem];
      }
    });
  };
  
  const removeFromCart = (itemId: string) => {
    setCartItems(prev => {
      const removedItem = prev.find(item => item.id === itemId);
      
      if (removedItem) {
        toast({
          title: "Removed from cart",
          description: removedItem.product
            ? `${removedItem.product.name} has been removed from cart`
            : "Item has been removed from cart",
        });
      }
      
      return prev.filter(item => item.id !== itemId);
    });
  };
  
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity } 
          : item
      )
    );
  };
    const clearCart = () => {
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };
  
  // Clear anonymous cart data when user logs out (optional cleanup)
  const clearAnonymousCartData = () => {
    const sessionId = localStorage.getItem("bakeryBlissSessionId");
    if (sessionId) {
      localStorage.removeItem(`bakeryBlissCart_${sessionId}`);
      localStorage.removeItem("bakeryBlissSessionId");
    }
  };
  
  // When user logs out, clear their cart and cleanup anonymous data
  useEffect(() => {
    if (!user) {
      // User logged out, clear the cart but keep anonymous session for potential future use
      setCartItems([]);
    }
  }, [user]);
  
  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => {
    const itemPrice = item.product 
      ? item.product.price 
      : item.customCake 
        ? item.customCake.totalPrice 
        : 0;
    
    return total + (itemPrice * item.quantity);
  }, 0);
    return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        clearAnonymousCartData,
        cartTotal,
        isCartOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
