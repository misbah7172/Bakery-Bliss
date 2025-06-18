import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, Clock, Star, Package, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface QualityCheckOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  juniorBakerName: string;
  items: string[];
  total: number;
  submittedAt: string;
  notes: string;
  images: string[];
  priority: 'low' | 'medium' | 'high';
}

const MainBakerQuality = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<QualityCheckOrder | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Role-based access control
  if (user && user.role !== 'main_baker') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <Button onClick={() => window.location.href = '/dashboard'}>Go to Your Dashboard</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Fetch orders awaiting quality check
  const { data: qualityCheckOrders = [], isLoading } = useQuery<QualityCheckOrder[]>({
    queryKey: ["/api/main-baker/quality-check"],
    enabled: !!user,
  });

  // Approve order mutation
  const approveOrderMutation = useMutation({
    mutationFn: async ({ orderId, feedback }: { orderId: number; feedback: string }) => {
      const response = await fetch(`/api/orders/${orderId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, status: 'ready' }),
      });
      if (!response.ok) throw new Error('Failed to approve order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/main-baker/quality-check"] });
      toast.success("Order approved successfully!");
      setSelectedOrder(null);
      setFeedback("");
    },
    onError: () => {
      toast.error("Failed to approve order");
    }
  });

  // Reject order mutation
  const rejectOrderMutation = useMutation({
    mutationFn: async ({ orderId, feedback }: { orderId: number; feedback: string }) => {
      const response = await fetch(`/api/orders/${orderId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, status: 'processing' }),
      });
      if (!response.ok) throw new Error('Failed to reject order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/main-baker/quality-check"] });
      toast.success("Order sent back for revision");
      setSelectedOrder(null);
      setFeedback("");
    },
    onError: () => {
      toast.error("Failed to reject order");
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    approveOrderMutation.mutate({ 
      orderId: selectedOrder.id, 
      feedback: feedback || "Order approved - meets quality standards" 
    });
    setIsProcessing(false);
  };

  const handleReject = () => {
    if (!selectedOrder || !feedback.trim()) {
      toast.error("Please provide feedback for rejection");
      return;
    }
    setIsProcessing(true);
    rejectOrderMutation.mutate({ 
      orderId: selectedOrder.id, 
      feedback 
    });
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading quality check queue...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quality Control</h1>
          <p className="text-gray-600">
            Review completed orders before they're marked as ready for delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Awaiting Quality Check ({qualityCheckOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {qualityCheckOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No orders to review</p>
                    <p className="text-sm text-gray-400">All orders have been quality checked</p>
                  </div>
                ) : (
                  qualityCheckOrders.map((order) => (
                    <Card 
                      key={order.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{order.orderNumber}</h3>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          Customer: {order.customerName}
                        </p>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Baker: {order.juniorBakerName}
                        </p>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Submitted: {format(new Date(order.submittedAt), 'MMM dd, HH:mm')}
                        </p>
                        
                        <div className="flex items-center gap-1 text-green-600">
                          <Package className="h-4 w-4" />
                          <span className="text-xs">Ready for review</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quality Check Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Quality Check - {selectedOrder.orderNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedOrder(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Order Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Customer</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Junior Baker</p>
                      <p className="text-sm text-gray-600">{selectedOrder.juniorBakerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Value</p>
                      <p className="text-sm text-gray-600">${selectedOrder.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Submitted</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(selectedOrder.submittedAt), 'PPP')}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Order Items</p>
                    <ul className="space-y-1">
                      {selectedOrder.items.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <Package className="h-3 w-3 mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Baker Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Baker Notes</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {selectedOrder.images && selectedOrder.images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Product Images</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedOrder.images.map((image, index) => (
                          <div key={index} className="aspect-square bg-gray-200 rounded-lg">
                            <img 
                              src={image} 
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback Section */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Quality Check Feedback</p>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Add your feedback about the order quality (optional for approval, required for rejection)..."
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing || approveOrderMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {approveOrderMutation.isPending ? "Approving..." : "Approve Order"}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={isProcessing || rejectOrderMutation.isPending || !feedback.trim()}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {rejectOrderMutation.isPending ? "Rejecting..." : "Send Back for Revision"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px]">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select an Order to Review
                    </h3>
                    <p className="text-gray-500 max-w-md">
                      Choose an order from the list to perform quality control review. 
                      You can approve orders or send them back for revision.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MainBakerQuality;
