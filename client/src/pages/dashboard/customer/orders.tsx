import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Package, Clock, ShoppingCart, Check, X, MessageCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

// Mock data for orders until backend connected
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  isCustomCake?: boolean;
}

interface Order {
  id: number;
  orderId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  items: OrderItem[];
  deadline?: string;
  hasUnreadMessages?: boolean;
  mainBakerId: number;
  juniorBakerId?: number;
}

const CustomerOrdersPage = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
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

  // Status color and label mapping
  const orderStatusMap: Record<string, { color: string; label: string }> = {
    "pending": { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    "processing": { color: "bg-blue-100 text-blue-800", label: "Processing" },
    "quality_check": { color: "bg-purple-100 text-purple-800", label: "Quality Check" },
    "ready": { color: "bg-green-100 text-green-800", label: "Ready" },
    "delivered": { color: "bg-gray-100 text-gray-800", label: "Delivered" },
    "cancelled": { color: "bg-red-100 text-red-800", label: "Cancelled" }
  };

  // Fetch orders from the API
  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ["pending", "processing", "quality_check", "ready"].includes(order.status);
    if (activeTab === "completed") return order.status === "delivered";
    if (activeTab === "cancelled") return order.status === "cancelled";
    return true;
  });

  if (isLoading) {
    return (
      <AppLayout showSidebar sidebarType="customer">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout showSidebar sidebarType="customer">
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <h2 className="text-xl font-bold mb-2">Error loading orders</h2>
          <p>{error.message || "Failed to load orders"}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showSidebar sidebarType="customer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">My Orders</h1>
          <Link href="/cake-builder">
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Order Custom Cake
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No orders found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeTab === "all" 
                    ? "You haven't placed any orders yet." 
                    : `You don't have any ${activeTab} orders.`}
                </p>
                <Link href="/products">
                  <Button className="mt-6">Browse Products</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 p-4 pb-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">
                            Order #{order.orderId}
                          </CardTitle>
                          <CardDescription>
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            className={orderStatusMap[order.status]?.color || "bg-gray-100 text-gray-800"}
                          >
                            {orderStatusMap[order.status]?.label || "Unknown Status"}
                          </Badge>
                          {order.hasUnreadMessages && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                              <MessageCircle className="h-3 w-3 mr-1" /> New Message
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">                      <div className="mt-4 space-y-3">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {item.imageUrl && (
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.name}
                                  className="w-12 h-12 object-cover rounded-md"
                                />
                              )}
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity}
                                </p>
                              </div>                            </div>
                            <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No items found for this order</p>
                        )}
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">Total</p>
                            <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        {order.status === "ready" && (
                          <Button variant="outline" size="sm">
                            <Check className="mr-2 h-4 w-4" />
                            Mark as Delivered
                          </Button>
                        )}
                        {order.status === "pending" && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <X className="mr-2 h-4 w-4" />
                            Cancel Order
                          </Button>
                        )}
                        <Link href={`/dashboard/customer/orders/${order.id}`}>
                          <Button size="sm">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
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

export default CustomerOrdersPage;