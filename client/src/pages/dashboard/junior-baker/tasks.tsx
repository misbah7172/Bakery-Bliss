import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Package, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: number;
  orderNumber: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  customerName: string;
  description: string;
  items: string[];
}

const JuniorBakerTasks = () => {
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
  }

  // Fetch assigned tasks
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/junior-baker/tasks"],
    enabled: !!user,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'quality_check': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Package className="h-4 w-4" />;
      case 'quality_check': return <AlertTriangle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading your tasks...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tasks</h1>
          <p className="text-gray-600">
            Manage your assigned baking tasks and track your progress.
          </p>
        </div>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Assigned</h3>
                <p className="text-gray-500">
                  You don't have any tasks assigned at the moment. Check back later or contact your main baker.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{task.orderNumber}</CardTitle>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Customer:</p>
                      <p className="text-sm text-gray-600">{task.customerName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">Due Date:</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(task.dueDate), 'PPP')}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-900">Description:</p>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    
                    {task.items && task.items.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Items:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {task.items.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button 
                      className="w-full" 
                      onClick={() => window.location.href = `/dashboard/junior-baker?orderId=${task.id}`}
                    >
                      View Details
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

export default JuniorBakerTasks;
