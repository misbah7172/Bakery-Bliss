import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Sparkles, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Product } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  
  // Check if product is liked
  const { data: likedStatus } = useQuery<{ liked: boolean }>({
    queryKey: [`/api/liked-products/check/${product.id}`],
    enabled: !!user && user.role === 'customer',
  });
  
  const isLiked = likedStatus?.liked || false;
  
  // Add to liked products mutation
  const addToLikedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/liked-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: product.id }),
      });
      if (!res.ok) throw new Error('Failed to add to liked products');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/liked-products/check/${product.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/liked-products'] });
    },
  });
  
  // Remove from liked products mutation
  const removeFromLikedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/liked-products/${product.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove from liked products');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/liked-products/check/${product.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/liked-products'] });
    },
  });
  
  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || user.role !== 'customer') return;
    
    if (isLiked) {
      removeFromLikedMutation.mutate();
    } else {
      addToLikedMutation.mutate();
    }
  };
  

  
  return (
    <Card 
      className="overflow-hidden transition-all duration-500 hover:shadow-2xl group bg-white border-0 shadow-md rounded-2xl transform hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden rounded-t-2xl">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 brightness-110' : 'scale-100'}`} 
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Enhanced Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isBestSeller && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg flex items-center gap-1 px-3 py-1">
              <Crown className="w-3 h-3" />
              Best Seller
            </Badge>
          )}
          {product.isNew && (
            <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg flex items-center gap-1 px-3 py-1">
              <Sparkles className="w-3 h-3" />
              New
            </Badge>
          )}
        </div>
        
        {/* Heart Button */}
        {user && user.role === 'customer' && (
          <button
            onClick={handleLikeToggle}
            disabled={addToLikedMutation.isPending || removeFromLikedMutation.isPending}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
              isLiked 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            } transform hover:scale-110 disabled:opacity-50`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        )}
        
        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            ${product.price?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-poppins font-medium text-foreground">{product.name}</h3>
        <p className="text-primary font-poppins font-medium mt-1">${product.price?.toFixed(2) || '0.00'}</p>
        <p className="text-sm text-foreground/70 line-clamp-2 min-h-[40px]">{product.description}</p>
      </CardContent>
        <CardFooter className="p-4 pt-0">
        {(!user || user.role === "customer") && (
          <Button 
            className="w-full" 
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
