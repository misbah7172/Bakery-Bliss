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
  DollarSign
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
  }
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedJuniorBaker, setSelectedJuniorBaker] = useState("");
  const [selectedDeadline, setSelectedDeadline] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  // Fetch dashboard stats
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/main-baker"],
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
    queryKey: ["/api/baker-applications/pending"],
    enabled: !!user
  });
  // Assign order to junior baker mutation
  const assignOrderMutation = useMutation({
    mutationFn: async ({ orderId, juniorBakerId, deadline }: { orderId: number; juniorBakerId: number; deadline?: string }) => {
      const response = await fetch(`/api/orders/${orderId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ juniorBakerId, deadline })
      });
      
      if (!response.ok) {
        throw new Error("Failed to assign order");
      }
      
      return response.json();
    },    onSuccess: () => {
      toast.success("Order assigned successfully! A chat has been created between the junior baker and customer.");
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setIsAssignDialogOpen(false);
      setSelectedOrder(null);
      setSelectedJuniorBaker("");
      setSelectedDeadline("");
    },
    onError: () => {
      toast.error("Failed to assign order");
    }
  });

  // Handle application response mutation
  const handleApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      const response = await fetch(`/api/baker-applications/${applicationId}/main-baker`, {
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
      toast.success(`Application ${status === 'accepted' ? 'accepted' : 'rejected'}!`);
      queryClient.invalidateQueries({ queryKey: ["/api/baker-applications/pending"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/main-baker/${user?.id}/junior-bakers`] });
    },
    onError: () => {
      toast.error("Failed to update application");
    }
  });

  const handleAssignOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsAssignDialogOpen(true);
  };
  const handleConfirmAssignment = () => {
    if (!selectedOrder || !selectedJuniorBaker) {
      toast.error("Please select a junior baker");
      return;
    }

    assignOrderMutation.mutate({
      orderId: selectedOrder.id,
      juniorBakerId: parseInt(selectedJuniorBaker),
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Main Baker Dashboard</h1>
          <p className="text-gray-600">Manage your team and assign orders to junior bakers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Junior Bakers</p>
                  <p className="text-2xl font-bold">{stats?.juniorBakers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats?.revenue || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Orders Management
                </CardTitle>
                <CardDescription>
                  Assign new orders to your junior bakers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders?.filter(order => order.status === 'pending' || !order.juniorBakerId).map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
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

                        {!order.juniorBakerId ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleAssignOrder(order)}
                            disabled={!juniorBakers?.length}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign to Junior Baker
                          </Button>
                        ) : (
                          <Badge variant="outline">
                            Assigned to Junior Baker
                          </Badge>
                        )}
                      </div>
                    ))}
                    
                    {orders?.filter(order => order.status === 'pending' || !order.juniorBakerId).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No pending orders to assign
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Team & Applications */}
          <div className="space-y-6">
            {/* Junior Baker Applications */}
            {applications && applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    New Applications
                  </CardTitle>
                  <CardDescription>
                    Review junior baker applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <div key={application.id} className="border rounded-lg p-4">
                        <div className="mb-3">
                          <p className="font-medium">{application.applicantName}</p>
                          <p className="text-sm text-gray-600">{application.applicantEmail}</p>
                        </div>
                        
                        <p className="text-sm mb-3">{application.reason}</p>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApplication(application.id, 'accepted')}
                            disabled={handleApplicationMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApplication(application.id, 'rejected')}
                            disabled={handleApplicationMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Junior Bakers Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChefHat className="h-5 w-5 mr-2" />
                  Your Team
                </CardTitle>
                <CardDescription>
                  Junior bakers working with you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {juniorBakers && juniorBakers.length > 0 ? (
                  <div className="space-y-3">
                    {juniorBakers.map((baker) => (
                      <div key={baker.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Avatar>
                          <AvatarImage src={baker.profileImage} />
                          <AvatarFallback>
                            {baker.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{baker.fullName}</p>
                          <p className="text-sm text-gray-600">
                            {baker.completedOrders} orders completed
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No junior bakers yet</p>
                    <p className="text-sm">Applications will appear above</p>
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
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Order to Junior Baker</DialogTitle>
              <DialogDescription>
                Select a junior baker to handle order {selectedOrder?.orderId}
              </DialogDescription>
            </DialogHeader>
              <div className="grid gap-4 py-4">
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
                disabled={assignOrderMutation.isPending || !selectedJuniorBaker}
              >
                {assignOrderMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Assign Order
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
