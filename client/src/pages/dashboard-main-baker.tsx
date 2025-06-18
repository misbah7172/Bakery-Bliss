import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Utensils, ClipboardList, Clock, Award, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ChatComponent from "@/components/ui/chat-simple";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderStatus {
  [key: string]: {
    label: string;
    color: string;
  };
}

const orderStatusMap: OrderStatus = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800" },
  quality_check: { label: "Quality Check", color: "bg-purple-100 text-purple-800" },
  ready: { label: "Ready", color: "bg-green-100 text-green-800" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" }
};

const MainBakerDashboard = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [assigningOrderId, setAssigningOrderId] = useState<number | null>(null);
  const [selectedBakerId, setSelectedBakerId] = useState<string>("");
  
  // Role-based access control
  if (user && user.role !== 'main_baker') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access the Main Baker Dashboard.</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Your Dashboard</Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Redirect if not authenticated or not a main baker
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (user.role !== "main_baker") {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Show loading while checking authentication
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (user.role !== "main_baker") {
    return null;
  }
  
  // Fetch main baker's dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/main-baker'],
    enabled: !!user && user.role === "main_baker",
  });
  
  // Fetch junior bakers for assignment
  const { data: juniorBakers = [] } = useQuery({
    queryKey: ['/api/users/junior-bakers'],
    enabled: !!user && user.role === "main_baker",
  });
  
  // Assign order to junior baker
  const handleAssignOrder = async (orderId: number) => {
    if (!selectedBakerId) {
      toast({
        title: "Error",
        description: "Please select a baker to assign the order to",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setAssigningOrderId(orderId);
      await apiRequest("PATCH", `/api/orders/${orderId}/assign`, { 
        bakerId: parseInt(selectedBakerId)
      });
      
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/main-baker'] });
      
      toast({
        title: "Order Assigned",
        description: "Order has been assigned to the selected baker",
      });
      
      setSelectedBakerId("");
    } catch (error) {
      console.error("Error assigning order:", error);
      toast({
        title: "Error",
        description: "Failed to assign order",
        variant: "destructive",
      });
    } finally {
      setAssigningOrderId(null);
    }
  };
  
  // Mark order as quality checked
  const handleQualityCheck = async (orderId: number) => {
    try {
      await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status: "ready" });
      
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/main-baker'] });
      
      toast({
        title: "Quality Check Complete",
        description: "Order is now marked as ready for pickup/delivery",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <AppLayout showSidebar={true} sidebarType="main">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout showSidebar={true} sidebarType="main">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-poppins font-semibold text-foreground mb-2">
          Main Baker Dashboard
        </h1>
            <p className="text-foreground/70">
          Overview of orders, performance, and team chat.
        </p>
          </div>
          <Button 
            onClick={() => navigate("/dashboard/main-baker/add-product")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-poppins text-foreground/70">Incoming Orders</h3>
                <Utensils className="h-5 w-5 text-primary opacity-70" />
              </div>
              <p className="text-4xl font-poppins font-semibold text-foreground mb-2">
                {dashboardData?.incomingOrders || 0}
              </p>
              <p className="text-xs text-foreground/70">New orders in the queue.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-poppins text-foreground/70">Pending Tasks</h3>
                <ClipboardList className="h-5 w-5 text-primary opacity-70" />
              </div>
              <p className="text-4xl font-poppins font-semibold text-foreground mb-2">
                {dashboardData?.pendingTasks || 0}
              </p>
              <p className="text-xs text-foreground/70">Tasks assigned to Junior Bakers.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-poppins text-foreground/70">Avg Task Time</h3>
                <Clock className="h-5 w-5 text-primary opacity-70" />
              </div>
              <p className="text-4xl font-poppins font-semibold text-foreground mb-2">
                {dashboardData?.avgTaskTime || 0} mins
              </p>
              <p className="text-xs text-foreground/70">Average completion time for tasks.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-poppins text-foreground/70">Team Performance</h3>
                <Award className="h-5 w-5 text-primary opacity-70" />
              </div>
              <p className="text-4xl font-poppins font-semibold text-foreground mb-2">
                {dashboardData?.teamPerformance || 0}%
              </p>
              <div className="w-full bg-accent/30 rounded-full h-2 mb-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${dashboardData?.teamPerformance || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-foreground/70">Target 95%</span>
                <span className="text-foreground/70">Average task completion rate.</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Incoming Orders */}
          <div className="lg:w-2/3">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-poppins font-semibold text-foreground">Incoming Orders</h2>
                  <p className="text-sm text-foreground/70">List of orders pending assignment or start.</p>
                </div>
                
                {dashboardData?.ordersNeedingAssignment?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-accent">
                          <th className="text-left py-3 font-poppins text-sm font-medium text-foreground/70">Order ID</th>
                          <th className="text-left py-3 font-poppins text-sm font-medium text-foreground/70">Customer</th>
                          <th className="text-left py-3 font-poppins text-sm font-medium text-foreground/70">Items</th>
                          <th className="text-left py-3 font-poppins text-sm font-medium text-foreground/70">Deadline</th>
                          <th className="text-left py-3 font-poppins text-sm font-medium text-foreground/70">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.ordersNeedingAssignment.map((order: any) => (
                          <tr key={order.id} className="border-b border-accent">
                            <td className="py-4 text-sm font-medium text-foreground">{order.orderId}</td>
                            <td className="py-4 text-sm text-foreground">
                              {/* This would normally be populated with actual customer data */}
                              Customer Name
                            </td>
                            <td className="py-4 text-sm text-foreground">
                              {/* This would normally be populated with actual order items */}
                              Order items
                            </td>
                            <td className="py-4 text-sm text-foreground">
                              {order.deadline 
                                ? new Date(order.deadline).toLocaleString()
                                : 'Not specified'}
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col gap-2">
                                {order.status === "pending" && (
                                  <>
                                    <Select
                                      value={selectedBakerId}
                                      onValueChange={setSelectedBakerId}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Baker" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {juniorBakers.length > 0 ? (
                                          juniorBakers.map((baker: any) => (
                                            <SelectItem key={baker.id} value={baker.id.toString()}>
                                              {baker.fullName}
                                            </SelectItem>
                                          ))
                                        ) : (
                                          <SelectItem value="none" disabled>
                                            No bakers available
                                          </SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                    
                                    <Button 
                                      size="sm"
                                      className="bg-primary hover:bg-primary/90"
                                      onClick={() => handleAssignOrder(order.id)}
                                      disabled={!selectedBakerId || assigningOrderId === order.id}
                                    >
                                      {assigningOrderId === order.id ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Assigning...
                                        </>
                                      ) : (
                                        "Assign Baker"
                                      )}
                                    </Button>
                                  </>
                                )}
                                
                                {order.status === "quality_check" && (
                                  <Button 
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleQualityCheck(order.id)}
                                  >
                                    Approve Quality
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-foreground/70">No orders currently needing assignment.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
            {/* Team Chat */}
          <div className="lg:w-1/3">
            <ChatComponent 
              orderId={dashboardData?.ordersNeedingAssignment?.[0]?.id || 0}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MainBakerDashboard;
