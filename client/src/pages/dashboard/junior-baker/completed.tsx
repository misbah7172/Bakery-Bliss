import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Star, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import BakerEarnings from "@/components/BakerEarnings";

interface CompletedOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  items: string[];
  total: number;
  completedAt: string;
  rating: number | null;
  feedback: string | null;
  duration: number; // hours taken to complete
}

interface EarningsBreakdown {
  orderId: number;
  amount: string;
  percentage: string;
  bakerType: string;
  createdAt: string;
  orderNumber: string;
  orderTotal: string;
}

interface EarningsData {
  bakerId: number;
  totalEarnings: number;
  earningsBreakdown: EarningsBreakdown[];
}

const JuniorBakerCompleted = () => {
  const { user } = useAuth();

  // Role-based access control
  if (user && user.role !== 'junior_baker') {
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
  }  // Fetch completed orders
  const { data: completedOrders = [], isLoading } = useQuery<CompletedOrder[]>({
    queryKey: ["/api/junior-baker/completed-orders"],
    enabled: !!user,
  });

  // Fetch earnings data to get actual earnings per order
  const { data: earnings } = useQuery<EarningsData>({
    queryKey: ["/api/my-earnings"],
    enabled: !!user,
  });

  // Create a map of order number to earnings amount for quick lookup
  const earningsMap = new Map<string, { amount: number; percentage: string }>();
  if (earnings?.earningsBreakdown) {
    earnings.earningsBreakdown.forEach(earning => {
      earningsMap.set(earning.orderNumber, {
        amount: parseFloat(earning.amount),
        percentage: earning.percentage
      });
    });
  }
  // Calculate statistics (without earnings - handled by BakerEarnings component)
  const totalOrders = completedOrders.length;
  const averageRating = completedOrders.length > 0 
    ? completedOrders.reduce((sum, order) => sum + (order.rating || 0), 0) / completedOrders.filter(order => order.rating).length 
    : 0;
  const averageCompletionTime = completedOrders.length > 0
    ? completedOrders.reduce((sum, order) => sum + order.duration, 0) / completedOrders.length
    : 0;

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400">No rating</span>;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading your completed orders...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Completed Orders</h1>
          <p className="text-gray-600">
            View your completed orders, customer feedback, and performance statistics.
          </p>
        </div>        {/* Performance Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Completion Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {averageCompletionTime > 0 ? `${averageCompletionTime.toFixed(1)}h` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card></div>

        {/* Baker Earnings Section */}
        <div className="mb-8">
          <BakerEarnings />
        </div>

        {/* Completed Orders List */}
        {completedOrders.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Orders</h3>
                <p className="text-gray-500">
                  You haven't completed any orders yet. Keep working on your assigned tasks!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Customer:</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">Completed:</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(order.completedAt), 'PPP')}
                      </div>
                    </div>                    <div>
                      <p className="text-sm font-medium text-gray-900">Duration:</p>
                      <p className="text-sm text-gray-600">{order.duration} hours</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Value:</p>
                      <p className="text-sm text-gray-600">${order.total.toFixed(2)}</p>
                    </div>

                    {/* Show actual earnings for this order */}
                    {earningsMap.has(order.orderNumber) && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center mb-1">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          <p className="text-sm font-medium text-green-800">Your Earnings:</p>
                        </div>
                        <p className="text-lg font-bold text-green-700">
                          ${earningsMap.get(order.orderNumber)!.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600">
                          {earningsMap.get(order.orderNumber)!.percentage}% of order value
                        </p>
                      </div>
                    )}
                    
                    {order.items && order.items.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Items:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {order.items.slice(0, 3).map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                          {order.items.length > 3 && (
                            <li className="text-gray-400">+{order.items.length - 3} more...</li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-900">Customer Rating:</p>
                      {renderStars(order.rating)}
                    </div>

                    {order.feedback && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Feedback:</p>
                        <p className="text-sm text-gray-600 italic">"{order.feedback}"</p>
                      </div>
                    )}
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

export default JuniorBakerCompleted;
