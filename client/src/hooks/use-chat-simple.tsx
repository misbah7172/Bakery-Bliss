import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: number;
  orderId: number;
  senderId: number;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isCurrentUser: boolean;
  senderName: string;
}

interface ChatParticipant {
  id: number;
  orderId: number;
  userId: number;
  role: string;
  joinedAt: Date;
  lastReadAt: Date | null;
  userName: string;
}

export const useSimpleChat = (orderId: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();  // Fetch existing chat messages from database
  const { data: chatData = [], isLoading } = useQuery({
    queryKey: [`/api/chats/${orderId}`],
    enabled: !!orderId && !!user,
    staleTime: 5000, // Refetch every 5 seconds for real-time updates
  });  // Fetch chat participants
  const { data: participantsData = [] } = useQuery<ChatParticipant[]>({
    queryKey: [`/api/chats/${orderId}/participants`],
    enabled: !!orderId && !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: { orderId: number; message: string }) =>
      apiRequest("/api/chats", "POST", messageData),    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chats/${orderId}`] });
    },
  });
  // Process messages to include current user info  
  const processedMessages: ChatMessage[] = Array.isArray(chatData) 
    ? chatData.map((msg: any) => ({
        ...msg,
        isCurrentUser: msg.senderId === user?.id,
        timestamp: new Date(msg.timestamp)
      }))
    : [];

  // Debug logging
  console.log(`🔍 Chat hook for order ${orderId}:`, {
    orderId,
    userId: user?.id,
    chatDataRaw: chatData,
    processedMessages,
    participantsData,
    isLoading
  });

  const sendMessage = (message: string) => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate({
      orderId,
      message: message.trim()
    });
  };

  // Get participants by role
  const getParticipantsByRole = (role: string) => {
    return participantsData.filter(p => p.role === role);
  };

  const customers = getParticipantsByRole('customer');
  const juniorBakers = getParticipantsByRole('junior_baker');
  const mainBakers = getParticipantsByRole('main_baker');

  return {
    messages: processedMessages,
    participants: participantsData,
    customers,
    juniorBakers, 
    mainBakers,
    sendMessage,
    isLoading,
    isSending: sendMessageMutation.isPending,
    error: sendMessageMutation.error
  };
};
