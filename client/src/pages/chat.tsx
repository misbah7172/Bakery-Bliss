import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import { Send, MessageCircle, Clock, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

export default function Chat() {
  const { orderId } = useParams();
  const { user, token } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch order details
  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  // Fetch chat messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chats", orderId],
    enabled: !!orderId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { orderId: number; message: string }) =>
      apiRequest("/api/chats", "POST", messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats", orderId] });
    },
  });

  // WebSocket connection for real-time chat
  useEffect(() => {
    if (!user || !token || !orderId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to chat server");
      setIsConnected(true);
      // Authenticate with server
      ws.send(JSON.stringify({ 
        type: 'auth', 
        token,
        userId: user.id 
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'auth_success') {
          console.log("Chat authenticated successfully");
        } else if (data.type === 'new_message' && data.orderId === orderId) {
          // Refresh messages when new message received
          queryClient.invalidateQueries({ queryKey: ["/api/chats", orderId] });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from chat server");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [user, token, orderId, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !orderId) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    // Send via WebSocket for real-time delivery
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'chat_message',
        orderId: orderId,
        messageText,
        token
      }));
    }

    // Also save to database
    try {
      await sendMessageMutation.mutateAsync({
        orderId: parseInt(orderId),
        message: messageText
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(messageText); // Restore message on error
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
            <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Chat Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Order Chat - {order.orderId}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Status: <Badge variant="secondary">{order.status.replace('_', ' ').toUpperCase()}</Badge>
                  {isConnected && (
                    <span className="ml-4 flex items-center gap-1 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Live Chat Active
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${order.totalAmount}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chat Messages */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message: any) => {
                  const isCurrentUser = message.senderId === user?.id;
                  const senderName = message.senderName || (isCurrentUser ? user?.fullName : "Baker");
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback>
                          {getInitials(senderName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 max-w-xs ${isCurrentUser ? "text-right" : ""}`}>
                        <div className={`rounded-lg p-3 ${
                          isCurrentUser 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}>
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className="px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {!isConnected && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                Connecting to live chat...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}