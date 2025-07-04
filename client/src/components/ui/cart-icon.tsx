import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CartIcon = () => {
  const { cartItems, toggleCart } = useCart();
  const { user } = useAuth();
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  // Only show cart icon for customers or non-authenticated users
  if (user && user.role !== "customer") {
    return null;
  }
  
  return (
    <Button 
      variant="ghost" 
      className="relative" 
      aria-label={`Shopping cart with ${itemCount} items`}
      onClick={toggleCart}
    >
      <ShoppingBag className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
      {itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center rounded-full"
        >
          {itemCount}
        </Badge>
      )}
    </Button>
  );
};

export default CartIcon;
