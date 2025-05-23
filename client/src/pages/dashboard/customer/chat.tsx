import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, ArrowLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for chat
interface ChatMessage {
  id: number;
  orderId: number;
  senderId: number;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isCurrentUser: boolean;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  mainBakerId: number;
  juniorBakerId?: number;
  customerName: string;
  juniorBakerName?: string;
}

const CustomerChatPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Load chat data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real implementation, we would fetch the order details and chat messages from backend
        
        // Mock orders with chats
        const mockOrders = [
          {
            id: 1,
            orderNumber: "ORD-1001",
            status: "processing",
            mainBakerId: 3,
            juniorBakerId: 2,
            customerName: user?.fullName || "Customer",
            juniorBakerName: "Sarah Baker"
          },
          {
            id: 2,
            orderNumber: "ORD-1002",
            status: "quality_check",
            mainBakerId: 4,
            juniorBakerId: 5,
            customerName: user?.fullName || "Customer",
            juniorBakerName: "Michael Thomas"
          }
        ];
        setOrders(mockOrders);
        
        // If orderId is provided in URL, use it; otherwise use the first order
        const orderIdToUse = orderId ? parseInt(orderId) : (mockOrders.length > 0 ? mockOrders[0].id : null);
        setSelectedOrderId(orderIdToUse);
        
        if (orderIdToUse !== null) {
          const selectedOrder = mockOrders.find(order => order.id === orderIdToUse);
          if (selectedOrder) {
            setOrderDetails(selectedOrder);
            
            // Mock chat messages for the selected order
            setTimeout(() => {
              setChatMessages([
                {
                  id: 1,
                  orderId: orderIdToUse,
                  senderId: selectedOrder.juniorBakerId || 0,
                  senderName: selectedOrder.juniorBakerName || "Baker",
                  senderRole: "junior_baker",
                  message: "Hello! I'll be preparing your order. Do you have any specific instructions or questions?",
                  timestamp: new Date(Date.now() - 3600000 * 2),
                  isRead: true,
                  isCurrentUser: false
                },
                {
                  id: 2,
                  orderId: orderIdToUse,
                  senderId: user?.id || 0,
                  senderName: user?.fullName || "Customer",
                  senderRole: "customer",
                  message: "Hi! Yes, could you make sure the cake isn't too sweet?",
                  timestamp: new Date(Date.now() - 3600000),
                  isRead: true,
                  isCurrentUser: true
                },
                {
                  id: 3,
                  orderId: orderIdToUse,
                  senderId: selectedOrder.juniorBakerId || 0,
                  senderName: selectedOrder.juniorBakerName || "Baker",
                  senderRole: "junior_baker",
                  message: "Of course! I'll reduce the sugar a bit to make it less sweet. Any other preferences?",
                  timestamp: new Date(Date.now() - 1800000),
                  isRead: true,
                  isCurrentUser: false
                }
              ]);
              setLoading(false);
            }, 800);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
        toast({
          title: "Error",
          description: "Failed to load chat messages. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, user, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedOrderId) return;
    
    setSending(true);
    try {
      // Here we would send the message to the backend
      
      const selectedOrder = orders.find(order => order.id === selectedOrderId);
      if (selectedOrder) {
        const newMessage: ChatMessage = {
          id: chatMessages.length + 1,
          orderId: selectedOrderId,
          senderId: user?.id || 0,
          senderName: user?.fullName || "Customer",
          senderRole: "customer",
          message: message.trim(),
          timestamp: new Date(),
          isRead: false,
          isCurrentUser: true
        };
        
        // Add the message to the chat
        setChatMessages(prev => [...prev, newMessage]);
        setMessage("");
        
        // Simulate a response from the baker
        setTimeout(() => {
          const response: ChatMessage = {
            id: chatMessages.length + 2,
            orderId: selectedOrderId,
            senderId: selectedOrder.juniorBakerId || 0,
            senderName: selectedOrder.juniorBakerName || "Baker",
            senderRole: "junior_baker",
            message: "Thanks for letting me know! I'll keep that in mind while preparing your order.",
            timestamp: new Date(),
            isRead: false,
            isCurrentUser: false
          };
          setChatMessages(prev => [...prev, response]);
        }, 2000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const selectOrder = (orderId: number) => {
    // Here we would redirect to the chat page for the selected order
    setSelectedOrderId(orderId);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setOrderDetails(order);
      // Fetch chat messages for this order
      // (For simplicity, we're not implementing this here)
    }
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

  if (orders.length === 0) {
    return (
      <AppLayout showSidebar sidebarType="customer">
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <Info className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-medium">No Active Orders</h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            You don't have any active orders with chat functionality.
            Place an order to start chatting with our bakers.
          </p>
          <Link href="/products">
            <Button className="mt-6">Browse Products</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showSidebar sidebarType="customer">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-14rem)]">
        {/* Order list - only on desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Recent Orders</h2>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
            {orders.map((order) => (
              <div 
                key={order.id}
                className={cn(
                  "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedOrderId === order.id && "bg-muted"
                )}
                onClick={() => selectOrder(order.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Baker: {order.juniorBakerName || "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      order.status === "processing" ? "bg-blue-100 text-blue-800" :
                      order.status === "quality_check" ? "bg-purple-100 text-purple-800" :
                      "bg-gray-100 text-gray-800"
                    )}>
                      {order.status === "processing" ? "Processing" :
                       order.status === "quality_check" ? "Quality Check" :
                       order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Chat window */}
        <div className="md:col-span-2 bg-white rounded-xl shadow overflow-hidden flex flex-col h-full">
          {/* Chat header */}
          <div className="bg-muted/50 p-4 border-b flex items-center justify-between">
            <div className="flex items-center">
              {!orderId && (
                <Link href="/dashboard/customer/orders" className="md:hidden mr-2">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <div>
                <h2 className="font-semibold">
                  {orderDetails ? `Order #${orderDetails.orderNumber}` : "Chat"}
                </h2>
                {orderDetails?.juniorBakerName && (
                  <p className="text-sm text-muted-foreground">
                    Chatting with {orderDetails.juniorBakerName}
                  </p>
                )}
              </div>
            </div>
            {orderDetails && (
              <Link href={`/dashboard/customer/orders/${orderDetails.id}`}>
                <Button variant="outline" size="sm">View Order</Button>
              </Link>
            )}
          </div>
          
          {/* Chat messages */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                <Info className="h-8 w-8 mb-2" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex",
                    msg.isCurrentUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[75%] flex gap-2",
                    msg.isCurrentUser && "flex-row-reverse"
                  )}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={msg.isCurrentUser ? "bg-primary" : "bg-secondary"}>
                        {msg.senderName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{msg.senderName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className={cn(
                        "px-4 py-2 rounded-xl",
                        msg.isCurrentUser 
                          ? "chat-message-customer" 
                          : "chat-message-baker"
                      )}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending || !selectedOrderId}
                className="flex-grow"
              />
              <Button 
                type="submit" 
                disabled={sending || !message.trim() || !selectedOrderId}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CustomerChatPage;