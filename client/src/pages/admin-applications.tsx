import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, User, Mail, MessageSquare } from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

interface BakerApplication {
  id: number;
  userId: number;
  currentRole: string;
  requestedRole: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  applicantName: string;
  applicantEmail: string;
}

export default function AdminApplicationsPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<BakerApplication | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  // Role-based access control
  if (currentUser?.role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Get all baker applications
  const { data: applications, isLoading, error } = useQuery<BakerApplication[]>({
    queryKey: ["/api/admin/baker-applications"],
    enabled: !!currentUser && currentUser.role === "admin"
  });

  // Approve application mutation
  const approveApplicationMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      return await apiRequest("PATCH", `/api/admin/baker-applications/${applicationId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/baker-applications"] });
      toast.success("Application approved successfully");
      setIsReviewDialogOpen(false);
      setSelectedApplication(null);
    },
    onError: () => {
      toast.error("Failed to approve application");
    }
  });

  // Reject application mutation
  const rejectApplicationMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      return await apiRequest("PATCH", `/api/admin/baker-applications/${applicationId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/baker-applications"] });
      toast.success("Application rejected");
      setIsReviewDialogOpen(false);
      setSelectedApplication(null);
    },
    onError: () => {
      toast.error("Failed to reject application");
    }
  });

  const handleApprove = (application: BakerApplication) => {
    approveApplicationMutation.mutate(application.id);
  };

  const handleReject = (application: BakerApplication) => {
    rejectApplicationMutation.mutate(application.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <AppLayout showSidebar sidebarType="admin">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading applications...</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout showSidebar sidebarType="admin">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">Error loading applications</div>
        </div>
      </AppLayout>
    );
  }

  const pendingApplications = applications?.filter(app => app.status === 'pending') || [];
  const reviewedApplications = applications?.filter(app => app.status !== 'pending') || [];

  return (
    <AppLayout showSidebar sidebarType="admin">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Baker Applications</h1>
            <p className="text-muted-foreground">Review and manage baker role applications</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
              {pendingApplications.length} Pending
            </Badge>
            <Badge variant="outline" className="text-gray-700 border-gray-300">
              {reviewedApplications.length} Reviewed
            </Badge>
          </div>
        </div>

        {/* Pending Applications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Applications ({pendingApplications.length})
            </CardTitle>
            <CardDescription>Applications waiting for review</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending applications
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{application.applicantName}</h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {application.applicantEmail}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-600">Current Role:</span>
                            <p className="font-medium">{getRoleDisplayName(application.currentRole)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Requested Role:</span>
                            <p className="font-medium text-primary">{getRoleDisplayName(application.requestedRole)}</p>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-sm text-gray-600">Reason:</span>
                          <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{application.reason}</p>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Applied on {formatDate(application.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setIsReviewDialogOpen(true);
                          }}
                          variant="outline"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(application)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(application)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviewed Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews ({reviewedApplications.length})</CardTitle>
            <CardDescription>Previously reviewed applications</CardDescription>
          </CardHeader>
          <CardContent>
            {reviewedApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reviewed applications
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Applicant</th>
                      <th className="text-left p-2">Role Change</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Reviewed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewedApplications.map((application) => (
                      <tr key={application.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{application.applicantName}</p>
                            <p className="text-sm text-gray-600">{application.applicantEmail}</p>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="text-sm">
                            <span className="text-gray-600">{getRoleDisplayName(application.currentRole)}</span>
                            <span className="mx-2">→</span>
                            <span className="font-medium">{getRoleDisplayName(application.requestedRole)}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          {getStatusBadge(application.status)}
                        </td>
                        <td className="p-2 text-sm text-gray-600">
                          {formatDate(application.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review Application</DialogTitle>
              <DialogDescription>
                Review application from {selectedApplication?.applicantName}
              </DialogDescription>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="py-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Application Details:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>From:</strong> {getRoleDisplayName(selectedApplication.currentRole)}</p>
                    <p><strong>To:</strong> {getRoleDisplayName(selectedApplication.requestedRole)}</p>
                    <p><strong>Reason:</strong></p>
                    <p className="p-2 bg-gray-50 rounded text-xs">{selectedApplication.reason}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(selectedApplication)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedApplication)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
