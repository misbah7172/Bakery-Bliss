import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSimpleChat } from "@/hooks/use-chat-simple";
import { Send, Loader2 } from "lucide-react";

interface ChatComponentProps {
  orderId: number;
  receiverId?: number;
}

const ChatComponent = ({ orderId, receiverId }: ChatComponentProps) => {
  const { messages, sendMessage, isLoading, isSending } = useSimpleChat(orderId);
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
      sendMessage(message, receiverId);  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(e);
    }
  };
  
  const formatTime = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (isLoading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-lg">Team Chat</CardTitle>
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
        <CardTitle className="text-lg">Team Chat</CardTitle>
      </CardHeader>
      
      <CardContent 
        className="flex-grow p-4 overflow-y-auto space-y-4 custom-scrollbar" 
        ref={chatContainerRef}
        style={{ maxHeight: "400px" }}
      >
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-foreground/50">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
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
        <form onSubmit={handleSendMessage} className="flex w-full">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
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
