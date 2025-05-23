import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from "@/hooks/use-chat";
import { Chat } from "@shared/schema";
import { Send } from "lucide-react";

interface ChatComponentProps {
  orderId: number;
  receiverId?: number;
}

const ChatComponent = ({ orderId, receiverId }: ChatComponentProps) => {
  const { chatMessages, sendMessage, loading } = useChat(orderId);
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  const handleSendMessage = () => {
    if (message.trim() && receiverId) {
      sendMessage(message, receiverId, orderId);
      setMessage("");
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-lg">Team Chat</CardTitle>
      </CardHeader>
      
      <CardContent 
        className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar" 
        ref={chatContainerRef}
        style={{ maxHeight: "400px" }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-foreground/50">No messages yet</p>
          </div>
        ) : (
          chatMessages.map((msg: Chat) => (
            <div 
              key={msg.id} 
              className={`flex items-start ${msg.isCurrentUser ? 'justify-end' : ''}`}
            >
              {!msg.isCurrentUser && (
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarFallback className="bg-secondary text-white text-xs">
                    {msg.senderName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={msg.isCurrentUser ? 'text-right' : ''}>
                <div className="flex items-center mb-1">
                  {!msg.isCurrentUser && (
                    <span className="text-xs font-medium text-foreground mr-2">{msg.senderName}</span>
                  )}
                  <span className="text-xs text-foreground/50">{formatTime(msg.timestamp)}</span>
                </div>
                
                <div className={`px-4 py-2 max-w-xs ${
                  msg.isCurrentUser 
                    ? 'chat-message-customer' 
                    : 'chat-message-baker'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
              
              {msg.isCurrentUser && (
                <Avatar className="w-8 h-8 ml-2">
                  <AvatarFallback className="bg-primary text-white text-xs">Me</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <div className="flex w-full">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-grow"
          />
          <Button 
            className="ml-2" 
            onClick={handleSendMessage}
            disabled={!message.trim() || !receiverId}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatComponent;
