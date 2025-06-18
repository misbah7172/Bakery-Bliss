import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Package, MessageCircle, Clock, Calendar, Receipt, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface OrderItem {
  id: number;
  productId: number | null;
  customCakeId: number | null;
  quantity: number;
  pricePerItem: number;
  product?: {
    id: number;
    name: string;
    imageUrl?: string;
  };
  customCake?: {
    id: number;
    name: string;
  };
}

interface Order {
  id: number;
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  deadline: string;
  userId: number;
  mainBakerId: number | null;
  juniorBakerId: number | null;
  items?: OrderItem[];
  shippingInfo?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    paymentMethod: string;
  };
}

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { user } = useAuth();

  // Fetch order details
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId && !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'quality_check': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'quality_check': return 'Quality Check';
      case 'ready': return 'Ready for Pickup';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <AppLayout showSidebar sidebarType="customer">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !order) {
    return (
      <AppLayout showSidebar sidebarType="customer">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have access to it.</p>
            <Link href="/dashboard/customer/orders">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showSidebar sidebarType="customer">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard/customer/orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Order {order.orderId}</CardTitle>
                    <CardDescription>
                      Placed on {format(new Date(order.createdAt), 'PPP')}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {item.product?.name || item.customCake?.name || `Product ${item.productId || item.customCakeId}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × {formatCurrency(item.pricePerItem)}
                            </p>
                            {item.customCake && (
                              <Badge variant="secondary" className="mt-1">
                                Custom Cake
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.pricePerItem * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No items found for this order.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(order.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                  
                  {order.status !== 'pending' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Processing Started</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(order.updatedAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium">Expected Delivery</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(order.deadline), 'PPp')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            {order.shippingInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Shipping Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{order.shippingInfo.fullName}</p>
                    <p className="text-sm text-gray-600">{order.shippingInfo.address}</p>
                    <p className="text-sm text-gray-600">
                      {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">{order.shippingInfo.phone}</p>
                    <p className="text-sm text-gray-600">{order.shippingInfo.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Info */}
            {order.shippingInfo?.paymentMethod && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm capitalize">{order.shippingInfo.paymentMethod}</p>
                </CardContent>
              </Card>
            )}

            {/* Chat Button */}
            {(order.status === 'processing' || order.status === 'quality_check') && (
              <Card>
                <CardContent className="pt-6">
                  <Link href={`/chat/${order.id}`}>
                    <Button className="w-full">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat with Baker
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default OrderDetailPage;
