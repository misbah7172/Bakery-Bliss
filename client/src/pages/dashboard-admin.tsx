import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AppLayout from "@/components/layouts/AppLayout";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  Plus,
  UserCheck,
  UserX,
  ChefHat,
  Crown,
  Shield,
  Sparkles,
  Star,
  Settings,
  Loader2,
  FileText,
  Calendar,
  Mail,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  newUsersThisMonth: number;
  recentOrders: any[];
  recentUsers: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  // Redirect if not authenticated or not admin
  if (!user) {
    navigate("/");
    return null;
  }
  
  if (user.role !== 'admin') {
    navigate("/");
    return null;
  }

  // Get admin stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.role === "admin"
  });
  // Get all users for management
  const { data: allUsers, isLoading: usersLoading, error: usersError } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
    retry: 1
  });

  // Get all products for management
  const { data: allProducts, isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/products"],
    enabled: user?.role === "admin"
  });

  // Get all orders for management
  const { data: allOrders, isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/orders"],
    enabled: user?.role === "admin"
  });

  // Get baker applications
  const { data: applications, isLoading: applicationsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/baker-applications"],
    enabled: user?.role === "admin"
  });

  // Mutation to delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest(`/api/admin/users/${userId}`, "DELETE");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  });

  // Mutation to approve baker application
  const approveApplicationMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      const response = await apiRequest(`/api/admin/baker-applications/${applicationId}/approve`, "PATCH");
      return response;
    },
    onSuccess: (data, applicationId) => {
      console.log("Approve mutation successful for application:", applicationId);
      // Force refetch of applications data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/baker-applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      
      // Also refetch immediately to ensure UI updates
      queryClient.refetchQueries({ queryKey: ["/api/admin/baker-applications"] });
      
      toast({
        title: "Success",
        description: "Application approved successfully",
      });
    },
    onError: (error: any, applicationId) => {
      console.error("Approve mutation failed for application:", applicationId, error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve application",
        variant: "destructive",
      });
    }
  });

  // Mutation to reject baker application
  const rejectApplicationMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      const response = await apiRequest(`/api/admin/baker-applications/${applicationId}/reject`, "PATCH");
      return response;
    },
    onSuccess: (data, applicationId) => {
      console.log("Reject mutation successful for application:", applicationId);
      // Force refetch of applications data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/baker-applications"] });
      
      // Also refetch immediately to ensure UI updates
      queryClient.refetchQueries({ queryKey: ["/api/admin/baker-applications"] });
      
      toast({
        title: "Success", 
        description: "Application rejected",
      });
    },
    onError: (error: any, applicationId) => {
      console.error("Reject mutation failed for application:", applicationId, error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject application",
        variant: "destructive",
      });
    }
  });

  // Mutation to delete product
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest(`/api/admin/products/${productId}`, "DELETE");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  });

  const handleDeleteUser = (userId: number, userName: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleApproveApplication = (applicationId: number) => {
    if (approveApplicationMutation.isPending) {
      console.log("Approval already in progress, ignoring duplicate click");
      return;
    }
    console.log("Starting approval for application:", applicationId);
    approveApplicationMutation.mutate(applicationId);
  };

  const handleRejectApplication = (applicationId: number) => {
    if (rejectApplicationMutation.isPending) {
      console.log("Rejection already in progress, ignoring duplicate click");
      return;
    }
    console.log("Starting rejection for application:", applicationId);
    rejectApplicationMutation.mutate(applicationId);
  };

  const handleDeleteProduct = (productId: number, productName: string) => {
    deleteProductMutation.mutate(productId);
  };

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }
  return (
    <AppLayout showSidebar sidebarType="admin">
      {/* Bakery-themed Hero Section */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 right-8 animate-bounce delay-100">
            <Crown className="w-6 h-6 text-yellow-400 opacity-60" />
          </div>
          <div className="absolute bottom-6 left-12 animate-bounce delay-300">
            <Shield className="w-5 h-5 text-blue-400 opacity-50" />
          </div>
          <div className="absolute top-8 left-1/4 animate-bounce delay-500">
            <Star className="w-4 h-4 text-purple-400 opacity-70" />
          </div>
        </div>
        
        <div className="relative z-10 px-8 py-12">
          <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Settings className="w-5 h-5 text-purple-600" />
            <span className="text-gray-700 font-medium">Admin Control Center</span>
          </div>
          
          <h1 className="font-poppins font-bold text-3xl md:text-4xl mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Bakery Bliss Command Center
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your sweet empire with precision and care 👑
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Total Users</CardTitle>
                <div className="bg-purple-500/20 p-2 rounded-full">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-800">
                  {statsLoading ? "..." : stats?.totalUsers || 0}
                </div>
                <p className="text-xs text-purple-600">
                  +{stats?.newUsersThisMonth || 0} this month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Products</CardTitle>
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800">
                  {statsLoading ? "..." : stats?.totalProducts || 0}
                </div>
                <p className="text-xs text-blue-600">
                  Active products
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Orders</CardTitle>
                <div className="bg-green-500/20 p-2 rounded-full">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800">
                  {statsLoading ? "..." : stats?.totalOrders || 0}
                </div>
                <p className="text-xs text-green-600">
                  {stats?.pendingOrders || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Total Revenue</CardTitle>
                <div className="bg-amber-500/20 p-2 rounded-full">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800">
                  {statsLoading ? "..." : formatCurrency(stats?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-amber-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  All time earnings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statsLoading ? (
                    <div>Loading...</div>
                  ) : stats?.recentOrders?.length ? (
                    stats.recentOrders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{order.orderId}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                          <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No recent orders</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Newest registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statsLoading ? (
                    <div>Loading...</div>
                  ) : stats?.recentUsers?.length ? (
                    stats.recentUsers.slice(0, 5).map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{user.role}</Badge>
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No recent users</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div>Loading users...</div>
              ) : (
                <div className="space-y-4">
                  {allUsers?.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {user.role !== 'admin' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.fullName)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )) || <p>No users found. Debug info: {JSON.stringify({ allUsers, usersError, userRole: user?.role })}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Product Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Products</CardTitle>
              <CardDescription>Manage your bakery products</CardDescription>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div>Loading products...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allProducts?.map((product: any) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                      <p className="font-bold">{formatCurrency(product.price)}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={product.inStock ? 'default' : 'destructive'}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                        {product.isBestSeller && <Badge variant="secondary">Best Seller</Badge>}
                        {product.isNew && <Badge variant="outline">New</Badge>}
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          disabled={deleteProductMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) || <p>No products found</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <h2 className="text-2xl font-bold">Order Management</h2>

          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>View and manage all customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div>Loading orders...</div>
              ) : (
                <div className="space-y-4">
                  {allOrders?.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.orderId}</p>
                        <p className="text-sm text-muted-foreground">
                          Customer: {order.user?.fullName || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                        <Badge 
                          variant={
                            order.status === 'pending' ? 'secondary' :
                            order.status === 'delivered' ? 'default' :
                            order.status === 'cancelled' ? 'destructive' : 'outline'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) || <p>No orders found</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <h2 className="text-2xl font-bold">Baker Promotion Applications</h2>

          <Card>
            <CardHeader>
              <CardTitle>Junior Baker → Main Baker Promotions</CardTitle>
              <CardDescription>Review junior baker applications for main baker promotion (customer → junior baker applications are handled by main bakers)</CardDescription>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  Loading applications...
                </div>
              ) : (
                <div className="space-y-4">
                  {applications?.length ? applications.map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{app.applicantName || 'Unknown'}</h3>
                          <Badge variant="outline">{app.currentRole} → {app.requestedRole}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{app.email || 'No email'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>@{app.username || 'No username'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-sm mt-2 text-gray-600 line-clamp-2">{app.reason}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Baker Application Details</DialogTitle>
                              <DialogDescription>
                                Review the full application from {app.applicantName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Applicant Name</label>
                                  <p className="text-sm text-gray-600">{app.applicantName || 'Unknown'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <p className="text-sm text-gray-600">{app.email || 'No email'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Username</label>
                                  <p className="text-sm text-gray-600">@{app.username || 'No username'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Role Transition</label>
                                  <p className="text-sm text-gray-600">{app.currentRole} → {app.requestedRole}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Application Date</label>
                                  <p className="text-sm text-gray-600">{new Date(app.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <Badge className="text-sm">{app.status}</Badge>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Application Motivation</label>
                                <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                                  <p className="text-sm whitespace-pre-wrap">{app.reason}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              disabled={approveApplicationMutation.isPending}
                            >
                              {approveApplicationMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <UserCheck className="h-4 w-4 mr-2" />
                              )}
                              Approve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approve Baker Application</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve the baker application for "{app.applicantName}"? 
                                This will promote them from {app.currentRole} to {app.requestedRole}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleApproveApplication(app.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              disabled={rejectApplicationMutation.isPending}
                            >
                              {rejectApplicationMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <UserX className="h-4 w-4 mr-2" />
                              )}
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Baker Application</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject the baker application for "{app.applicantName}"? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRejectApplication(app.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending applications</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
}