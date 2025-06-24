import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Star, Clock, CheckCircle, ChefHat, Users, AlertCircle, ArrowLeft } from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface MainBaker {
  id: number;
  fullName: string;
  email: string;
  completedOrders: number;
  profileImage?: string;
  teamSize?: number;
  averageRating?: number;
  specialties?: string[];
}

interface ApplicationStatus {
  hasActiveApplication: boolean;
  applicationStatus?: string;
  applicationId?: number;
  mainBakerId?: number;
  mainBakerName?: string;
}

export default function CustomerApply() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedMainBakerId, setSelectedMainBakerId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only customers can apply to become junior bakers
  if (!user) {
    navigate("/login");
    return null;
  }

  if (user.role !== 'customer') {
    return (
      <AppLayout showSidebar sidebarType="customer">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-orange-600 mb-4">Access Restricted</h1>
              <p className="text-gray-600 mb-4">Only customers can apply to become junior bakers.</p>
              <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Check if user already has an active application
  const { data: applicationStatus, isLoading: statusLoading } = useQuery<ApplicationStatus>({
    queryKey: ["/api/customer/application-status"],
    enabled: !!user
  });

  // Get all main bakers
  const { data: mainBakers, isLoading: bakersLoading } = useQuery<MainBaker[]>({
    queryKey: ["/api/main-bakers"],
    enabled: !!user && !applicationStatus?.hasActiveApplication
  });

  // Submit application mutation
  const applyMutation = useMutation({
    mutationFn: async (applicationData: {
      mainBakerId: number;
      currentRole: string;
      requestedRole: string;
      reason: string;
    }) => {
      const response = await fetch("/api/baker-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(applicationData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit application");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success("Application submitted successfully! You will be notified once it's reviewed.");
      navigate("/dashboard/customer");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit application");
    }
  });

  const handleSubmit = () => {
    if (!selectedMainBakerId) {
      toast.error("Please select a main baker");
      return;
    }
    
    if (!reason.trim()) {
      toast.error("Please provide a reason for your application");
      return;
    }

    if (reason.trim().length < 50) {
      toast.error("Please provide a more detailed reason (at least 50 characters)");
      return;
    }

    setIsSubmitting(true);
    applyMutation.mutate({
      mainBakerId: parseInt(selectedMainBakerId),
      currentRole: 'customer',
      requestedRole: 'junior_baker',
      reason: reason.trim()
    });
  };

  if (statusLoading) {
    return (
      <AppLayout showSidebar sidebarType="customer">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Clock className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showSidebar sidebarType="customer">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard/customer")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Apply to Become a Junior Baker</h1>
          <p className="text-gray-600">
            Join our team of talented bakers and start your journey in professional baking
          </p>
        </div>

        {/* Check if user already has an active application */}
        {applicationStatus?.hasActiveApplication && (
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You already have an active application 
              {applicationStatus.mainBakerName && ` with ${applicationStatus.mainBakerName}`}.
              Status: <Badge className="ml-2">{applicationStatus.applicationStatus}</Badge>
              <br />
              <span className="text-sm text-gray-600 mt-2">
                Please wait for the main baker to review your application before submitting a new one.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {!applicationStatus?.hasActiveApplication && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Application Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ChefHat className="h-5 w-5 mr-2" />
                    Application Form
                  </CardTitle>
                  <CardDescription>
                    Tell us why you want to become a junior baker and choose a main baker to work with
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Baker Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="main-baker">Choose a Main Baker *</Label>
                    <Select value={selectedMainBakerId} onValueChange={setSelectedMainBakerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a main baker to work with" />
                      </SelectTrigger>
                      <SelectContent>
                        {bakersLoading ? (
                          <SelectItem value="loading" disabled>Loading main bakers...</SelectItem>
                        ) : (
                          mainBakers?.map((baker) => (
                            <SelectItem key={baker.id} value={baker.id.toString()}>
                              <div className="flex items-center justify-between w-full">
                                <span>{baker.fullName}</span>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Star className="h-3 w-3" />
                                  {baker.averageRating?.toFixed(1) || "N/A"}
                                  <span>•</span>
                                  <Users className="h-3 w-3" />
                                  {baker.teamSize || 0}
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Choose a main baker you'd like to work with. They will review your application.
                    </p>
                  </div>

                  {/* Reason */}
                  <div className="space-y-2">
                    <Label htmlFor="reason">Why do you want to become a junior baker? *</Label>
                    <Textarea
                      id="reason"
                      placeholder="Tell us about your passion for baking, any experience you have, and why you want to join our team..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Minimum 50 characters required</span>
                      <span>{reason.length}/500</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedMainBakerId || reason.length < 50}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Information Sidebar */}
            <div className="space-y-6">
              {/* What to expect */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">1. Application Review</h4>
                      <p className="text-sm text-gray-600">
                        Your chosen main baker will review your application
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Mail className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">2. Response</h4>
                      <p className="text-sm text-gray-600">
                        You'll receive a notification about the decision
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-full p-2">
                      <ChefHat className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">3. Start Baking!</h4>
                      <p className="text-sm text-gray-600">
                        If accepted, you'll join the team and start taking orders
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Active customer account</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Passion for baking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Willingness to learn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Professional commitment</span>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Main Baker Info */}
              {selectedMainBakerId && mainBakers && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Selected Main Baker</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const selectedBaker = mainBakers.find(b => b.id.toString() === selectedMainBakerId);
                      if (!selectedBaker) return null;
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 rounded-full p-2">
                              <User className="h-8 w-8 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{selectedBaker.fullName}</h4>
                              <p className="text-sm text-gray-600">{selectedBaker.email}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Completed Orders</span>
                              <p className="font-medium">{selectedBaker.completedOrders}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Team Size</span>
                              <p className="font-medium">{selectedBaker.teamSize || 0} bakers</p>
                            </div>
                            {selectedBaker.averageRating && (
                              <div className="col-span-2">
                                <span className="text-gray-500">Rating</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <p className="font-medium">{selectedBaker.averageRating.toFixed(1)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
