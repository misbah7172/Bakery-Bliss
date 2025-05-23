import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Package, Clock, ShoppingCart, Check, X, MessageCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Link } from "wouter";

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
  orderNumber: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  totalAmount: number;
  items: OrderItem[];
  estimatedDelivery?: Date;
  hasUnreadMessages?: boolean;
}

const OrdersPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  // Status color and label mapping
  const orderStatusMap: Record<string, { color: string; label: string }> = {
    "pending": { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    "processing": { color: "bg-blue-100 text-blue-800", label: "Processing" },
    "quality_check": { color: "bg-purple-100 text-purple-800", label: "Quality Check" },
    "ready": { color: "bg-green-100 text-green-800", label: "Ready" },
    "delivered": { color: "bg-gray-100 text-gray-800", label: "Delivered" },
    "cancelled": { color: "bg-red-100 text-red-800", label: "Cancelled" }
  };

  // Load orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // In a real implementation, we would fetch from the backend
        // For now, we'll use mock data
        setTimeout(() => {
          setOrders([
            {
              id: 1,
              orderNumber: "ORD-1001",
              status: "delivered",
              createdAt: new Date(Date.now() - 3600000 * 24 * 7),
              updatedAt: new Date(Date.now() - 3600000 * 24 * 5),
              totalAmount: 42.99,
              items: [
                { id: 1, name: "Birthday Cake", quantity: 1, price: 32.99, imageUrl: "/cake1.jpg" },
                { id: 2, name: "Delivery", quantity: 1, price: 10.00 }
              ],
              estimatedDelivery: new Date(Date.now() - 3600000 * 24 * 5)
            },
            {
              id: 2,
              orderNumber: "ORD-1002",
              status: "processing",
              createdAt: new Date(Date.now() - 3600000 * 24 * 2),
              updatedAt: new Date(Date.now() - 3600000 * 24 * 1),
              totalAmount: 56.50,
              items: [
                { id: 3, name: "Custom Chocolate Cake", quantity: 1, price: 45.50, isCustomCake: true },
                { id: 4, name: "Delivery", quantity: 1, price: 11.00 }
              ],
              estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 2),
              hasUnreadMessages: true
            },
            {
              id: 3,
              orderNumber: "ORD-1003",
              status: "pending",
              createdAt: new Date(Date.now() - 3600000 * 3),
              updatedAt: new Date(Date.now() - 3600000 * 3),
              totalAmount: 28.75,
              items: [
                { id: 5, name: "Chocolate Chip Cookies (Dozen)", quantity: 2, price: 12.99 },
                { id: 6, name: "Delivery", quantity: 1, price: 2.77 }
              ],
              estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 1)
            }
          ]);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ["pending", "processing", "quality_check", "ready"].includes(order.status);
    if (activeTab === "completed") return order.status === "delivered";
    if (activeTab === "cancelled") return order.status === "cancelled";
    return true;
  });

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
                            Order #{order.orderNumber}
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
                    <CardContent className="p-4 pt-2">
                      <div className="mt-4 space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-12 w-12 rounded-md bg-muted mr-3 flex items-center justify-center">
                                {item.imageUrl ? (
                                  <img 
                                    src={item.imageUrl} 
                                    alt={item.name}
                                    className="h-full w-full object-cover rounded-md"
                                  />
                                ) : (
                                  item.isCustomCake ? (
                                    <span className="text-xl">🎂</span>
                                  ) : (
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  )
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} × {formatCurrency(item.price)}
                                </p>
                              </div>
                            </div>
                            <p className="font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {order.status === "delivered" ? (
                              <span>Delivered on {new Date(order.estimatedDelivery || order.updatedAt).toLocaleDateString()}</span>
                            ) : order.estimatedDelivery ? (
                              <span>Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                            ) : (
                              <span>Delivery date to be confirmed</span>
                            )}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Link href={`/chat/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Chat
                            </Button>
                          </Link>
                          <Link href={`/orders/${order.id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </div>
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

export default OrdersPage;