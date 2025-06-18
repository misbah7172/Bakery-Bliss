import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import ChatComponent from "@/components/ui/chat-simple";

const CustomerChatPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [match, params] = useRoute("/dashboard/customer/chat/:orderId?");
  const orderId = params?.orderId;
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Fetch customer orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders/customer"],
    enabled: !!user,
  });

  useEffect(() => {
    if (orderId) {
      setSelectedOrderId(parseInt(orderId));
    } else if (orders.length > 0) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orderId, orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "quality_check": return "bg-purple-100 text-purple-800";
      case "ready": return "bg-green-100 text-green-800";
      case "delivered": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (ordersLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Chat</h1>
          <p className="text-muted-foreground">
            Communicate with your assigned bakers about your orders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No orders found
                  </p>
                ) : (
                  orders.map((order: any) => (
                    <div
                      key={order.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedOrderId === order.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Order #{order.orderNumber || `ORD-${order.id}`}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {order.juniorBaker && (
                        <p className="text-sm text-muted-foreground">
                          Baker: {order.juniorBaker.fullName}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to order details
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat */}
          <div className="lg:col-span-2">
            {selectedOrderId ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        Order #{orders.find((o: any) => o.id === selectedOrderId)?.orderNumber || `ORD-${selectedOrderId}`}
                      </CardTitle>
                      <Button variant="outline" size="sm">
                        View Order
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Chatting with your assigned baker team
                    </p>
                  </CardHeader>
                </Card>
                
                <ChatComponent orderId={selectedOrderId} />
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Select an order to start chatting with your baker
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CustomerChatPage;
