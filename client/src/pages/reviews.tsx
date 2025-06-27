import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layouts/AppLayout";
import { Star, Heart, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const Reviews = () => {
  const { user } = useAuth();
  const { data: reviews = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/reviews'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const rating = 5 - i;
    const count = reviews.filter((review: any) => review.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
            Customer Reviews
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-6">
            Real feedback from our valued customers who experienced the bliss of our bakery
          </p>
          
          {user && (
            <Link href="/orders">
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <MessageCircle className="w-5 h-5 mr-2" />
                Write a Review
              </Button>
            </Link>
          )}
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-3xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <span className="text-6xl font-bold text-orange-600 mr-4">{averageRating}</span>
                <div>
                  <div className="flex mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-8 h-8 ${i < Math.floor(parseFloat(averageRating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="text-gray-600">Based on {reviews.length} reviews</div>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Rating Distribution</h3>
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center mb-2">
                  <span className="w-8 text-sm font-medium text-gray-600">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current mx-2" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-8">
          {isLoading ? (
            // Loading skeleton
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="h-4 bg-gray-200 rounded w-32 mr-4"></div>
                      <div className="flex space-x-1">
                        {Array(5).fill(0).map((_, i) => (
                          <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))
          ) : reviews.length > 0 ? (
            reviews.map((review: any) => (
              <div key={review.id} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-orange-400">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {review.user?.fullName?.[0] || 'C'}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{review.user?.fullName || 'Valued Customer'}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          {review.isVerifiedPurchase && (
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                              <span>Verified Purchase</span>
                            </div>
                          )}
                          {review.juniorBaker && (
                            <span>• Baker: {review.juniorBaker.fullName}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center mb-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                          {Array.from({ length: 5 - review.rating }).map((_, i) => (
                            <Star key={i + review.rating} className="w-5 h-5 text-gray-300" />
                          ))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {review.comment && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <MessageCircle className="w-5 h-5 text-gray-400 float-left mr-2 mt-1" />
                        <p className="text-gray-700 leading-relaxed">"{review.comment}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No Reviews Yet</h3>
              <p className="text-gray-400 mb-6">Be the first to share your sweet experience with us!</p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white">
                  Start Your Sweet Journey
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Call to Action */}
        {reviews.length > 0 && (
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-12 text-white">
              <h2 className="font-poppins font-bold text-3xl lg:text-4xl mb-4">
                Ready to Create Your Own Sweet Story?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of happy customers who have experienced the bliss of our artisanal bakery
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Browse Our Delights
                  </Button>
                </Link>
                <Link href="/custom-cake-builder">
                  <Button size="lg" variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Create Custom Cake
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Reviews;
