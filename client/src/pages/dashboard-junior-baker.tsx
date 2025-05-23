import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import ChatComponent from "@/components/ui/chat";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  
  // Redirect if not authenticated or not a junior baker
  if (!user) {
    navigate("/login");
    return null;
  }
  
  if (user.role !== "junior_baker") {
    navigate("/");
    return null;
  }
  
  // Fetch junior baker's dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/junior-baker'],
    enabled: !!user && user.role === "junior_baker",
  });
  
  // Update order status
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status: newStatus });
      
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
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-semibold text-foreground">Upcoming Tasks</h1>
        <p className="text-foreground/70 mt-1">Your assigned baking tasks and their status.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Tasks List */}
        <div className="md:w-2/3">
          {/* Task Cards */}
          <div className="space-y-6">
            {dashboardData?.upcomingTasks?.length > 0 ? (
              dashboardData.upcomingTasks.map((order: any) => (
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
                    <p className="font-medium text-foreground mb-1">
                      {/* This would typically be populated with actual order items */}
                      Items from Order #{order.orderId}
                    </p>
                    <p className="text-sm text-foreground/70 mb-4">
                      Deadline: {order.deadline 
                        ? format(new Date(order.deadline), 'yyyy-MM-dd HH:mm')
                        : 'Not specified'}
                    </p>
                    
                    <div className="flex justify-between">
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
                      <Link href={`/dashboard/junior-baker/orders/${order.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-foreground/70 mb-4">No upcoming tasks assigned to you.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Team Chat */}
        <div className="md:w-1/3">
          <ChatComponent 
            orderId={dashboardData?.upcomingTasks?.[0]?.id || 0} 
            receiverId={dashboardData?.upcomingTasks?.[0]?.userId || 0}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default JuniorBakerDashboard;
