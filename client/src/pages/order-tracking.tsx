import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Package, 
  Truck, 
  CheckCircle,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Phone,
  MessageCircle,
  Star
} from "lucide-react";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewDisplay } from "@/components/ReviewDisplay";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

interface TrackingOrder {
  id: number;
  orderId: string;
  status: string;
  totalAmount: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  user: {
    fullName: string;
    email: string;
  };
  items: Array<{
    productName?: string;
    customCakeName?: string;
    quantity: number;
    pricePerItem: number;
  }>;
  shippingInfo?: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  mainBaker?: {
    fullName: string;
  };
  juniorBaker?: {
    fullName: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'processing': return 'bg-blue-500';
    case 'quality_check': return 'bg-purple-500';
    case 'ready': return 'bg-green-500';
    case 'delivered': return 'bg-gray-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <Clock className="h-4 w-4" />;
    case 'processing': return <Package className="h-4 w-4" />;
    case 'quality_check': return <CheckCircle className="h-4 w-4" />;
    case 'ready': return <Package className="h-4 w-4" />;
    case 'delivered': return <Truck className="h-4 w-4" />;
    case 'cancelled': return <CheckCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

const getStatusSteps = (currentStatus: string) => {
  const allSteps = [
    { key: 'pending', label: 'Order Placed', description: 'Your order has been received' },
    { key: 'processing', label: 'In Production', description: 'Our bakers are crafting your items' },
    { key: 'quality_check', label: 'Quality Check', description: 'Ensuring perfection before delivery' },
    { key: 'ready', label: 'Ready for Delivery', description: 'Your order is packaged and ready' },
    { key: 'delivered', label: 'Delivered', description: 'Enjoy your delicious treats!' }
  ];

  const currentIndex = allSteps.findIndex(step => step.key === currentStatus);
  
  return allSteps.map((step, index) => ({
    ...step,
    isCompleted: index <= currentIndex,
    isCurrent: index === currentIndex,
    isUpcoming: index > currentIndex
  }));
};

export default function OrderTracking() {
  const { user } = useAuth();
  const [searchOrderId, setSearchOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<TrackingOrder | null>(null);

  // Get user's orders if logged in
  const { data: userOrders, isLoading: userOrdersLoading } = useQuery<TrackingOrder[]>({
    queryKey: ["/api/orders/tracking"],
    enabled: !!user
  });

  // Search for order by ID
  const { data: searchedOrder, isLoading: searchLoading } = useQuery<TrackingOrder>({
    queryKey: ["/api/orders/track", searchOrderId],
    enabled: !!searchOrderId && searchOrderId.length > 3
  });

  const handleTrackOrder = () => {
    if (searchedOrder) {
      setSelectedOrder(searchedOrder);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const estimatedDelivery = (deadline: string) => {
    return new Date(deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Follow your delicious treats from our kitchen to your doorstep
          </p>
        </div>

        {/* Order Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track by Order ID
            </CardTitle>
            <CardDescription>
              Enter your order ID to track any order, even without an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter your order ID (e.g., ORD-123456)"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleTrackOrder}
                disabled={!searchOrderId || searchLoading}
              >
                {searchLoading ? "Searching..." : "Track Order"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User's Recent Orders */}
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Recent Orders</CardTitle>
              <CardDescription>
                Click on any order to see detailed tracking information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userOrdersLoading ? (
                <div className="text-center py-8">Loading your orders...</div>
              ) : userOrders && userOrders.length > 0 ? (
                <div className="space-y-4">
                  {userOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full text-white ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <div className="font-semibold">{order.orderId}</div>
                          <div className="text-sm text-gray-600">
                            Placed on {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={order.status === 'delivered' ? 'default' : 'secondary'}
                          className="mb-1"
                        >
                          {order.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <div className="text-sm font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No orders found. Start shopping to track your delicious treats!
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Selected Order Details */}
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedOrder.orderId}</CardTitle>
                    <CardDescription>
                      Ordered on {formatDate(selectedOrder.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={selectedOrder.status === 'delivered' ? 'default' : 'secondary'}
                    className="text-lg px-4 py-2"
                  >
                    {selectedOrder.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Progress Tracker */}
            <Card>
              <CardHeader>
                <CardTitle>Order Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getStatusSteps(selectedOrder.status).map((step, index) => (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2
                        ${step.isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : step.isCurrent
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                        }
                      `}>
                        {step.isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold ${
                          step.isCompleted || step.isCurrent ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </div>
                        <div className={`text-sm ${
                          step.isCompleted || step.isCurrent ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {item.productName || item.customCakeName}
                          </div>
                          <div className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(item.pricePerItem * item.quantity)}
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <Calendar className="h-4 w-4" />
                      Estimated Delivery: {estimatedDelivery(selectedOrder.deadline)}
                    </div>
                    
                    {selectedOrder.shippingInfo && (
                      <div className="space-y-2">
                        <div className="font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {selectedOrder.shippingInfo.fullName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedOrder.shippingInfo.address}<br />
                          {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.postalCode}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          {selectedOrder.shippingInfo.phone}
                        </div>
                      </div>
                    )}

                    {selectedOrder.juniorBaker && (
                      <div className="pt-4 border-t">
                        <div className="text-sm text-gray-600 mb-1">Your Baker:</div>
                        <div className="font-semibold">{selectedOrder.juniorBaker.fullName}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    Contact Support
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Chat with Baker
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Questions about your order? We're here to help!
                </p>
              </CardContent>
            </Card>

            {/* Reviews Section - Only show for delivered orders */}
            {selectedOrder.status === 'delivered' && (
              <div className="space-y-6">
                {/* Customer Review Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Share Your Experience
                    </CardTitle>
                    <CardDescription>
                      How was your order? Your feedback helps us improve our service.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReviewForm 
                      orderId={selectedOrder.id}
                      onSuccess={() => {
                        // Optionally refresh the order data or show success message
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Display existing reviews for this order */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewDisplay orderId={selectedOrder.id} />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}