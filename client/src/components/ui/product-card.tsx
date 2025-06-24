import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, StarHalf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  
  // Random rating for display - in a real app this would come from a database
  const rating = (Math.floor(Math.random() * 10) + 35) / 10; // Random rating between 3.5 and 5.0
  const reviewCount = Math.floor(Math.random() * 50) + 5; // Random review count between 5 and 55
  
  const renderRatingStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center text-primary text-sm">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`star-${i}`} className="w-4 h-4 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="w-4 h-4 fill-current" />}
        <span className="text-xs text-foreground/70 ml-1">({reviewCount})</span>
      </div>
    );
  };
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-md group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-105' : ''}`} 
        />
        {product.isBestSeller && (
          <Badge className="absolute top-2 left-2 bg-primary text-white">Best Seller</Badge>
        )}
        {product.isNew && (
          <Badge className="absolute top-2 left-2 bg-blue-500 text-white">New</Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-poppins font-medium text-foreground">{product.name}</h3>
        <p className="text-primary font-poppins font-medium mt-1">${product.price.toFixed(2)}</p>
        <div className="mt-2 mb-3">
          {renderRatingStars()}
        </div>
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
