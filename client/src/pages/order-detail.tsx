import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Package, MessageCircle, Clock, Calendar, Receipt, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Mock data for order details until backend connected
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  isCustomCake?: boolean;
}

interface BakerInfo {
  id: number;
  name: string;
  role: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  totalAmount: number;
  items: OrderItem[];
  baker?: BakerInfo;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentMethod?: string;
  hasUnreadMessages?: boolean;
}

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  // Status color and label mapping
  const orderStatusMap: Record<string, { color: string; label: string }> = {
    "pending": { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    "processing": { color: "bg-blue-100 text-blue-800", label: "Processing" },
    "quality_check": { color: "bg-purple-100 text-purple-800", label: "Quality Check" },
    "ready": { color: "bg-green-100 text-green-800", label: "Ready" },
    "delivered": { color: "bg-gray-100 text-gray-800", label: "Delivered" },
    "cancelled": { color: "bg-red-100 text-red-800", label: "Cancelled" }
  };

  // Load order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        // In a real implementation, we would fetch from the backend
        // For now, we'll use mock data
        setTimeout(() => {
          setOrder({
            id: parseInt(orderId || "1"),
            orderNumber: `ORD-${1000 + parseInt(orderId || "1")}`,
            status: "processing",
            createdAt: new Date(Date.now() - 3600000 * 24 * 2),
            updatedAt: new Date(Date.now() - 3600000 * 24 * 1),
            estimatedDelivery: new Date(Date.now() + 3600000 * 24 * 2),
            totalAmount: 56.50,
            items: [
              { id: 1, name: "Custom Chocolate Cake", quantity: 1, price: 45.50, isCustomCake: true },
              { id: 2, name: "Delivery", quantity: 1, price: 11.00 }
            ],
            baker: {
              id: 2,
              name: "Sarah Baker",
              role: "junior_baker"
            },
            shippingAddress: {
              street: "123 Main St",
              city: "Bakersville",
              state: "CA",
              zip: "94123"
            },
            paymentMethod: "Credit Card (ending in 4242)",
            hasUnreadMessages: true
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <AppLayout showSidebar sidebarType="customer">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout showSidebar sidebarType="customer">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Link href="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showSidebar sidebarType="customer">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/orders">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={orderStatusMap[order.status]?.color || "bg-gray-100 text-gray-800"}>
            {orderStatusMap[order.status]?.label || "Unknown Status"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-16 w-16 rounded-md bg-muted mr-4 flex items-center justify-center">
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
                          {item.isCustomCake && (
                            <div className="mt-1">
                              <Link href={`/cake-builder?orderId=${order.id}`}>
                                <Button variant="link" className="h-auto p-0 text-primary">View Details</Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(order.totalAmount - 11.00)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{formatCurrency(11.00)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Baker Information */}
            {order.baker && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Your Baker</CardTitle>
                  <CardDescription>
                    This talented baker is preparing your order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-white">
                        {order.baker.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="font-medium">{order.baker.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.baker.role === "junior_baker" ? "Junior Baker" : "Master Baker"}
                      </p>
                    </div>
                    <Link href={`/chat/${order.id}`} className="ml-auto">
                      <Button variant={order.hasUnreadMessages ? "default" : "outline"}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {order.hasUnreadMessages ? "New Messages" : "Chat with Baker"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    Estimated Delivery
                  </h3>
                  <p>
                    {order.estimatedDelivery 
                      ? new Date(order.estimatedDelivery).toLocaleDateString()
                      : "To be determined"}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    Order Date
                  </h3>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                    Payment Method
                  </h3>
                  <p>{order.paymentMethod || "Not specified"}</p>
                </div>
                
                {order.shippingAddress && (
                  <div>
                    <h3 className="font-medium flex items-center mb-2">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      Shipping Address
                    </h3>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                    </p>
                  </div>
                )}

                <div className="pt-4">
                  <Link href={`/chat/${order.id}`}>
                    <Button className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat with Baker
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default OrderDetailPage;