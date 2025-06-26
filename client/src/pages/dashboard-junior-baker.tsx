import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2, 
  MessageCircle, 
  Users, 
  ChefHat, 
  Cake, 
  Clock, 
  Sparkles, 
  Star, 
  Trophy, 
  Coffee, 
  Heart,
  Award,
  Check,
  AlertCircle,
  X
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import ChatComponent from "@/components/ui/chat-simple";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import BakerEarnings from "@/components/BakerEarnings";
import PromotionApplicationForm from "@/components/PromotionApplicationForm";

interface DashboardData {
  assignedOrders?: number;
  inProgress?: number;
  completed?: number;
  upcomingTasks?: Array<{
    id: number;
    orderId: string;
    status: string;
    totalAmount: number;
    deadline: string;
    userName: string;
  }>;
}

interface JuniorBakerStats {
  totalOrdersCompleted: number;
  averageRating: number;
  qualityCheckPassed: number;
  pendingApplications: number;
  applicationStatus?: string;
}

interface Order {
  id: number;
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  deadline: string;
  userId: number;
  mainBakerId: number | null;
  juniorBakerId: number | null;
  items?: OrderItem[];
  customerName?: string;
  shippingInfo?: ShippingInfo;
}

interface OrderItem {
  id: number;
  quantity: number;
  pricePerItem: number;
  productId?: number;
  customCakeId?: number;
  customCake?: CustomCake;
  product?: Product;
}

interface CustomCake {
  id: number;
  name: string;
  layers: string;
  shape: string;
  color: string;
  sideDesign: string;
  upperDesign: string;
  pounds: number;
  designKey: string;
  message?: string;
  specialInstructions?: string;
  totalPrice: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface OrderStatus {
  [key: string]: {
    label: string;
    color: string;
    actions: {
      [key: string]: {
        label: string;
        nextStatus: string;
        color: string;
      };
    };
  };
}

const orderStatusMap: OrderStatus = {
  pending: { 
    label: "Pending", 
    color: "bg-yellow-100 text-yellow-800",
    actions: {
      start: {
        label: "Start Baking",
        nextStatus: "processing",
        color: "bg-secondary hover:bg-secondary/90"
      }
    }
  },
  processing: { 
    label: "In Progress", 
    color: "bg-blue-100 text-blue-800",
    actions: {
      complete: {
        label: "Ready for QC",
        nextStatus: "quality_check",
        color: "bg-primary hover:bg-primary/90"
      }
    }
  },
  quality_check: { 
    label: "Quality Check", 
    color: "bg-purple-100 text-purple-800",
    actions: {}
  },
  ready: { 
    label: "Ready", 
    color: "bg-green-100 text-green-800",
    actions: {}
  },
  delivered: { 
    label: "Delivered", 
    color: "bg-green-100 text-green-800",
    actions: {}
  },
  cancelled: { 
    label: "Cancelled", 
    color: "bg-red-100 text-red-800",
    actions: {}
  }
};

const JuniorBakerDashboard = () => {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  
  // Handle navigation in useEffect to avoid setState during render
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "junior_baker") {
      navigate("/");
      return;
    }
  }, [user, navigate]);
  
  // Show loading while navigation is happening
  if (!user || user.role !== "junior_baker") {
    return null; // useEffect will handle navigation
  }  // Fetch junior baker's dashboard data
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard/junior-baker'],
    enabled: !!user && user.role === "junior_baker",
  });

  // Fetch detailed orders for junior baker with custom cake information
  const { data: detailedOrders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/junior-baker-details"],
    enabled: !!user && user.role === "junior_baker"
  });

  // Update order status
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      await apiRequest(`/api/orders/${orderId}/status`, "PATCH", { status: newStatus });
      
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/junior-baker'] });
      
      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${orderStatusMap[newStatus].label}`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };
  
  if (isLoading) {
    return (
      <AppLayout showSidebar={true} sidebarType="junior">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout showSidebar={true} sidebarType="junior">
      {/* Bakery-themed Hero Section */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 via-yellow-100 to-pink-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-pink-400/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 right-8 animate-bounce delay-100">
            <Sparkles className="w-5 h-5 text-yellow-400 opacity-60" />
          </div>
          <div className="absolute bottom-6 left-12 animate-bounce delay-300">
            <Heart className="w-4 h-4 text-red-400 opacity-50" />
          </div>
          <div className="absolute top-8 left-1/4 animate-bounce delay-500">
            <Star className="w-3 h-3 text-purple-400 opacity-70" />
          </div>
        </div>
        
        <div className="relative z-10 px-8 py-12">
          <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <ChefHat className="w-4 h-4 text-orange-500" />
            <span className="text-gray-700 font-medium">Junior Baker Dashboard</span>
          </div>
          
          <h1 className="font-poppins font-bold text-3xl md:text-4xl mb-2 bg-gradient-to-r from-orange-600 via-yellow-600 to-pink-600 bg-clip-text text-transparent">
            Sweet Tasks Await! 🧁
          </h1>
          <p className="text-gray-600 text-lg">
            Your assigned baking adventures and delicious creations
          </p>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tasks List */}
        <div className="lg:w-2/3">
          {/* Task Cards */}
          <div className="space-y-6">
            {ordersLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (detailedOrders && detailedOrders.length > 0) ? (
              detailedOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-poppins font-semibold text-foreground">
                        Order #{order.orderId}
                      </h3>
                      <Badge className={orderStatusMap[order.status].color}>
                        {orderStatusMap[order.status].label}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <p className="font-medium text-foreground mb-2">
                        Customer: {order.shippingInfo?.fullName || order.customerName || 'N/A'}
                      </p>
                      <p className="text-sm text-foreground/70 mb-2">
                        Deadline: {order.deadline 
                          ? format(new Date(order.deadline), 'yyyy-MM-dd HH:mm')
                          : 'Not specified'}
                      </p>
                      <p className="text-sm text-foreground/70 mb-4">
                        Items: {order.items?.length || 0} items • Total: {formatCurrency(order.totalAmount)}
                      </p>
                      
                      {/* Show custom cake details if any */}
                      {order.items?.some(item => item.customCake) && (
                        <div className="mt-3 p-3 bg-blue-50 rounded border">
                          <p className="font-medium text-blue-800 mb-2">🎂 Custom Cake Orders:</p>
                          {order.items?.filter(item => item.customCake).map((item, index) => (
                            <div key={index} className="text-sm text-blue-700 ml-2 mb-3 last:mb-0">
                              <p className="font-semibold">{item.customCake?.name} (×{item.quantity})</p>
                              <div className="text-xs mt-1 space-y-1">
                                <p>• Layers: {item.customCake?.layers}</p>
                                <p>• Shape: {item.customCake?.shape}</p>
                                <p>• Color: {item.customCake?.color}</p>
                                <p>• Side Design: {item.customCake?.sideDesign}</p>
                                <p>• Top Design: {item.customCake?.upperDesign}</p>
                                <p>• Weight: {item.customCake?.pounds} lbs</p>
                                {item.customCake?.message && (
                                  <p>• Message: "{item.customCake.message}"</p>
                                )}
                                {item.customCake?.specialInstructions && (
                                  <p>• Special Instructions: {item.customCake.specialInstructions}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Show regular products if any */}
                      {order.items?.some(item => item.product) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded border">
                          <p className="font-medium text-gray-700 mb-2">📦 Regular Products:</p>
                          {order.items?.filter(item => item.product).map((item, index) => (
                            <div key={index} className="text-sm text-gray-600 ml-2">
                              <p>{item.product?.name} (×{item.quantity}) - {formatCurrency(item.pricePerItem)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {orderStatusMap[order.status].actions && Object.entries(orderStatusMap[order.status].actions).map(([key, action]) => (
                          <Button 
                            key={key}
                            className={action.color}
                            onClick={() => handleUpdateStatus(order.id, action.nextStatus)}
                            disabled={updatingOrderId === order.id}
                          >
                            {updatingOrderId === order.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              action.label
                            )}
                          </Button>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        {/* Chat with Customer Button */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            navigate(`/dashboard/junior-baker/chat?order=${order.id}`);
                          }}
                          className="flex items-center gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Chat
                        </Button>
                        
                        <Link href={`/dashboard/junior-baker/orders/${order.id}`}>
                          <Button variant="outline">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No orders assigned yet</p>
                <p className="text-sm">Orders assigned by main bakers will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar with Tabs */}
        <div className="lg:w-1/3">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Team Chat
              </TabsTrigger>
              <TabsTrigger value="promotion" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Promotion
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-4">
              <ChatComponent 
                orderId={detailedOrders?.[0]?.id || 0} 
              />
            </TabsContent>
            
            <TabsContent value="promotion" className="mt-4">
              <PromotionApplicationForm 
                isCompact={true}
                onApplicationSubmitted={() => {
                  // Optionally refresh data or show confirmation
                  queryClient.invalidateQueries({ queryKey: ['/api/dashboard/junior-baker'] });
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default JuniorBakerDashboard;
