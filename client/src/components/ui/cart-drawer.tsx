import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

const CartDrawer = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal, isCartOpen, toggleCart } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in or create an account to proceed with checkout.",
        variant: "default",
      });
      toggleCart();
      navigate("/login");
      return;
    }

    // Here we would normally proceed with checkout
    toggleCart();
    navigate("/checkout");
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="space-y-1.5 pb-6">
          <SheetTitle className="flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Your Cart
          </SheetTitle>
          <SheetDescription>
            {cartItems.length > 0 
              ? `You have ${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`
              : 'Your cart is empty'}
          </SheetDescription>
        </SheetHeader>

        {cartItems.length > 0 ? (
          <>
            <div className="flex-grow overflow-auto py-2">
              {cartItems.map((item) => {
                const isCustomCake = !!item.customCake;
                const itemName = isCustomCake 
                  ? `Custom Cake` 
                  : item.product?.name;
                const itemPrice = isCustomCake 
                  ? item.customCake?.totalPrice 
                  : item.product?.price;
                
                return (
                  <div key={item.id} className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                        {isCustomCake ? (
                          <span className="text-xl">🎂</span>
                        ) : (
                          <img 
                            src={item.product?.imageUrl || '/placeholder-product.jpg'} 
                            alt={itemName} 
                            className="h-full w-full object-cover rounded-md"
                          />
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <h4 className="font-medium">{itemName}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isCustomCake && (
                            <>
                              Custom cake with special instructions
                            </>
                          )}
                          {item.product?.category && (
                            <span className="capitalize">{item.product.category}</span>
                          )}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              disabled={item.quantity <= 1}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="w-8 text-center">{item.quantity}</span>
                            
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(itemPrice || 0)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency((itemPrice || 0) * item.quantity)}
                        </p>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                );
              })}
            </div>
            
            <div className="mt-auto space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>
              
              <SheetFooter className="flex-col space-y-2 sm:space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={clearCart}>
                    Clear Cart
                  </Button>
                  <SheetClose asChild>
                    <Button variant="outline">
                      Continue Shopping
                    </Button>
                  </SheetClose>
                </div>
                <Button className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </SheetFooter>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 flex-grow">
            <div className="rounded-full bg-muted p-6 mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <SheetClose asChild>
              <Button>Continue Shopping</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;