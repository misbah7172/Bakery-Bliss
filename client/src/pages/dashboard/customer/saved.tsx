import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, Cake, ShoppingCart, Trash, Package, Sparkles, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { Product } from "@shared/schema";

const CustomerSavedPage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();

  // Redirect if not authenticated or not a customer
  if (!user) {
    navigate("/");
    return null;
  }
  
  if (user.role !== "customer") {
    navigate("/");
    return null;
  }

  // Fetch saved/liked products
  const { data: likedProducts = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/liked-products'],
    staleTime: 1000 * 60, // 1 minute
  });

  // Remove from liked products mutation
  const removeFromLikedMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`/api/liked-products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to remove from liked products');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liked-products'] });
      toast({
        title: "💔 Removed from favorites",
        description: "The product has been removed from your saved items",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove product from favorites",
        variant: "destructive",
      });
    },
  });

  const handleRemoveFromSaved = (productId: number) => {
    removeFromLikedMutation.mutate(productId);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast({
      title: "🛒 Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-pink-500" />
              <div className="absolute inset-0 h-16 w-16 animate-ping bg-pink-400 rounded-full opacity-20"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg">Loading your saved treats...</p>
            <div className="flex space-x-2 mt-4">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Error loading favorites</h3>
            <p className="text-lg text-gray-600 mb-6">
              We couldn't load your saved items right now. Please try again later.
            </p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/liked-products'] })}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Favorite Treats</h1>
              <p className="text-gray-600">
                {likedProducts?.length || 0} {(likedProducts?.length || 0) === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {likedProducts && likedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {likedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl group bg-white border-0 shadow-md rounded-2xl">
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" 
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isBestSeller && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Best Seller
                      </div>
                    )}
                    {product.isNew && (
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        New
                      </div>
                    )}
                  </div>
                  
                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      ${product.price?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
                    {product.inStock ? (
                      <span className="text-green-600 font-medium">In Stock</span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> 
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveFromSaved(product.id)}
                    disabled={removeFromLikedMutation.isPending}
                    className="border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                  >
                    {removeFromLikedMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No saved items yet</h3>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Start browsing our delicious treats and click the heart icon to save your favorites here!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-3">
                  <Package className="w-5 h-5 mr-2" />
                  Browse Products
                </Button>
              </Link>
              <Link href="/custom-cake-builder">
                <Button variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 px-8 py-3">
                  <Cake className="w-5 h-5 mr-2" />
                  Build Custom Cake
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CustomerSavedPage;
