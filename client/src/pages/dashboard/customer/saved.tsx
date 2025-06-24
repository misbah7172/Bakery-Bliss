import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Heart, Cake, ShoppingBag, ShoppingCart, Trash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

// Mock data types for saved items
interface SavedProduct {
  id: number;
  type: "product";
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    category: string;
    mainBakerId: number;
  };
  savedAt: Date;
}

interface SavedCustomCake {
  id: number;
  type: "custom-cake";
  customCake: {
    id: number;
    name: string;
    shapeId: number;
    flavorId: number;
    frostingId: number;
    decorationId: number;
    message?: string;
    totalPrice: number;
    previewUrl?: string;
  };
  savedAt: Date;
}

type SavedItem = SavedProduct | SavedCustomCake;

const CustomerSavedPage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  // Redirect if not authenticated or not a customer
  if (!user) {
    navigate("/");
    return null;
  }
  
  if (user.role !== "customer") {
    navigate("/");
    return null;
  }

  // Load saved items
  useEffect(() => {
    const fetchSavedItems = async () => {
      setLoading(true);
      try {
        // Here we would fetch saved items from the backend
        setTimeout(() => {
          setSavedItems([
            {
              id: 1,
              type: "product",
              product: {
                id: 101,
                name: "Chocolate Truffle Cake",
                description: "Rich chocolate cake with truffle filling and chocolate ganache.",
                price: 39.99,
                imageUrl: "/cake-chocolate.jpg",
                category: "cakes",
                mainBakerId: 3
              },
              savedAt: new Date(Date.now() - 3600000 * 24 * 3)
            },
            {
              id: 2,
              type: "product",
              product: {
                id: 102,
                name: "Mixed Berry Tart",
                description: "Buttery tart shell filled with vanilla custard and topped with fresh berries.",
                price: 24.99,
                imageUrl: "/berry-tart.jpg",
                category: "pastries",
                mainBakerId: 4
              },
              savedAt: new Date(Date.now() - 3600000 * 24 * 5)
            },
            {
              id: 3,
              type: "custom-cake",
              customCake: {
                id: 201,
                name: "Birthday Custom Cake",
                shapeId: 1, // Round
                flavorId: 2, // Chocolate
                frostingId: 3, // Buttercream
                decorationId: 1, // Sprinkles
                message: "Happy Birthday!",
                totalPrice: 45.99,
                previewUrl: "/custom-cake-preview.jpg"
              },
              savedAt: new Date(Date.now() - 3600000 * 24 * 2)
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching saved items:", error);
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, []);

  // Filter saved items based on active tab
  const filteredItems = savedItems.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "products") return item.type === "product";
    if (activeTab === "custom-cakes") return item.type === "custom-cake";
    return true;
  });

  const removeFromSaved = (itemId: number) => {
    // Here we would call the backend to remove the item
    setSavedItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Item removed",
      description: "The item has been removed from your saved items",
    });
  };

  const addToCart = (item: SavedItem) => {
    // Here we would call the backend to add the item to cart
    toast({
      title: "Added to cart",
      description: item.type === "product" 
        ? `${item.product.name} has been added to your cart` 
        : "Custom cake has been added to your cart",
    });
  };

  if (loading) {
    return (
      <AppLayout showSidebar sidebarType="customer">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showSidebar sidebarType="customer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Saved Items</h1>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="custom-cakes">Custom Cakes</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No saved items</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeTab === "all" 
                    ? "You haven't saved any items yet." 
                    : activeTab === "products"
                    ? "You haven't saved any products yet."
                    : "You haven't saved any custom cakes yet."
                  }
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                  <Link href="/products">
                    <Button variant="outline">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Browse Products
                    </Button>
                  </Link>
                  <Link href="/cake-builder">
                    <Button>
                      <Cake className="mr-2 h-4 w-4" />
                      Design a Custom Cake
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden flex flex-col">
                    {item.type === 'product' ? (
                      <>
                        <div className="aspect-square overflow-hidden bg-muted">
                          {item.product.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="flex-grow p-4">
                          <CardTitle className="text-lg mb-2">{item.product.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {item.product.description}
                          </p>
                          <p className="font-semibold text-lg">{formatCurrency(item.product.price)}</p>
                        </CardContent>
                      </>
                    ) : (
                      <>
                        <div className="aspect-square overflow-hidden bg-muted">
                          {item.customCake.previewUrl ? (
                            <img 
                              src={item.customCake.previewUrl} 
                              alt={item.customCake.name || "Custom Cake"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Cake className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="flex-grow p-4">
                          <CardTitle className="text-lg mb-2">
                            {item.customCake.name || "Custom Cake Design"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mb-4">
                            {item.customCake.message && (
                              <span className="block italic">"{item.customCake.message}"</span>
                            )}
                            Custom designed cake
                          </p>
                          <p className="font-semibold text-lg">{formatCurrency(item.customCake.totalPrice)}</p>
                        </CardContent>
                      </>
                    )}
                    <CardFooter className="p-4 pt-0 border-t mt-auto">
                      <div className="flex justify-between w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => removeFromSaved(item.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => addToCart(item)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CustomerSavedPage;