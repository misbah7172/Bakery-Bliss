import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Clock, AlertTriangle, CheckCircle, User } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  customerName: string;
  assignedBaker: string | null;
  items: string[];
  total: number;
  createdAt: string;
  dueDate: string;
}

const MainBakerOrders = () => {
  const { user } = useAuth();

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

  // Fetch all orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/main-baker/orders"],
    enabled: !!user,
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Package className="h-4 w-4" />;
      case 'quality_check': return <AlertTriangle className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Filter orders by status
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const processingOrders = orders.filter(order => order.status === 'processing');
  const qualityCheckOrders = orders.filter(order => order.status === 'quality_check');
  const readyOrders = orders.filter(order => order.status === 'ready');

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(order.priority)}>
              {order.priority}
            </Badge>
            <Badge className={getStatusColor(order.status)}>
              {getStatusIcon(order.status)}
              <span className="ml-1">{order.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-900">Customer:</p>
            <p className="text-sm text-gray-600">{order.customerName}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">Assigned Baker:</p>
            <div className="flex items-center">
              {order.assignedBaker ? (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1 text-blue-600" />
                  <p className="text-sm text-gray-600">{order.assignedBaker}</p>
                </div>
              ) : (
                <p className="text-sm text-red-600">Not assigned</p>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">Due Date:</p>
            <p className="text-sm text-gray-600">
              {format(new Date(order.dueDate), 'PPP')}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">Order Value:</p>
            <p className="text-sm text-gray-600">${order.total.toFixed(2)}</p>
          </div>
          
          {order.items && order.items.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900">Items:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                {order.items.slice(0, 2).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
                {order.items.length > 2 && (
                  <li className="text-gray-400">+{order.items.length - 2} more...</li>
                )}
              </ul>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button 
            className="w-full" 
            onClick={() => window.location.href = `/dashboard/main-baker?orderId=${order.id}`}
          >
            Manage Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading orders...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">
            Manage all bakery orders, assign bakers, and track progress.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-gray-900">{processingOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Quality Check</p>
                  <p className="text-2xl font-bold text-gray-900">{qualityCheckOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ready</p>
                  <p className="text-2xl font-bold text-gray-900">{readyOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders by Status */}
        <div className="space-y-8">
          {/* Pending Orders */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Orders</h2>
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No pending orders
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>

          {/* Processing Orders */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Processing Orders</h2>
            {processingOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No orders in progress
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processingOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>

          {/* Quality Check Orders */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quality Check</h2>
            {qualityCheckOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No orders in quality check
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {qualityCheckOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MainBakerOrders;
