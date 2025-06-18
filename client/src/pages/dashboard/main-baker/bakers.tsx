import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Clock, CheckCircle, Star, Package, Calendar } from "lucide-react";

interface JuniorBaker {
  id: number;
  fullName: string;
  email: string;
  profileImage: string | null;
  joinedAt: string;
  completedOrders: number;
  activeOrders: number;
  averageRating: number;
  totalEarnings: number;
  status: 'active' | 'busy' | 'offline';
  lastActive: string;
}

const MainBakerBakers = () => {
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

  // Fetch junior bakers under this main baker
  const { data: juniorBakers = [], isLoading } = useQuery<JuniorBaker[]>({
    queryKey: ["/api/main-baker/junior-bakers"],
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'busy': return <Clock className="h-3 w-3" />;
      case 'offline': return <User className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  const renderStars = (rating: number) => {
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
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // Calculate totals
  const totalBakers = juniorBakers.length;
  const activeBakers = juniorBakers.filter(baker => baker.status === 'active').length;
  const totalCompletedOrders = juniorBakers.reduce((sum, baker) => sum + baker.completedOrders, 0);
  const totalActiveOrders = juniorBakers.reduce((sum, baker) => sum + baker.activeOrders, 0);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading bakers...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Baker Management</h1>
          <p className="text-gray-600">
            Manage your team of junior bakers, monitor their performance, and assign orders.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bakers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBakers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Now</p>
                  <p className="text-2xl font-bold text-gray-900">{activeBakers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Orders in Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{totalActiveOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCompletedOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Baker Cards */}
        {juniorBakers.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Junior Bakers</h3>
                <p className="text-gray-500 mb-4">
                  You don't have any junior bakers in your team yet.
                </p>
                <Button onClick={() => window.location.href = '/dashboard/main-baker'}>
                  View Applications
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {juniorBakers.map((baker) => (
              <Card key={baker.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-white">
                          {baker.fullName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{baker.fullName}</CardTitle>
                        <p className="text-sm text-gray-600">{baker.email}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(baker.status)}>
                      {getStatusIcon(baker.status)}
                      <span className="ml-1 capitalize">{baker.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Active Orders</p>
                        <p className="text-lg font-bold text-blue-600">{baker.activeOrders}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Completed</p>
                        <p className="text-lg font-bold text-green-600">{baker.completedOrders}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">Average Rating</p>
                      {baker.averageRating > 0 ? (
                        renderStars(baker.averageRating)
                      ) : (
                        <p className="text-sm text-gray-400">No ratings yet</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total Earnings</p>
                      <p className="text-sm text-gray-600">${baker.totalEarnings.toFixed(2)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">Joined</p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(baker.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Active</p>
                      <p className="text-sm text-gray-600">
                        {new Date(baker.lastActive).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => window.location.href = `/dashboard/main-baker?assignTo=${baker.id}`}
                    >
                      Assign Order
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = `/dashboard/main-baker/chat?bakerId=${baker.id}`}
                    >
                      Send Message
                    </Button>
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

export default MainBakerBakers;
