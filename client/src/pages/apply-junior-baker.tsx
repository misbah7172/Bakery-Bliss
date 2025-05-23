import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ChefHat, AlertCircle, ArrowLeft, Star, Package, Briefcase } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

const ApplyJuniorBakerPage = () => {
  const { bakerId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bakerDetails, setBakerDetails] = useState<any>(null);
  const [formData, setFormData] = useState({
    reason: "",
    experience: "",
    availability: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch main baker details
  useEffect(() => {
    const fetchBakerDetails = async () => {
      if (!bakerId) return;
      
      setLoading(true);
      try {
        // In a real implementation, fetch the baker details
        // For now, use mock data
        setTimeout(() => {
          setBakerDetails({
            id: parseInt(bakerId),
            username: "masterbaker",
            fullName: "Master Baker",
            profileImage: null,
            specialty: "Cakes & Pastries",
            rating: 4.9,
            productsCount: 24,
            completedOrders: 156,
            experience: "7 years",
            bio: "A passionate baker with over 7 years of experience specializing in cakes and pastries. I love teaching new bakers and sharing my knowledge of traditional and modern baking techniques."
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching baker details:", error);
        toast({
          title: "Error",
          description: "Failed to load baker details. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchBakerDetails();
  }, [bakerId, toast]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.reason.trim()) {
      newErrors.reason = "Please explain why you want to be a junior baker";
    } else if (formData.reason.trim().length < 50) {
      newErrors.reason = "Please provide a more detailed explanation (at least 50 characters)";
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Please provide information about your baking experience";
    }

    if (!formData.availability.trim()) {
      newErrors.availability = "Please provide your availability";
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

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to apply for a junior baker position",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare application data
      const applicationData = {
        userId: user.id,
        currentRole: "customer",
        requestedRole: "junior_baker",
        mainBakerId: parseInt(bakerId!),
        reason: formData.reason,
        additionalInfo: {
          experience: formData.experience,
          availability: formData.availability
        }
      };

      // Send application to backend
      await apiRequest('/api/baker-applications', {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });

      toast({
        title: "Application Submitted",
        description: "Your application to become a junior baker has been submitted successfully!"
      });

      // Redirect to profile or applications page
      navigate("/profile");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!bakerDetails) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="text-2xl font-bold mt-4">Baker Not Found</h1>
          <p className="text-muted-foreground mt-2">
            We couldn't find the baker you're looking for.
          </p>
          <Link href="/bakers">
            <Button className="mt-6">View All Bakers</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/bakers">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Apply to be a Junior Baker</h1>
            <p className="text-muted-foreground">
              Join {bakerDetails.fullName}'s team and learn from a master baker
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Baker Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Baker Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {bakerDetails.fullName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{bakerDetails.fullName}</h3>
                <div className="flex items-center justify-center gap-2 mt-1 mb-3">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                    {bakerDetails.rating.toFixed(1)}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {bakerDetails.specialty}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-2">
                  {bakerDetails.bio}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                  <Package className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-xl font-semibold">{bakerDetails.productsCount}</span>
                  <span className="text-xs text-muted-foreground">Products</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-xl font-semibold">{bakerDetails.completedOrders}</span>
                  <span className="text-xs text-muted-foreground">Completed</span>
                </div>
              </div>

              <div className="mt-4">
                <Link href={`/products?mainBakerId=${bakerDetails.id}`}>
                  <Button variant="outline" className="w-full">
                    View Baker's Products
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Junior Baker Application</CardTitle>
              <CardDescription>
                Fill out this form to apply to become a junior baker under {bakerDetails.fullName}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {!user && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Required</AlertTitle>
                    <AlertDescription>
                      You need to be logged in to apply for a junior baker position.
                      <div className="mt-2">
                        <Link href="/login">
                          <Button size="sm" variant="outline">Log In</Button>
                        </Link>
                        <span className="mx-2">or</span>
                        <Link href="/register">
                          <Button size="sm">Register</Button>
                        </Link>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Why do you want to be a junior baker? <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    placeholder="Tell us why you want to join as a junior baker and what you hope to learn..."
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={5}
                    className={errors.reason ? "border-red-500" : ""}
                    disabled={!user || isSubmitting}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.reason}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">
                    What is your baking experience? <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    placeholder="Describe any baking experience you have, even if it's just at home..."
                    value={formData.experience}
                    onChange={handleInputChange}
                    rows={3}
                    className={errors.experience ? "border-red-500" : ""}
                    disabled={!user || isSubmitting}
                  />
                  {errors.experience && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.experience}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">
                    What is your availability? <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="availability"
                    name="availability"
                    placeholder="e.g. Weekdays 9am-5pm, Weekends, etc."
                    value={formData.availability}
                    onChange={handleInputChange}
                    className={errors.availability ? "border-red-500" : ""}
                    disabled={!user || isSubmitting}
                  />
                  {errors.availability && (
                    <p className="text-sm text-red-500 flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.availability}
                    </p>
                  )}
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Application Process</AlertTitle>
                  <AlertDescription>
                    After submission, your application will be reviewed by {bakerDetails.fullName}.
                    You'll be notified via email when they make a decision on your application.
                  </AlertDescription>
                </Alert>
              </CardContent>

              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Link href="/bakers">
                  <Button variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={!user || isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ApplyJuniorBakerPage;