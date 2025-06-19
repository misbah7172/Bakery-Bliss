import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Star, Clock, CheckCircle } from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

interface MainBaker {
  id: number;
  fullName: string;
  email: string;
  completedOrders: number;
  profileImage?: string;
  teamSize?: number; // Number of junior bakers under this main baker
}

export default function ApplyJuniorBaker() {
  const { user } = useAuth();
  const [selectedMainBakerId, setSelectedMainBakerId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only customers can apply to become junior bakers
  if (user?.role !== 'customer') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-orange-600 mb-4">Access Restricted</h1>
              <p className="text-gray-600 mb-4">Only customers can apply to become junior bakers.</p>
              <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Get all main bakers
  const { data: mainBakers, isLoading } = useQuery<MainBaker[]>({
    queryKey: ["/api/main-bakers"],
    enabled: !!user
  });

  // Check if user already has a pending application
  const { data: existingApplication } = useQuery({
    queryKey: ["/api/baker-applications/my-application"],
    enabled: !!user
  });

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: {
      mainBakerId: number;
      reason: string;
    }) => {
      return await apiRequest("POST", "/api/baker-applications", applicationData);
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setReason("");
      setSelectedMainBakerId("");
      // Refresh the page or redirect
      window.location.href = "/dashboard/customer";
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit application");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMainBakerId || !reason.trim()) {
      toast.error("Please select a main baker and provide a reason");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitApplicationMutation.mutateAsync({
        mainBakerId: parseInt(selectedMainBakerId),
        reason: reason.trim()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user already has a pending application
  if (existingApplication?.status === 'pending') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle>Application Pending</CardTitle>
              <CardDescription>
                Your application to become a junior baker is currently being reviewed
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Applied to work under:</p>
                  <p className="font-medium">{existingApplication.mainBakerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your reason:</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{existingApplication.reason}</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
              </div>
              <Button 
                className="mt-6" 
                onClick={() => window.location.href = "/dashboard/customer"}
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // If application was approved
  if (existingApplication?.status === 'approved') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Application Approved!</CardTitle>
              <CardDescription>
                Congratulations! You are now a junior baker
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">You have been approved to work as a junior baker under <strong>{existingApplication.mainBakerName}</strong>.</p>
              <Button onClick={() => window.location.href = "/dashboard/junior-baker"}>
                Go to Junior Baker Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Apply to Become a Junior Baker</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our baking team! Choose a main baker you'd like to work under and tell us why you're passionate about baking.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center">Loading main bakers...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main Bakers List */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Choose Your Main Baker</h2>
                <div className="space-y-4">
                  {mainBakers?.map((baker) => (
                    <Card 
                      key={baker.id} 
                      className={`cursor-pointer transition-all ${
                        selectedMainBakerId === baker.id.toString() 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedMainBakerId(baker.id.toString())}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{baker.fullName}</h3>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {baker.email}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                {baker.completedOrders} orders completed
                              </div>
                              <div className="text-sm text-gray-600">
                                Team: {baker.teamSize || 0} junior bakers
                              </div>
                            </div>
                          </div>
                          {selectedMainBakerId === baker.id.toString() && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Application Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Application</CardTitle>
                    <CardDescription>
                      Tell us why you want to become a junior baker
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="main-baker">Selected Main Baker</Label>
                        <Select 
                          value={selectedMainBakerId} 
                          onValueChange={setSelectedMainBakerId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a main baker" />
                          </SelectTrigger>
                          <SelectContent>
                            {mainBakers?.map((baker) => (
                              <SelectItem key={baker.id} value={baker.id.toString()}>
                                {baker.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="reason">
                          Why do you want to become a junior baker?
                        </Label>
                        <Textarea
                          id="reason"
                          placeholder="Tell us about your passion for baking, any experience you have, and why you'd like to work with this main baker..."
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={6}
                          className="mt-2"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Minimum 50 characters ({reason.length}/50)
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={!selectedMainBakerId || reason.length < 50 || isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
