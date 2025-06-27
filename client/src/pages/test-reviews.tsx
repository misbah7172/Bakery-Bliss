import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/layouts/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

const TestReviews = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const sampleReviews = [
    {
      orderId: 1,
      rating: 5,
      comment: "Absolutely amazing birthday cake! My daughter was thrilled with the unicorn design and it tasted as good as it looked. The attention to detail was incredible!"
    },
    {
      orderId: 2,
      rating: 5,
      comment: "Perfect wedding cake! The three-tier design was exactly what we wanted and all our guests couldn't stop talking about how delicious it was. Highly recommend!"
    },
    {
      orderId: 3,
      rating: 4,
      comment: "Great custom chocolate cake for our anniversary. The raspberry filling was divine. Only small suggestion would be slightly less sweet frosting, but overall fantastic!"
    },
    {
      orderId: 4,
      rating: 5,
      comment: "Best cookies I've ever had! Ordered a variety box and every single one was perfect. The chocolate chip ones were still warm when delivered!"
    },
    {
      orderId: 5,
      rating: 5,
      comment: "Their croissants are incredible! Fresh, flaky, and buttery. I order them every weekend now. The staff is also very friendly and helpful."
    },
    {
      orderId: 6,
      rating: 4,
      comment: "Beautiful custom cake for my mother's 70th birthday. The design matched the photo perfectly and she loved it. Great service and quality!"
    }
  ];

  const createSampleReviews = async () => {
    setIsCreating(true);
    
    try {
      for (const reviewData of sampleReviews) {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reviewData),
        });
        
        if (!response.ok) {
          console.log("Failed to create review:", await response.text());
        } else {
          const result = await response.json();
          console.log("Created review:", result);
        }
      }
      
      toast({
        title: "Sample reviews created!",
        description: "You can now see reviews on the home page.",
      });
      
    } catch (error) {
      console.error("Error creating reviews:", error);
      toast({
        title: "Error creating reviews",
        description: "Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Test Reviews Creator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              This page is for testing purposes. Click the button below to create sample reviews in the database.
            </p>
            
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold">Sample reviews to be created:</h3>
              {sampleReviews.map((review, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">Order #{review.orderId}</span>
                  </div>
                  <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={createSampleReviews}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500"
            >
              {isCreating ? "Creating Reviews..." : "Create Sample Reviews"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TestReviews;
