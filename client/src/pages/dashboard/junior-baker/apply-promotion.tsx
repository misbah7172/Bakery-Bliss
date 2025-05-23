import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, Check, X, Clock, Star, Award } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Interface for stats
interface JuniorBakerStats {
  totalOrdersCompleted: number;
  averageRating: number;
  qualityCheckPassed: number;
  pendingApplications: number;
  applicationStatus?: string;
}

const ApplyForPromotionPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [stats, setStats] = useState<JuniorBakerStats | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Required number of completed orders to apply
  const REQUIRED_ORDERS = 50;
  
  // Check eligibility and load stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real implementation, we would fetch from the backend
        // For now, we'll use mock data
        setTimeout(() => {
          setStats({
            totalOrdersCompleted: 47, // Just below threshold for testing
            averageRating: 4.8,
            qualityCheckPassed: 45,
            pendingApplications: 0,
            applicationStatus: undefined // Can be "pending", "approved", "rejected"
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching baker stats:", error);
        toast({
          title: "Error",
          description: "Failed to load your information. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!reason.trim()) {
      newErrors.reason = "Please provide a reason for your application";
    } else if (reason.trim().length < 50) {
      newErrors.reason = "Your reason should be at least 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check eligibility
    if (!stats || stats.totalOrdersCompleted < REQUIRED_ORDERS) {
      toast({
        title: "Not Eligible",
        description: `You need to complete at least ${REQUIRED_ORDERS} orders before applying for promotion.`,
        variant: "destructive"
      });
      return;
    }

    if (stats.pendingApplications > 0) {
      toast({
        title: "Application Pending",
        description: "You already have a pending application. Please wait for it to be reviewed.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to apply for promotion",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare application data
      const applicationData = {
        userId: user.id,
        currentRole: "junior_baker",
        requestedRole: "main_baker",
        reason: reason.trim()
      };

      // Send data to the API
      await apiRequest('/api/baker-applications', {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });

      toast({
        title: "Application Submitted",
        description: "Your application for promotion has been submitted successfully! We will review it shortly."
      });

      // Update local state to show pending application
      setStats(prev => prev ? { ...prev, pendingApplications: 1, applicationStatus: "pending" } : null);
      setReason("");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout showSidebar sidebarType="junior_baker">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const isEligible = stats && stats.totalOrdersCompleted >= REQUIRED_ORDERS;
  const hasPendingApplication = stats && stats.pendingApplications > 0;

  return (
    <AppLayout showSidebar sidebarType="junior_baker">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Apply for Main Baker Position</h1>
          <p className="text-muted-foreground">
            Junior bakers who have completed at least {REQUIRED_ORDERS} orders can apply for promotion
          </p>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>
              Your performance and eligibility for promotion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold">{stats?.totalOrdersCompleted || 0}</h3>
                <p className="text-sm text-muted-foreground">Orders Completed</p>
                <div className="mt-2">
                  <Badge variant={isEligible ? "success" : "outline"}>
                    {isEligible ? 
                      <Check className="h-3 w-3 mr-1" /> : 
                      <Clock className="h-3 w-3 mr-1" />}
                    {isEligible ? 'Requirement Met' : `${REQUIRED_ORDERS - (stats?.totalOrdersCompleted || 0)} more needed`}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold">{stats?.averageRating.toFixed(1) || "0.0"}</h3>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <div className="mt-2">
                  <Badge variant={(stats?.averageRating || 0) >= 4.5 ? "success" : "outline"}>
                    {(stats?.averageRating || 0) >= 4.5 ? 
                      <Check className="h-3 w-3 mr-1" /> : 
                      <Clock className="h-3 w-3 mr-1" />}
                    {(stats?.averageRating || 0) >= 4.5 ? 'Excellent' : 'Good'}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold">{stats?.qualityCheckPassed || 0}</h3>
                <p className="text-sm text-muted-foreground">Quality Checks Passed</p>
                <div className="mt-2">
                  <Badge variant={(stats?.qualityCheckPassed || 0) >= 40 ? "success" : "outline"}>
                    {(stats?.qualityCheckPassed || 0) >= 40 ? 
                      <Check className="h-3 w-3 mr-1" /> : 
                      <Clock className="h-3 w-3 mr-1" />}
                    {(stats?.qualityCheckPassed || 0) >= 40 ? 'Requirement Met' : 'In Progress'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Application Status */}
            {stats?.applicationStatus && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      stats.applicationStatus === "approved" ? "bg-green-100" :
                      stats.applicationStatus === "rejected" ? "bg-red-100" :
                      "bg-blue-100"
                    }`}>
                      {stats.applicationStatus === "approved" ? 
                        <Check className="h-5 w-5 text-green-600" /> :
                        stats.applicationStatus === "rejected" ?
                        <X className="h-5 w-5 text-red-600" /> :
                        <Clock className="h-5 w-5 text-blue-600" />
                      }
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">Your Application Status</h3>
                      <p className="text-sm text-muted-foreground">
                        {stats.applicationStatus === "approved" ? 
                          "Congratulations! Your application has been approved." :
                          stats.applicationStatus === "rejected" ?
                          "We're sorry, but your application was not approved at this time." :
                          "Your application is currently being reviewed."
                        }
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      stats.applicationStatus === "approved" ? "bg-green-100 text-green-800" :
                      stats.applicationStatus === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-blue-100 text-blue-800"
                    }
                  >
                    {stats.applicationStatus === "approved" ? "Approved" :
                     stats.applicationStatus === "rejected" ? "Rejected" :
                     "Pending"}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Form or Eligibility Message */}
        {!isEligible ? (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not Eligible Yet</AlertTitle>
            <AlertDescription>
              You need to complete at least {REQUIRED_ORDERS} orders before applying for promotion. 
              You currently have {stats?.totalOrdersCompleted || 0} completed orders.
              Keep up the good work!
            </AlertDescription>
          </Alert>
        ) : hasPendingApplication ? (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Application Pending</AlertTitle>
            <AlertDescription>
              Your application for promotion is currently being reviewed by our admin team. 
              We will notify you once a decision has been made.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Apply for Promotion</CardTitle>
                <CardDescription>
                  Explain why you would like to be promoted to a Main Baker position
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="reason" className="block font-medium">
                    Why should you be promoted to Main Baker? <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your experience, skills, and why you would make a great Main Baker..."
                    rows={6}
                    className={errors.reason ? "border-red-500" : ""}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.reason}
                    </p>
                  )}
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription>
                    Main Bakers have additional responsibilities, including creating products, 
                    managing quality control, and overseeing Junior Bakers. Your application 
                    will be reviewed by our admin team.
                  </AlertDescription>
                </Alert>
              </CardContent>
              
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/dashboard/junior-baker")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ApplyForPromotionPage;