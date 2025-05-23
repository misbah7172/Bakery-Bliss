import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Filter, Search, Star, ChefHat, Package, Briefcase, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getQueryFn } from "@/lib/queryClient";

interface Baker {
  id: number;
  username: string;
  fullName: string;
  profileImage?: string;
  specialty?: string;
  rating?: number;
  productsCount?: number;
  completedOrders?: number;
  experience?: string;
}

const BakersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch all main bakers
  const { data: bakers, isLoading, error } = useQuery({ 
    queryKey: ['/api/users/main-bakers'],
    queryFn: getQueryFn({ on401: "returnNull" })
  });
  
  // Filter bakers based on search term and active filter
  const filteredBakers = bakers ? (bakers as Baker[]).filter(baker => {
    const matchesSearch = baker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           baker.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (activeFilter === "all") return true;
    if (activeFilter === "highly-rated" && baker.rating && baker.rating >= 4.5) return true;
    if (activeFilter === "experienced" && baker.completedOrders && baker.completedOrders > 100) return true;

    return false;
  }) : [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Meet Our Master Bakers</h1>
          <p className="text-muted-foreground">
            Learn about our talented master bakers and apply to become a junior baker under their guidance
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative w-full md:w-auto md:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search bakers by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All Bakers</TabsTrigger>
              <TabsTrigger value="highly-rated">
                <Star className="h-4 w-4 mr-1" />
                Top Rated
              </TabsTrigger>
              <TabsTrigger value="experienced">
                <Award className="h-4 w-4 mr-1" />
                Experienced
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Bakers display */}
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Something went wrong. Please try again later.</p>
          </div>
        ) : filteredBakers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <ChefHat className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No bakers found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm ? "Try adjusting your search or filters." : "Check back soon for more bakers."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Use mock data until API is connected */}
            {[
              {
                id: 2,
                username: "masterbaker",
                fullName: "Master Baker",
                specialty: "Cakes & Pastries",
                rating: 4.9,
                productsCount: 24,
                completedOrders: 156,
                experience: "7 years"
              },
              {
                id: 3,
                username: "chocoholic",
                fullName: "Samantha Chocolatier",
                specialty: "Chocolate Desserts",
                rating: 4.8,
                productsCount: 18,
                completedOrders: 130,
                experience: "5 years"
              },
              {
                id: 4,
                username: "breadwizard",
                fullName: "David Breadmaster",
                specialty: "Artisan Breads",
                rating: 4.7,
                productsCount: 15,
                completedOrders: 112,
                experience: "6 years"
              },
              {
                id: 5,
                username: "cakequeen",
                fullName: "Emily Cakequeen",
                specialty: "Wedding Cakes",
                rating: 5.0,
                productsCount: 30,
                completedOrders: 200,
                experience: "10 years"
              }
            ].filter(baker => {
              const matchesSearch = baker.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 baker.specialty.toLowerCase().includes(searchTerm.toLowerCase());
              
              if (!matchesSearch) return false;
              
              if (activeFilter === "all") return true;
              if (activeFilter === "highly-rated" && baker.rating >= 4.5) return true;
              if (activeFilter === "experienced" && baker.completedOrders > 100) return true;
          
              return false;
            }).map((baker) => (
              <Card key={baker.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {baker.fullName.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{baker.fullName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                          {baker.rating.toFixed(1)}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {baker.specialty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                      <Package className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xl font-semibold">{baker.productsCount}</span>
                      <span className="text-xs text-muted-foreground">Products</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xl font-semibold">{baker.completedOrders}</span>
                      <span className="text-xs text-muted-foreground">Completed</span>
                    </div>
                  </div>

                  <div className="mt-4 bg-muted/30 p-3 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">Experience:</span> {baker.experience}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="w-full flex gap-2">
                    <Link href={`/products?mainBakerId=${baker.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">View Products</Button>
                    </Link>
                    <Link href={`/apply-junior-baker/${baker.id}`} className="flex-1">
                      <Button className="w-full">Apply as Junior</Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default BakersPage;