import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Users, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  UserPlus,
  ChefHat,
  Calendar,
  DollarSign,
  Crown,
  Trophy,
  Star,
  Mail,
  MessageSquare
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface Order {
  id: number;
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  deadline: string;
  userId: number;
  mainBakerId: number | null;
  juniorBakerId: number | null;
  items?: any[];
  customerName?: string;
}

interface JuniorBaker {
  id: number;
  fullName: string;
  email: string;
  profileImage?: string;
  completedOrders: number;
}

interface BakerApplication {
  id: number;
  userId: number;
  currentRole: string;
  requestedRole: string;
  reason: string;
  status: string;
  createdAt: string;
  applicantName?: string;
  applicantEmail?: string;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  juniorBakers: number;
  pendingApplications: number;
  revenue: number;
}

export default function MainBakerDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Redirect if not authenticated or not a main baker
  if (!user) {
    navigate("/");
    return null;
  }
  
  if (user.role !== "main_baker") {
    navigate("/");
    return null;
  }  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedJuniorBaker, setSelectedJuniorBaker] = useState("");
  const [selectedDeadline, setSelectedDeadline] = useState("");
  const [takeOrderMyself, setTakeOrderMyself] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Fetch dashboard stats
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/main-baker"],
    enabled: !!user
  });

  // Fetch real earnings data
  const { data: earnings, isLoading: earningsLoading } = useQuery<{
    bakerId: number;
    totalEarnings: number;
    earningsBreakdown: Array<{
      orderId: number;
      amount: string;
      percentage: string;
      bakerType: string;
      createdAt: string;
      orderNumber: string;
      orderTotal: string;
    }>;
  }>({
    queryKey: ["/api/my-earnings"],
    enabled: !!user
  });

  // Fetch orders for main baker
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user
  });

  // Fetch junior bakers in the team
  const { data: juniorBakers } = useQuery<JuniorBaker[]>({
    queryKey: [`/api/users/main-baker/${user?.id}/junior-bakers`],
    enabled: !!user
  });
  // Fetch team members (junior bakers assigned to this main baker)
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: [`/api/main-baker/team`],
    enabled: !!user && user.role === 'main_baker'
  });

  // Fetch pending applications
  const { data: applications } = useQuery<BakerApplication[]>({
    queryKey: ["/api/baker-applications/main-baker"],
    enabled: !!user
  });  // Assign order to junior baker OR take order themselves mutation
  const assignOrderMutation = useMutation({
    mutationFn: async ({ orderId, juniorBakerId, takeOrderMyself, deadline }: { 
      orderId: number; 
      juniorBakerId?: number; 
      takeOrderMyself?: boolean;
      deadline?: string 
    }) => {
      const response = await fetch(`/api/orders/${orderId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ juniorBakerId, takeOrderMyself, deadline })
      });
      
      if (!response.ok) {
        throw new Error("Failed to assign order");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.takenByMainBaker) {
        toast.success("Order taken successfully! You are now working on this order directly.");
      } else {
        toast.success("Order assigned successfully! A chat has been created between the junior baker and customer.");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setIsAssignDialogOpen(false);
      setSelectedOrder(null);
      setSelectedJuniorBaker("");
      setSelectedDeadline("");
    },
    onError: () => {
      toast.error("Failed to manage order");
    }
  });

  // Handle application response mutation
  const handleApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      const response = await fetch(`/api/baker-applications/${applicationId}/main-baker-review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error("Failed to update application");
      }
      
      return response.json();
    },
    onSuccess: (_, { status }) => {
      toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'}!`);
      queryClient.invalidateQueries({ queryKey: ["/api/baker-applications/main-baker"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/main-baker/${user?.id}/junior-bakers`] });
    },
    onError: () => {
      toast.error("Failed to update application");
    }
  });
  const handleAssignOrder = (order: Order) => {
    setSelectedOrder(order);
    setTakeOrderMyself(false);
    setSelectedJuniorBaker("");
    setSelectedDeadline("");
    setIsAssignDialogOpen(true);
  };
  
  const handleConfirmAssignment = () => {
    if (!selectedOrder) {
      toast.error("No order selected");
      return;
    }

    if (!takeOrderMyself && !selectedJuniorBaker) {
      toast.error("Please select a junior baker or choose to take the order yourself");
      return;
    }

    assignOrderMutation.mutate({
      orderId: selectedOrder.id,
      juniorBakerId: takeOrderMyself ? undefined : parseInt(selectedJuniorBaker),
      takeOrderMyself: takeOrderMyself,
      deadline: selectedDeadline || undefined
    });
  };

  const handleApplication = (applicationId: number, status: string) => {
    handleApplicationMutation.mutate({ applicationId, status });
  };

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

  return (
    <AppLayout showSidebar sidebarType="main">
      {/* Bakery-themed Hero Section */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 shadow-xl mx-4">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-orange-400/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 right-8 animate-bounce delay-100">
            <Crown className="w-6 h-6 text-yellow-400 opacity-60" />
          </div>
          <div className="absolute bottom-6 left-12 animate-bounce delay-300">
            <Trophy className="w-5 h-5 text-purple-400 opacity-50" />
          </div>
          <div className="absolute top-8 left-1/4 animate-bounce delay-500">
            <Star className="w-4 h-4 text-orange-400 opacity-70" />
          </div>
        </div>
        
        <div className="relative z-10 px-8 py-12">
          <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <ChefHat className="w-5 h-5 text-purple-600" />
            <span className="text-gray-700 font-medium">Master Baker Dashboard</span>
          </div>
          
          <h1 className="font-poppins font-bold text-3xl md:text-4xl mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Welcome, Chef {user.fullName}!
          </h1>
          <p className="text-gray-600 text-lg">
            Lead your team to create culinary masterpieces 👨‍🍳
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-800">
                    ${earningsLoading ? "..." : (earnings?.totalEarnings || 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-500/20 p-2 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">This Month</p>
                  <p className="text-2xl font-bold text-blue-800">
                    ${earningsLoading ? "..." : (() => {
                      const breakdown = earnings?.earningsBreakdown || [];
                      const thisMonthEarnings = breakdown
                        .filter(item => {
                          const itemDate = new Date(item.createdAt);
                          const now = new Date();
                          return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
                        })
                        .reduce((sum, item) => sum + parseFloat(item.amount), 0);
                      return thisMonthEarnings.toFixed(2);
                    })()}
                  </p>
                </div>
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Completed Orders</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {earningsLoading ? "..." : (earnings?.earningsBreakdown?.length || 0)}
                  </p>
                </div>
                <div className="bg-purple-500/20 p-2 rounded-full">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Avg per Order</p>
                  <p className="text-2xl font-bold text-orange-800">
                    ${earningsLoading ? "..." : (() => {
                      const breakdown = earnings?.earningsBreakdown || [];
                      const totalOrders = breakdown.length;
                      const totalEarnings = earnings?.totalEarnings || 0;
                      const averageEarningsPerOrder = totalOrders > 0 ? totalEarnings / totalOrders : 0;
                      return averageEarningsPerOrder.toFixed(2);
                    })()}
                  </p>
                </div>
                <div className="bg-orange-500/20 p-2 rounded-full">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">          {/* Orders Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Orders Management
                </CardTitle>
                <CardDescription>
                  Manage orders: assign to junior bakers or work on them yourself
                </CardDescription>
              </CardHeader>              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>                ) : (
                  <div className="space-y-6">
                    {/* Orders to be assigned */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-gray-700">Pending Assignment</h4>
                      <div className="space-y-4">
                        {orders?.filter(order => order.status === 'pending' && !order.juniorBakerId).map((order) => (
                          <div key={order.id} className="border rounded-lg p-4 bg-yellow-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                                <span className="font-medium">Order {order.orderId}</span>
                              </div>
                              <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-3">
                              <p>Customer: {order.customerName || 'N/A'}</p>
                              <p>Deadline: {format(new Date(order.deadline), 'PPp')}</p>
                              <p>Items: {order.items?.length || 0} items</p>
                            </div>

                            <Button 
                              size="sm" 
                              onClick={() => handleAssignOrder(order)}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Manage Order
                            </Button>
                          </div>
                        ))}
                        
                        {orders?.filter(order => order.status === 'pending' && !order.juniorBakerId).length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No orders pending assignment
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Orders main baker is working on personally */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-gray-700">My Personal Orders</h4>
                      <div className="space-y-4">
                        {orders?.filter(order => order.status === 'processing' && !order.juniorBakerId).map((order) => (
                          <div key={order.id} className="border rounded-lg p-4 bg-blue-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Badge className="bg-blue-100 text-blue-800">
                                  Working on it
                                </Badge>
                                <span className="font-medium">Order {order.orderId}</span>
                              </div>
                              <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                            </div>
                            
                            <div className="text-sm text-gray-600 mb-3">
                              <p>Customer: {order.customerName || 'N/A'}</p>
                              <p>Deadline: {format(new Date(order.deadline), 'PPp')}</p>
                              <p>Items: {order.items?.length || 0} items</p>
                            </div>

                            <Badge variant="outline" className="bg-blue-100">
                              <ChefHat className="h-3 w-3 mr-1" />
                              Working on this personally
                            </Badge>
                          </div>
                        ))}
                        
                        {orders?.filter(order => order.status === 'processing' && !order.juniorBakerId).length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No orders currently working on personally
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Orders assigned to junior bakers */}
                    <div>
                      <h4 className="font-semibold mb-3 text-sm text-gray-700">Assigned to Junior Bakers</h4>
                      <div className="space-y-4">
                        {orders?.filter(order => order.juniorBakerId).map((order) => (
                          <div key={order.id} className="border rounded-lg p-4 bg-green-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                                <span className="font-medium">Order {order.orderId}</span>
                              </div>
                              <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
                            </div>
                              <div className="text-sm text-gray-600 mb-3">
                              <p>Customer: {order.customerName || 'N/A'}</p>
                              <p>Assigned to Junior Baker</p>
                              <p>Deadline: {format(new Date(order.deadline), 'PPp')}</p>
                            </div>

                            <Badge variant="outline" className="bg-green-100">
                              <Users className="h-3 w-3 mr-1" />
                              Assigned to Junior Baker
                            </Badge>
                          </div>
                        ))}
                        
                        {orders?.filter(order => order.juniorBakerId).length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No orders assigned to junior bakers
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>          </div>

          {/* Team & Applications */}
          <div className="space-y-6">
            {/* Junior Baker Applications */}
            {applications && applications.length > 0 && (
              <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
                  <CardTitle className="flex items-center text-purple-800">
                    <div className="p-2 bg-purple-200 rounded-full mr-3">
                      <UserPlus className="h-5 w-5 text-purple-600" />
                    </div>
                    New Applications
                    <div className="ml-auto bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      {applications.length}
                    </div>
                  </CardTitle>
                  <CardDescription className="text-purple-600">
                    🎂 Review junior baker applications from aspiring team members
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {applications.map((application) => (
                      <div key={application.id} className="bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        {/* Applicant Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {application.applicantName?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">{application.applicantName}</h3>
                              <p className="text-purple-600 text-sm flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {application.applicantEmail}
                              </p>
                            </div>
                          </div>
                          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                            ⏰ Pending Review
                          </div>
                        </div>
                        
                        {/* Application Text */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                            Why they want to join your team:
                          </h4>
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-l-4 border-purple-400">
                            <p className="text-gray-700 leading-relaxed">{application.reason}</p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button 
                            size="sm" 
                            onClick={() => handleApplication(application.id, 'approved')}
                            disabled={handleApplicationMutation.isPending}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept & Welcome to Team
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApplication(application.id, 'rejected')}
                            disabled={handleApplicationMutation.isPending}
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-300 flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline Application
                          </Button>
                        </div>
                        
                        {/* Loading State */}
                        {handleApplicationMutation.isPending && (
                          <div className="mt-3 flex items-center justify-center text-purple-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                            Processing application...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Junior Bakers Team */}
            <Card className="bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 border-teal-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-teal-100 to-blue-100 rounded-t-lg">
                <CardTitle className="flex items-center text-teal-800">
                  <div className="p-2 bg-teal-200 rounded-full mr-3">
                    <ChefHat className="h-5 w-5 text-teal-600" />
                  </div>
                  Your Dream Team
                  {juniorBakers && juniorBakers.length > 0 && (
                    <div className="ml-auto bg-teal-600 text-white text-xs px-2 py-1 rounded-full">
                      {juniorBakers.length} bakers
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="text-teal-600">
                  👨‍🍳 Junior bakers creating magic with you
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {juniorBakers && juniorBakers.length > 0 ? (
                  <div className="space-y-4">
                    {juniorBakers.map((baker) => (
                      <div key={baker.id} className="bg-white/70 backdrop-blur-sm border border-teal-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 border-2 border-teal-300 shadow-lg">
                            <AvatarImage src={baker.profileImage} />
                            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-blue-400 text-white font-bold">
                              {baker.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{baker.fullName}</h3>
                            <div className="flex items-center text-sm text-teal-600">
                              <Star className="h-3 w-3 mr-1 text-yellow-500" />
                              {baker.completedOrders} orders completed
                            </div>
                          </div>
                          <div className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-medium">
                            🏆 Active
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-200 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-teal-500" />
                    </div>
                    <h3 className="font-semibold text-gray-700 mb-2">No team members yet</h3>
                    <p className="text-gray-500 text-sm">Accept applications to build your dream team!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>        {/* Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={(open) => {
          setIsAssignDialogOpen(open);
          if (!open) {
            setSelectedOrder(null);
            setSelectedJuniorBaker("");
            setSelectedDeadline("");
            setTakeOrderMyself(false);
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Manage Order Assignment</DialogTitle>
              <DialogDescription>
                Choose how to handle order {selectedOrder?.orderId}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Option to take order myself */}
              <div className="space-y-2">
                <Label>Assignment Option</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="take-myself"
                      name="assignment-option"
                      checked={takeOrderMyself}
                      onChange={() => {
                        setTakeOrderMyself(true);
                        setSelectedJuniorBaker("");
                      }}
                      className="h-4 w-4"
                    />
                    <label htmlFor="take-myself" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Take this order myself
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="assign-junior"
                      name="assignment-option"
                      checked={!takeOrderMyself}
                      onChange={() => setTakeOrderMyself(false)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="assign-junior" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Assign to a junior baker
                    </label>
                  </div>
                </div>
              </div>

              {/* Junior Baker Selection - only show if not taking myself */}
              {!takeOrderMyself && (
                <div className="space-y-2">
                  <Label htmlFor="junior-baker">Select Junior Baker</Label>
                  <Select value={selectedJuniorBaker} onValueChange={setSelectedJuniorBaker}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a junior baker" />
                    </SelectTrigger>
                    <SelectContent>
                      {juniorBakers?.map((baker) => (
                        <SelectItem key={baker.id} value={baker.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{baker.fullName}</span>
                            <span className="text-sm text-gray-500">
                              ({baker.completedOrders} completed)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Custom Deadline (Optional)</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={selectedDeadline}
                  onChange={(e) => setSelectedDeadline(e.target.value)}
                  placeholder="Leave empty to use order deadline"
                />
              </div>
              
              {selectedOrder && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">Order Details:</p>
                  <p className="text-sm text-gray-600">
                    Order {selectedOrder.orderId} - {formatCurrency(selectedOrder.totalAmount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Current Deadline: {format(new Date(selectedOrder.deadline), 'PPp')}
                  </p>
                  {selectedDeadline && (
                    <p className="text-sm text-blue-600">
                      New Deadline: {format(new Date(selectedDeadline), 'PPp')}
                    </p>
                  )}
                </div>
              )}
            </div>
              <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAssignDialogOpen(false)}
                disabled={assignOrderMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAssignment}
                disabled={assignOrderMutation.isPending || (!takeOrderMyself && !selectedJuniorBaker)}
              >
                {assignOrderMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {takeOrderMyself ? "Take Order" : "Assign Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              My Team
            </CardTitle>
            <CardDescription>
              Junior bakers assigned to your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {juniorBakers && juniorBakers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {juniorBakers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profileImage} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.fullName}</h3>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Completed Orders:</span>
                        <span className="font-medium">{member.completedOrders || 0}</span>                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        <ChefHat className="h-3 w-3 mr-1" />
                        Junior Baker
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No junior bakers assigned yet</p>
                <p className="text-sm text-gray-500">
                  Junior bakers will appear here when they are assigned to your team
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
