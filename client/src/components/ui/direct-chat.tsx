import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2, User, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface DirectMessage {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  createdAt: string;
  senderName: string;
  senderRole: string;
  senderProfileImage?: string;
}

interface DirectChatProps {
  receiverId: number;
  receiverName: string;
  receiverRole: string;
}

const DirectChat = ({ receiverId, receiverName, receiverRole }: DirectChatProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch direct messages
  const { data: messages = [], isLoading } = useQuery<DirectMessage[]>({
    queryKey: [`/api/direct-chat/${receiverId}`],
    enabled: !!user && !!receiverId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await fetch("/api/direct-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiverId,
          message: messageText
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/direct-chat/${receiverId}`] });
      setMessage("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    }
  });
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };
  
  const formatTime = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'junior_baker': return 'bg-green-100 text-green-800';
      case 'main_baker': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'customer': return 'Customer';
      case 'junior_baker': return 'Junior Baker';
      case 'main_baker': return 'Main Baker';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading conversation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-purple-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg flex-shrink-0">
        <CardTitle className="flex items-center gap-3 text-purple-800">
          <div className="p-2 bg-purple-200 rounded-full">
            <MessageCircle className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span>Chat with {receiverName}</span>
              <Badge className={getRoleColor(receiverRole)}>
                {getRoleLabel(receiverRole)}
              </Badge>
            </div>
            <p className="text-sm text-purple-600 font-normal">Direct Communication</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <div 
          ref={chatContainerRef}
          className="h-full overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 mx-auto text-purple-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Start the conversation!</h3>
              <p className="text-gray-500">Send a message to begin your direct chat with {receiverName}.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.senderId === user?.id ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="w-8 h-8 border-2 border-purple-200">
                  <AvatarImage src={msg.senderProfileImage} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xs">
                    {msg.senderName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex flex-col max-w-xs lg:max-w-md ${msg.senderId === user?.id ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {msg.senderName}
                    </span>
                    <Badge className={`${getRoleColor(msg.senderRole)} text-xs`}>
                      {getRoleLabel(msg.senderRole)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  
                  <div className={`
                    p-3 rounded-lg shadow-sm
                    ${msg.senderId === user?.id 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-white/70 backdrop-blur-sm border border-purple-200 text-gray-800'
                    }
                  `}>
                    {msg.message}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex-shrink-0 bg-white/50 backdrop-blur-sm border-t border-purple-200">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            type="text"
            placeholder={`Send a message to ${receiverName}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sendMessageMutation.isPending}
            className="flex-1 bg-white/70 border-purple-200 focus:border-purple-400"
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default DirectChat;
