import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, ShoppingBag, Clock, DollarSign } from "lucide-react";
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
  
  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-semibold text-foreground">
          Welcome, {user.fullName}!
        </h1>
        <p className="text-foreground/70 mt-2">
          Manage your orders and custom creations.
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-poppins text-foreground/70 mb-2 flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2 text-primary" />
              Total Orders
            </h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-poppins font-semibold text-foreground">
                {dashboardData?.totalOrders || 0}
              </p>
              <p className="text-xs text-green-600 font-medium">
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  12% from last month
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-poppins text-foreground/70 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              Pending Orders
            </h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-poppins font-semibold text-foreground">
                {dashboardData?.pendingOrders || 0}
              </p>
              <p className="text-xs text-foreground/70">Awaiting processing</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-poppins text-foreground/70 mb-2 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-primary" />
              Lifetime Value
            </h3>
            <div className="flex items-end justify-between">
              <p className="text-4xl font-poppins font-semibold text-foreground">
                ${dashboardData?.lifetimeValue?.toFixed(2) || "0.00"}
              </p>
              <p className="text-xs text-foreground/70">Your total spending so far</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Create Something Sweet */}
      <Card className="bg-accent/30 mb-8 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-3/5 p-6">
            <h2 className="text-2xl font-poppins font-semibold text-foreground mb-2">
              Ready to Create Something Sweet?
            </h2>
            <p className="text-foreground/70 mb-6">
              Design your perfect chocolate masterpiece now!
            </p>
            <Link href="/cake-builder">
              <Button className="bg-primary hover:bg-primary/90">
                Create Your Own Cake
              </Button>
            </Link>
          </div>
          <div className="md:w-2/5">
            <img 
              src="https://pixabay.com/get/gedefcead3cb1cb55070361c7cf3dc68aeaf16446644bb4b14d4af6a2d61881aa1e9aaab824849e914ea79355c6a81922f2938938efff01f605a0077516852e90_1280.jpg" 
              alt="Custom chocolate assortment" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </Card>
      
      {/* Recent Orders */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-poppins font-semibold text-foreground">Recent Orders</h2>
            <p className="text-sm text-foreground/70">Overview of your latest Bakery Bliss orders.</p>
          </div>
          
          {dashboardData?.recentOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-accent">
                    <th className="text-left py-3 font-poppins text-sm font-medium text-foreground/70">Order ID</th>
                    <th className="text-left py-3 font-poppins text-sm font-medium text-foreground/70">Date</th>
                    <th className="text-left py-3 font-poppins text-sm font-medium text-foreground/70">Status</th>
                    <th className="text-left py-3 font-poppins text-sm font-medium text-foreground/70">Total</th>
                    <th className="text-right py-3 font-poppins text-sm font-medium text-foreground/70">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b border-accent">
                      <td className="py-4 text-sm font-medium text-foreground">{order.orderId}</td>
                      <td className="py-4 text-sm text-foreground">
                        {format(new Date(order.createdAt), 'yyyy-MM-dd')}
                      </td>
                      <td className="py-4">
                        <Badge className={orderStatusMap[order.status].color}>
                          {orderStatusMap[order.status].label}
                        </Badge>
                      </td>
                      <td className="py-4 text-sm text-foreground font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-4 text-right">
                        <Link href={`/dashboard/customer/orders/${order.id}`}>
                          <Button variant="link" className="text-primary">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-foreground/70 mb-4">You don't have any orders yet.</p>
              <Link href="/products">
                <Button className="bg-primary hover:bg-primary/90">
                  Browse Products
                </Button>
              </Link>
            </div>
          )}
          
          {dashboardData?.recentOrders?.length > 0 && (
            <div className="mt-6 text-center">
              <Link href="/dashboard/customer/orders">
                <Button variant="outline" className="text-primary">
                  View All Orders <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Apply to be a Baker */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="md:w-2/3">
              <h2 className="text-xl font-poppins font-semibold text-foreground mb-2">
                Love Baking? Join Our Team!
              </h2>
              <p className="text-foreground/70 mb-4">
                Apply to become a Junior Baker and start your journey with Bakery Bliss.
              </p>
              <Link href="/dashboard/customer/apply">
                <Button className="bg-secondary hover:bg-secondary/90">
                  Apply Now
                </Button>
              </Link>
            </div>
            <div className="md:w-1/3">
              <div className="h-32 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CustomerDashboard;
