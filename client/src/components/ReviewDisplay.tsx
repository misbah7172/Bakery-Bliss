import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    fullName: string;
  };
  isVerifiedPurchase: boolean;
}

interface ReviewDisplayProps {
  orderId?: number;
  bakerId?: number;
  limit?: number;
}

export function ReviewDisplay({ orderId, bakerId, limit }: ReviewDisplayProps) {
  const { data: reviewData, isLoading, error } = useQuery({
    queryKey: orderId ? ["/api/reviews/order", orderId] : ["/api/reviews/baker", bakerId],
    enabled: !!(orderId || bakerId),
  });

  const reviews = orderId ? reviewData : reviewData?.reviews || [];
  const averageRating = bakerId ? reviewData?.averageRating : null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !reviews) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Unable to load reviews.</p>
        </CardContent>
      </Card>
    );
  }

  const displayedReviews = limit ? reviews.slice(0, limit) : reviews;

  return (
    <div className="space-y-4">
      {bakerId && averageRating !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              Baker Rating: {averageRating.toFixed(1)}
              <span className="text-sm text-muted-foreground">
                ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {displayedReviews.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reviews yet.</p>
            {orderId && (
              <p className="text-sm text-muted-foreground mt-2">
                Be the first to share your experience!
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review: Review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.user.fullName}</span>
                      {review.isVerifiedPurchase && (
                        <Badge variant="secondary" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {review.comment && (
                  <p className="text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}