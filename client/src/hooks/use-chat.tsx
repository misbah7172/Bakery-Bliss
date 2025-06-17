import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Chat } from "@shared/schema";

interface ChatMessage extends Chat {
  isCurrentUser: boolean;
  senderName?: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (orderId: number, message: string) => void;
  isConnected: boolean;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !token) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to chat server");
      setIsConnected(true);
      // Authenticate with server
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'auth_success') {
          console.log("Authenticated successfully");
        } else if (data.type === 'new_message') {
          const newMessage: ChatMessage = {
            ...data.message,
            isCurrentUser: data.message.senderId === user.id,
            senderName: data.message.senderName
          };
          
          setMessages(prev => [...prev, newMessage]);
          
          // Invalidate chat queries to refresh UI
          queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
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
  }, [user, token, queryClient]);

  const sendMessage = (orderId: number, messageText: string) => {
    if (!socket || !isConnected || !token) return;

    socket.send(JSON.stringify({
      type: 'chat_message',
      orderId: orderId.toString(),
      messageText,
      token
    }));
  };

  return (
    <ChatContext.Provider value={{
      messages,
      sendMessage,
      isConnected,
      isLoading: false
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (orderId: number) => {
  const context = useContext(ChatContext);
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  // Fetch existing chat messages from database
  const { data: chatData = [], isLoading } = useQuery({
    queryKey: ["/api/chats", orderId],
    enabled: !!orderId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { orderId: number; message: string }) =>
      apiRequest("/api/chats", "POST", messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats", orderId] });
    },
  });

  // Process messages to include current user info
  const processedMessages: ChatMessage[] = chatData.map((msg: Chat) => ({
    ...msg,
    isCurrentUser: msg.senderId === user?.id,
    senderName: msg.senderName || "Unknown"
  }));

  const sendMessage = (message: string, receiverId: number, orderId: number) => {
    if (!context.socket || !context.isConnected || !token) {
      // Fallback to REST API if WebSocket is not available
      sendMessageMutation.mutate({
        orderId,
        message
      });
      return;
    }

    // Send via WebSocket for real-time
    context.socket.send(JSON.stringify({
      type: 'chat_message',
      orderId,
      messageText: message,
      receiverId,
      token
    }));
  };

  return {
    messages: processedMessages,
    sendMessage,
    isConnected: context.isConnected,
    isLoading,
    isSending: sendMessageMutation.isPending
  };
};