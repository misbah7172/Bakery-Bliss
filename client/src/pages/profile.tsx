import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CakeSlice, ShoppingBag, MessageCircle, Settings, User } from "lucide-react";
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
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-md p-6 w-full md:w-1/3">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                {user.profileImage ? (
                  <AvatarImage src={user.profileImage} alt={user.fullName} />
                ) : (
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {user.fullName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <p className="text-muted-foreground mb-2">{user.email}</p>
              
              <div className="bg-muted text-muted-foreground text-sm px-3 py-1 rounded-full mb-4">
                {user.role === "customer" && "Customer"}
                {user.role === "junior_baker" && "Junior Baker"}
                {user.role === "main_baker" && "Main Baker"}
                {user.role === "admin" && "Admin"}
              </div>
              
              {user.customerSince && (
                <p className="text-sm text-muted-foreground">
                  Customer since {new Date(user.customerSince).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="profile">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center">
                  <CakeSlice className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Saved Items</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
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
                      
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      View and track your recent orders.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center py-8 text-muted-foreground">
                      Your order history will be displayed here.
                      <br />
                      This feature is currently being improved.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="favorites">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Items</CardTitle>
                    <CardDescription>
                      Quick access to your favorite bakery items.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center py-8 text-muted-foreground">
                      Your saved items will be displayed here.
                      <br />
                      This feature is currently being improved.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
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
                          
                          <Button>Update Password</Button>
                        </div>
                      </div>
                      
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">Delete Account</h3>
                        <p className="text-muted-foreground mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button variant="destructive">Delete Account</Button>
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