import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Clock, Package, Users } from "lucide-react";
import ChatComponent from "@/components/ui/chat-simple";

interface OrderWithChat {
  id: number;
  orderNumber: string;
  status: string;
  customerName: string;
  juniorBakerName: string | null;
  items: any[];
  total: number;
  createdAt: string;
  hasActiveChat: boolean;
  unreadMessages: number;
}

const MainBakerChat = () => {
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Role-based access control
  if (user && user.role !== 'main_baker') {
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

  // Fetch orders with active chats
  const { data: ordersWithChat = [], isLoading } = useQuery<OrderWithChat[]>({
    queryKey: ["/api/main-baker/orders-with-chat"],
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

  const canMonitorChat = (order: OrderWithChat) => {
    // Can monitor chat if order has been assigned and is in progress
    return ['processing', 'quality_check', 'ready'].includes(order.status.toLowerCase()) && 
           order.juniorBakerName;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading chat conversations...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Chat Management</h1>
          <p className="text-gray-600">
            Monitor and participate in conversations between customers and junior bakers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders with Chat List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Active Conversations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ordersWithChat.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No active conversations</p>
                    <p className="text-sm text-gray-400">Conversations will appear when orders are assigned</p>
                  </div>
                ) : (
                  ordersWithChat.map((order) => (
                    <Card 
                      key={order.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOrderId === order.id ? 'ring-2 ring-primary' : ''
                      } ${!canMonitorChat(order) ? 'opacity-60' : ''}`}
                      onClick={() => canMonitorChat(order) && setSelectedOrderId(order.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{order.orderNumber}</h3>
                          <div className="flex gap-1">
                            {order.unreadMessages > 0 && (
                              <Badge className="bg-red-100 text-red-800 text-xs px-1">
                                {order.unreadMessages}
                              </Badge>
                            )}
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Customer: {order.customerName}
                          </p>
                          
                          <p className="text-sm text-gray-600">
                            Baker: {order.juniorBakerName || 'Not assigned'}
                          </p>
                          
                          <p className="text-sm text-gray-600">
                            {order.items?.length || 0} item(s) • ${order.total?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {canMonitorChat(order) ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <MessageCircle className="h-4 w-4" />
                              <span className="text-xs">
                                {order.hasActiveChat ? 'Active chat' : 'Chat available'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span className="text-xs">
                                {!order.juniorBakerName ? 'Not assigned yet' : 'Chat not available'}
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
                <div className="mb-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Chat Oversight</CardTitle>
                      <p className="text-sm text-gray-600">
                        You can monitor this conversation and step in when needed. 
                        Your messages will be visible to both the customer and junior baker.
                      </p>
                    </CardHeader>
                  </Card>
                </div>
                <div className="h-[500px]">
                  <ChatComponent orderId={selectedOrderId} />
                </div>
              </div>
            ) : (
              <Card className="h-[600px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a Conversation to Monitor
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      Choose an order conversation from the list to monitor the chat between 
                      customers and junior bakers. You can step in to help resolve issues or 
                      provide guidance when needed.
                    </p>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">As a Main Baker, you can:</h4>
                      <ul className="text-sm text-blue-800 text-left space-y-1">
                        <li>• Monitor all conversations in real-time</li>
                        <li>• Step in to resolve customer concerns</li>
                        <li>• Provide guidance to junior bakers</li>
                        <li>• Ensure quality customer service</li>
                      </ul>
                    </div>
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

export default MainBakerChat;
