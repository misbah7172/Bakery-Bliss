import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Package, CheckCircle, AlertTriangle, Loader2, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  orderId: string;
  status: string;
  totalAmount: number;
  deadline: string;
  createdAt: string;
  userId: number;
  userName: string;
  userEmail: string;
  items: Array<{
    id: number;
    productName?: string;
    customCakeName?: string;
    quantity: number;
    pricePerItem: number;
  }>;
  shippingInfo?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

const JuniorBakerTasks = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  // Define possible status transitions and their display info
  const statusTransitions: Record<string, {
    nextStatus: string;
    buttonText: string;
    buttonColor: string;
  }> = {
    'pending': {
      nextStatus: 'processing',
      buttonText: 'Start Baking',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    'processing': {
      nextStatus: 'quality_check',
      buttonText: 'Ready for Quality Check',
      buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    'quality_check': {
      nextStatus: 'ready',
      buttonText: 'Mark as Ready',
      buttonColor: 'bg-green-600 hover:bg-green-700 text-white'
    }
  };

  // Mutation for updating order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      apiRequest(`/api/orders/${orderId}/status`, "PATCH", { status }),
    onSuccess: (data, variables) => {
      toast({
        title: "Status Updated",
        description: `Order has been updated to ${variables.status.replace('_', ' ')}`,
      });
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["/api/junior-baker/tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating order status:", error);
    },
    onSettled: () => {
      setUpdatingOrderId(null);
    }
  });

  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined, fallback: string = 'Not set') => {
    if (!dateString) return fallback;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return fallback;
      return format(date, 'PPp');
    } catch {
      return fallback;
    }
  };

  // Handle navigation in useEffect to avoid setState during render
  useEffect(() => {
    if (!user || user.role !== "junior_baker") {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Show loading or redirect states
  if (!user || user.role !== "junior_baker") {
    return null; // useEffect will handle navigation
  }
  // Fetch assigned tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/junior-baker/tasks"],
    enabled: !!user && user.role === "junior_baker",
  });
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'quality_check': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'quality_check': return <AlertTriangle className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading your tasks...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tasks</h1>
          <p className="text-gray-600 mb-4">
            Manage your assigned baking tasks and track your progress.
          </p>
          
          {/* Status Summary */}
          {tasks.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="text-lg font-bold text-yellow-800">
                  {tasks.filter(t => t.status === 'pending').length}
                </div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-blue-800">
                  {tasks.filter(t => t.status === 'processing').length}
                </div>
                <div className="text-sm text-blue-600">In Progress</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="text-lg font-bold text-purple-800">
                  {tasks.filter(t => t.status === 'quality_check').length}
                </div>
                <div className="text-sm text-purple-600">Quality Check</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-lg font-bold text-green-800">
                  {tasks.filter(t => ['ready', 'delivered'].includes(t.status)).length}
                </div>
                <div className="text-sm text-green-600">Ready/Delivered</div>
              </div>
            </div>
          )}
        </div>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Assigned</h3>
                <p className="text-gray-500">
                  You don't have any tasks assigned at the moment. Check back later or contact your main baker.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order {task.orderId}</CardTitle>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1">{task.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatCurrency(task.totalAmount)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Customer:</p>
                      <p className="text-sm text-gray-600">{task.userName}</p>
                      <p className="text-xs text-gray-500">{task.userEmail}</p>
                    </div>                    <div>
                      <p className="text-sm font-medium text-gray-900">Due Date:</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(task.deadline, 'No deadline set')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Date:</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(task.createdAt, 'Unknown date')}
                      </p>
                    </div>
                    
                    {task.items && task.items.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Items:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {task.items.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span>{item.productName || item.customCakeName}</span>
                              <span>x{item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {task.shippingInfo && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Delivery To:</p>
                        <p className="text-sm text-gray-600">
                          {task.shippingInfo.fullName}<br />
                          {task.shippingInfo.address}<br />
                          {task.shippingInfo.city}, {task.shippingInfo.state} {task.shippingInfo.zipCode}
                        </p>
                      </div>
                    )}
                  </div>                  <div className="mt-4 pt-4 border-t space-y-2">
                    {/* Status Update Button - only show if there's a next status available */}
                    {statusTransitions[task.status] && (
                      <Button 
                        className={`w-full ${statusTransitions[task.status].buttonColor}`}
                        onClick={() => handleUpdateStatus(task.id, statusTransitions[task.status].nextStatus)}
                        disabled={updatingOrderId === task.id}
                      >
                        {updatingOrderId === task.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          statusTransitions[task.status].buttonText
                        )}
                      </Button>
                    )}
                    
                    {/* Show status completion message for final statuses */}
                    {!statusTransitions[task.status] && ['ready', 'delivered'].includes(task.status) && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">
                            {task.status === 'ready' ? 'Order is ready for pickup/delivery' : 'Order has been delivered'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {/* Chat with Customer Button */}
                      <Button 
                        variant="outline"
                        className="flex-1" 
                        onClick={() => navigate(`/dashboard/junior-baker/chat?order=${task.id}`)}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat with Customer
                      </Button>
                      
                      {/* View Details Button */}
                      <Button 
                        variant="outline"
                        className="flex-1" 
                        onClick={() => window.location.href = `/order-detail/${task.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default JuniorBakerTasks;
