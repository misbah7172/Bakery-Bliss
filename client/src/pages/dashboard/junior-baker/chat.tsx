import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, Package } from "lucide-react";
import ChatComponent from "@/components/ui/chat-simple";

interface AssignedOrder {
  id: number;
  orderNumber: string;
  status: string;
  customerName: string;
  items: any[];
  total: number;
  createdAt: string;
}

const JuniorBakerChat = () => {
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Get order ID from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderParam = urlParams.get('order');
    if (orderParam) {
      setSelectedOrderId(parseInt(orderParam));
    }
  }, []);

  // Role-based access control
  if (user && user.role !== 'junior_baker') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <Button onClick={() => window.location.href = '/dashboard'}>Go to Your Dashboard</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Fetch assigned orders that have chat enabled
  const { data: assignedOrders = [], isLoading } = useQuery<AssignedOrder[]>({
    queryKey: ["/api/junior-baker/assigned-orders"],
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'quality_check': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canChat = (order: AssignedOrder) => {
    // Can chat if order is being processed
    return ['processing', 'quality_check', 'ready'].includes(order.status.toLowerCase());
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading your assigned orders...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Chat</h1>
          <p className="text-gray-600">
            Chat with customers and main bakers about your assigned orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Orders List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Assigned Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No assigned orders</p>
                    <p className="text-sm text-gray-400">Orders will appear here when assigned to you</p>
                  </div>
                ) : (
                  assignedOrders.map((order) => (
                    <Card 
                      key={order.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOrderId === order.id ? 'ring-2 ring-primary' : ''
                      } ${!canChat(order) ? 'opacity-60' : ''}`}
                      onClick={() => canChat(order) && setSelectedOrderId(order.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{order.orderNumber}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Customer: {order.customerName}
                        </p>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {order.items?.length || 0} item(s) • ${order.total?.toFixed(2) || '0.00'}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          {canChat(order) ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-xs">Chat available</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span className="text-xs">
                                {order.status === 'pending' ? 'Not started yet' : 'Chat not available'}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedOrderId ? (
              <div className="h-[600px]">
                <ChatComponent orderId={selectedOrderId} />
              </div>
            ) : (
              <Card className="h-[600px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select an Order to Chat
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      Choose an assigned order from the list to start or continue a conversation 
                      with the customer and main baker.
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

export default JuniorBakerChat;
