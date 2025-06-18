import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSimpleChat } from "@/hooks/use-chat-simple";
import { useAuth } from "@/hooks/use-auth";
import { Send, Loader2, Users } from "lucide-react";

interface ChatComponentProps {
  orderId: number;
}

const ChatComponent = ({ orderId }: ChatComponentProps) => {
  const { user } = useAuth();
  const { 
    messages, 
    participants,
    customers,
    juniorBakers,
    mainBakers,
    sendMessage, 
    isLoading, 
    isSending 
  } = useSimpleChat(orderId);
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserRole = (userId: number) => {
    const participant = participants.find(p => p.userId === userId);
    return participant?.role || 'unknown';
  };
  
  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-lg">Order Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading messages...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order Chat</CardTitle>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">{participants.length}</span>
          </div>
        </div>
        
        {/* Participants */}
        {participants.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {participants.map((participant) => (
              <Badge 
                key={participant.id} 
                variant="outline" 
                className={getRoleColor(participant.role)}
              >
                {participant.userName} ({participant.role.replace('_', ' ')})
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent 
        className="flex-grow p-4 overflow-y-auto space-y-4" 
        ref={chatContainerRef}
        style={{ maxHeight: "400px" }}
      >
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground">No messages yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start the conversation about your order!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start ${msg.isCurrentUser ? 'justify-end' : ''}`}
            >
              {!msg.isCurrentUser && (
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                    {msg.senderName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={msg.isCurrentUser ? 'text-right' : ''}>
                <div className="flex items-center mb-1 gap-2">
                  {!msg.isCurrentUser && (
                    <>
                      <span className="text-xs font-medium text-foreground">{msg.senderName}</span>
                      <Badge variant="outline" className={`text-xs ${getRoleColor(getUserRole(msg.senderId))}`}>
                        {getUserRole(msg.senderId).replace('_', ' ')}
                      </Badge>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                </div>
                
                <div className={`px-4 py-2 rounded-lg max-w-xs ${
                  msg.isCurrentUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
              
              {msg.isCurrentUser && (
                <Avatar className="w-8 h-8 ml-2">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.fullName?.split(' ').map(n => n[0]).join('') || 'Me'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isSending}
          />
          <Button 
            type="submit"
            className="ml-2" 
            disabled={!message.trim() || isSending}
          >
            {isSending ? (
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

export default ChatComponent;
