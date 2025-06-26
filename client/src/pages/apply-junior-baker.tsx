import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Star, Clock, CheckCircle, ChefHat, Crown, MessageSquare } from "lucide-react";
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

interface ExistingApplication {
  id: number;
  status: string;
  mainBakerName: string;
  reason: string;
  createdAt: string;
}

export default function ApplyJuniorBaker() {
  const { user } = useAuth();
  const [selectedMainBakerId, setSelectedMainBakerId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated
  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-orange-600 mb-4">Please Log In</h1>
              <p className="text-gray-600 mb-4">You need to be logged in to apply to become a junior baker.</p>
              <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Only customers can apply to become junior bakers
  if (user.role !== 'customer') {
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
  const { data: existingApplication } = useQuery<ExistingApplication>({
    queryKey: ["/api/baker-applications/my-application"],
    enabled: !!user
  });

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: {
      mainBakerId: number;
      reason: string;
    }) => {
      const response = await apiRequest("/api/baker-applications", "POST", applicationData);
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setReason("");
      setSelectedMainBakerId("");
      // Refresh the page or redirect
      window.location.href = "/dashboard/customer";
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to submit application";
      
      // Check if it's an authentication error
      if (errorMessage.includes("401") || errorMessage.includes("Not authenticated")) {
        toast.error("Please log in to submit an application");
        // Redirect to login page
        window.location.href = "/login";
        return;
      }
      
      toast.error(errorMessage);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMainBakerId || !reason.trim()) {
      toast.error("Please select a main baker and provide a reason");
      return;
    }

    if (reason.length < 50) {
      toast.error("Please provide at least 50 characters for your reason");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting application with data:", {
        mainBakerId: parseInt(selectedMainBakerId),
        reason: reason.trim()
      });
      
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
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-yellow-200 shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-yellow-100 to-orange-100 rounded-t-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-yellow-800">Application Under Review</CardTitle>
              <CardDescription className="text-yellow-700">
                🕐 Your application to become a junior baker is currently being reviewed
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center p-8">
              <div className="space-y-6">
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700 font-medium mb-1">Applied to work under:</p>
                  <p className="font-bold text-lg text-gray-800">👨‍🍳 {existingApplication.mainBakerName}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-700 font-medium mb-2">Your application message:</p>
                  <p className="text-sm text-gray-700 italic leading-relaxed">{existingApplication.reason}</p>
                </div>
                <div className="inline-flex items-center bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full font-medium">
                  <Clock className="h-4 w-4 mr-2" />
                  Waiting for Main Baker Review
                </div>
              </div>
              <Button 
                className="mt-8 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-lg" 
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
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200 shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-t-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-800">🎉 Welcome to the Team!</CardTitle>
              <CardDescription className="text-green-700">
                Congratulations! Your application has been approved
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center p-8">
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg border border-green-200 mb-6">
                <p className="text-lg text-gray-700 mb-2">You are now a junior baker working under:</p>
                <p className="text-2xl font-bold text-green-800">👨‍🍳 {existingApplication.mainBakerName}</p>
              </div>
              <div className="inline-flex items-center bg-green-200 text-green-800 px-4 py-2 rounded-full font-medium mb-6">
                <CheckCircle className="h-4 w-4 mr-2" />
                Application Approved
              </div>
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg"
                onClick={() => window.location.href = "/dashboard/junior-baker"}
              >
                Go to Junior Baker Dashboard 🚀
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
          {/* Header Section */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-3xl opacity-30"></div>
            <div className="relative z-10 py-12">
              <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
                <ChefHat className="w-5 h-5 text-purple-600" />
                <span className="text-purple-700 font-medium">Join Our Team</span>
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Apply to Become a Junior Baker
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                🎂 Join our baking team! Choose a main baker you'd like to work under and tell us why you're passionate about baking.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center">Loading main bakers...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main Bakers List */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-200 rounded-full">
                    <Crown className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Choose Your Main Baker</h2>
                </div>
                <div className="space-y-4">
                  {mainBakers?.map((baker) => (
                    <Card 
                      key={baker.id} 
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedMainBakerId === baker.id.toString() 
                          ? 'ring-2 ring-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg transform scale-[1.02]' 
                          : 'hover:shadow-lg hover:scale-[1.01] bg-white/70 backdrop-blur-sm'
                      }`}
                      onClick={() => setSelectedMainBakerId(baker.id.toString())}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {baker.fullName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800">{baker.fullName}</h3>
                            <p className="text-sm text-purple-600 flex items-center mb-2">
                              <Mail className="h-3 w-3 mr-1" />
                              {baker.email}
                            </p>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center text-sm text-gray-600 bg-yellow-100 px-2 py-1 rounded-full">
                                <Star className="h-3 w-3 mr-1 text-yellow-500" />
                                {baker.completedOrders} orders completed
                              </div>
                              <div className="text-sm text-gray-600 bg-teal-100 px-2 py-1 rounded-full">
                                👥 Team: {baker.teamSize || 0} junior bakers
                              </div>
                            </div>
                          </div>
                          {selectedMainBakerId === baker.id.toString() && (
                            <div className="bg-purple-500 text-white p-2 rounded-full">
                              <CheckCircle className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Application Form */}
              <div>
                <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-purple-200 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
                    <CardTitle className="flex items-center text-purple-800">
                      <div className="p-2 bg-purple-200 rounded-full mr-3">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      Your Application
                    </CardTitle>
                    <CardDescription className="text-purple-600">
                      📝 Tell us why you want to become a junior baker
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="main-baker" className="text-gray-700 font-semibold">Selected Main Baker</Label>
                        <Select 
                          value={selectedMainBakerId} 
                          onValueChange={setSelectedMainBakerId}
                        >
                          <SelectTrigger className="mt-2 bg-white/70 border-purple-200">
                            <SelectValue placeholder="Choose a main baker" />
                          </SelectTrigger>
                          <SelectContent>
                            {mainBakers?.map((baker) => (
                              <SelectItem key={baker.id} value={baker.id.toString()}>
                                👨‍🍳 {baker.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="reason" className="text-gray-700 font-semibold">
                          Why do you want to become a junior baker?
                        </Label>
                        <Textarea
                          id="reason"
                          placeholder="Tell us about your passion for baking, any experience you have, and why you'd like to work with your chosen main baker... 🧁"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={6}
                          className="mt-2 bg-white/70 border-purple-200 focus:border-purple-400 resize-none"
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className={`text-sm ${reason.length >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                            {reason.length >= 50 ? '✅' : '⚠️'} Minimum 50 characters ({reason.length}/50)
                          </p>
                          <p className="text-xs text-gray-500">{reason.length}/500</p>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={!selectedMainBakerId || reason.length < 50 || isSubmitting || submitApplicationMutation.isPending}
                      >
                        {isSubmitting || submitApplicationMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting Your Application...
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Submit Application & Join the Team
                          </>
                        )}
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
