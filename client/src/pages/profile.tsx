import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CakeSlice, ShoppingBag, MessageCircle, Settings, User, Star, Crown, Sparkles } from "lucide-react";
import { Link } from "wouter";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Here we would normally send the updated profile data to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view your profile.
          </p>
          <Link href="/login">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Bakery-themed Hero Section */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 right-8 animate-bounce delay-100">
            <Star className="w-6 h-6 text-pink-400 opacity-60" />
          </div>
          <div className="absolute bottom-6 left-12 animate-bounce delay-300">
            <Crown className="w-5 h-5 text-purple-400 opacity-50" />
          </div>
          <div className="absolute top-8 left-1/4 animate-bounce delay-500">
            <Sparkles className="w-4 h-4 text-blue-400 opacity-70" />
          </div>
        </div>
        
        <div className="relative z-10 px-8 py-12">
          <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <User className="w-5 h-5 text-purple-600" />
            <span className="text-gray-700 font-medium">Your Profile</span>
          </div>
          
          <h1 className="font-poppins font-bold text-3xl md:text-4xl mb-2 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome, {user.fullName}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account and personalize your bakery experience
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl shadow-xl border border-purple-200 p-6 w-full md:w-1/3">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 shadow-lg border-4 border-white">
                {user.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={user.fullName} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl">
                    {user.fullName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{user.fullName}</h1>
              <p className="text-purple-600 font-medium mb-3">{user.email}</p>
              
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-4 py-2 rounded-full mb-4 shadow-md">
                {user.role === "customer" && "🍰 Sweet Customer"}
                {user.role === "junior_baker" && "👨‍🍳 Junior Baker"}
                {user.role === "main_baker" && "👑 Master Baker"}
                {user.role === "admin" && "⚡ Admin"}
              </div>
              
              {user.customerSince && (
                <p className="text-sm text-purple-600 bg-white/50 px-3 py-1 rounded-full">
                  Customer since {new Date(user.customerSince).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="profile">
              <TabsList className="grid grid-cols-4 mb-6 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 shadow-lg">
                <TabsTrigger value="profile" className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                  <CakeSlice className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Saved Items</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card className="bg-gradient-to-br from-white to-purple-50/50 border-purple-200 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-200">
                    <CardTitle className="text-purple-800 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-purple-600">
                      Update your personal information and contact details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="fullName">
                            Full Name
                          </label>
                          <Input
                            id="fullName"
                            name="fullName"
                            value={profileData.fullName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="email">
                            Email Address
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="phone">
                            Phone Number
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1" htmlFor="address">
                            Address
                          </label>
                          <Input
                            id="address"
                            name="address"
                            value={profileData.address}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1" htmlFor="city">
                            City
                          </label>
                          <Input
                            id="city"
                            name="city"
                            value={profileData.city}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="state">
                              State
                            </label>
                            <Input
                              id="state"
                              name="state"
                              value={profileData.state}
                              onChange={handleChange}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="zip">
                              ZIP Code
                            </label>
                            <Input
                              id="zip"
                              name="zip"
                              value={profileData.zip}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={isUpdating}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                      >
                        {isUpdating ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="orders">
                <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-blue-200">
                    <CardTitle className="text-blue-800 flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Order History
                    </CardTitle>
                    <CardDescription className="text-blue-600">
                      View and track your recent orders.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-blue-300" />
                      <p className="text-blue-600 text-lg font-medium mb-2">Your order history will be displayed here.</p>
                      <p className="text-blue-500">This feature is currently being improved.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="favorites">
                <Card className="bg-gradient-to-br from-white to-pink-50/50 border-pink-200 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-b border-pink-200">
                    <CardTitle className="text-pink-800 flex items-center">
                      <CakeSlice className="h-5 w-5 mr-2" />
                      Saved Items
                    </CardTitle>
                    <CardDescription className="text-pink-600">
                      Quick access to your favorite bakery items.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <CakeSlice className="h-16 w-16 mx-auto mb-4 text-pink-300" />
                      <p className="text-pink-600 text-lg font-medium mb-2">Your saved items will be displayed here.</p>
                      <p className="text-pink-500">This feature is currently being improved.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card className="bg-gradient-to-br from-white to-orange-50/50 border-orange-200 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-orange-200">
                    <CardTitle className="text-orange-800 flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Account Settings
                    </CardTitle>
                    <CardDescription className="text-orange-600">
                      Manage your password and notification preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="currentPassword">
                              Current Password
                            </label>
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="newPassword">
                              New Password
                            </label>
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
                              Confirm New Password
                            </label>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                            />
                          </div>
                          
                          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg">
                            Update Password
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border-t border-orange-200 pt-6">
                        <h3 className="text-lg font-medium mb-4 text-red-700">Delete Account</h3>
                        <p className="text-red-600 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button 
                          variant="destructive"
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;