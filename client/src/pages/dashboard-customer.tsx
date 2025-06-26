import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  ArrowRight, 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  Cake,
  Sparkles,
  ChefHat,
  Heart,
  Star,
  Gift,
  Crown,
  Coffee
} from "lucide-react";
import { format } from "date-fns";

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

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if not authenticated or not a customer
  if (!user) {
    navigate("/");
    return null;
  }
  
  if (user.role !== "customer") {
    navigate("/");
    return null;
  }
  
  // Fetch user's dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard/customer'],
    enabled: !!user,
  });
  
  if (isLoading) {
    return (
      <AppLayout showSidebar={true} sidebarType="customer">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout showSidebar={true} sidebarType="customer">
      {/* Bakery-themed Hero Section */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 shadow-xl">
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
            <span className="text-gray-700 font-medium">Sweet Dashboard</span>
          </div>
          
          <h1 className="font-poppins font-bold text-3xl md:text-4xl mb-2 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Welcome, {user.fullName}!
          </h1>
          <p className="text-gray-600 text-lg">
            Your delicious journey continues here 🧁
          </p>
        </div>
      </div>
      
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-pink-50 hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +12%
                </div>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {(dashboardData as any)?.totalOrders || 0}
            </p>
            <p className="text-xs text-gray-500">All your sweet purchases</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-orange-600 text-sm font-medium">
                  In Progress
                </div>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Pending Orders</h3>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {(dashboardData as any)?.pendingOrders || 0}
            </p>
            <p className="text-xs text-gray-500">Being crafted with love</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-purple-600 text-sm font-medium">
                  <Crown className="w-3 h-3 inline mr-1" />
                  VIP
                </div>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">Lifetime Value</h3>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              ${(dashboardData as any)?.lifetimeValue?.toFixed(2) || "0.00"}
            </p>
            <p className="text-xs text-gray-500">Your sweet investment</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced Create Something Sweet Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 mb-8 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 right-12 animate-pulse">
              <Cake className="w-8 h-8 text-white/30" />
            </div>
            <div className="absolute bottom-4 left-16 animate-pulse delay-300">
              <Coffee className="w-6 h-6 text-white/20" />
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center">
            <div className="md:w-3/5 p-8">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-white font-medium">Custom Creations</span>
              </div>
              
              <h2 className="text-3xl font-poppins font-bold text-white mb-3">
                Ready to Create Something Sweet?
              </h2>
              <p className="text-white/90 mb-6 text-lg">
                Design your perfect cake masterpiece with our interactive builder!
              </p>
              <Link href="/custom-cake-builder">
                <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-full transform hover:scale-105 transition-all duration-300">
                  <Cake className="w-5 h-5 mr-2" />
                  Create Your Dream Cake
                </Button>
              </Link>
            </div>
            <div className="md:w-2/5 p-4">
              <div className="w-32 h-32 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Gift className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Enhanced Recent Orders */}
      <Card className="mb-8 border-0 shadow-xl bg-white">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-poppins font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Recent Orders
              </h2>
              <p className="text-gray-600 flex items-center gap-2">
                <Cake className="w-4 h-4" />
                Your latest sweet treats and custom creations
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          
          {(dashboardData as any)?.recentOrders?.length > 0 ? (
            <div className="space-y-4">
              {(dashboardData as any).recentOrders.map((order: any) => (
                <div key={order.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Order #{order.orderId}</h3>
                        <p className="text-gray-600 text-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge className={`${orderStatusMap[order.status].color} px-4 py-2 rounded-full font-medium`}>
                        {orderStatusMap[order.status].label}
                      </Badge>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-lg">${order.totalAmount.toFixed(2)}</p>
                        <Link href={`/dashboard/customer/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 mt-1">
                            View Details <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">Start your sweet journey with us!</p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition-all duration-300">
                  <Cake className="w-5 h-5 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </div>
          )}
          
          {(dashboardData as any)?.recentOrders?.length > 0 && (
            <div className="mt-8 text-center">
              <Link href="/dashboard/customer/orders">
                <Button variant="outline" className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 px-8 py-3 rounded-full font-semibold">
                  View All Orders <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Enhanced Apply to be a Baker */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-2/3">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-2 mb-4">
                <ChefHat className="w-4 h-4" />
                <span className="font-medium">Join Our Team</span>
              </div>
              
              <h2 className="text-2xl font-poppins font-bold text-gray-800 mb-3">
                Love Baking? Join Our Sweet Team!
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                Apply to become a Junior Baker and start your delicious journey with Bakery Bliss.
              </p>
              <Link href="/dashboard/customer/apply">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 rounded-full font-semibold transform hover:scale-105 transition-all duration-300">
                  <Star className="w-5 h-5 mr-2" />
                  Apply Now
                </Button>
              </Link>
            </div>
            <div className="md:w-1/3">
              <div className="w-32 h-32 bg-gradient-to-r from-orange-200 to-pink-200 rounded-full flex items-center justify-center mx-auto">
                <ChefHat className="w-16 h-16 text-orange-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CustomerDashboard;
