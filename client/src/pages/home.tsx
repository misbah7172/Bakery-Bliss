import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layouts/AppLayout";
import CategoryCard from "@/components/ui/category-card";
import ProductCard from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@shared/schema";
import { ReviewDisplay } from "@/components/ReviewDisplay";
import { Cake, Cookie, ChefHat, Star, Heart, Sparkles, Gift, Coffee, Wheat } from "lucide-react";

const Home = () => {
  const [email, setEmail] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [rotatingText, setRotatingText] = useState(0);
  
  const rotatingWords = ["Pure Bliss", "Sweet Dreams", "Heavenly Taste", "Artisan Quality"];
  
  useEffect(() => {
    setIsVisible(true);
    
    // Rotate text every 3 seconds
    const interval = setInterval(() => {
      setRotatingText((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch real customer reviews for homepage
  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: ['/api/reviews'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const bestSellers = products.filter(product => product.isBestSeller).slice(0, 3);
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Subscribing email:", email);
    setEmail("");
  };
  
  const categories = [
    { 
      title: "Cakes", 
      link: "/products?category=cakes", 
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      icon: <Cake className="w-6 h-6" />,
      description: "Decadent custom cakes for every celebration"
    },
    { 
      title: "Cookies", 
      link: "/products?category=cookies", 
      imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      icon: <Cookie className="w-6 h-6" />,
      description: "Freshly baked cookies with traditional recipes"
    },
    { 
      title: "Bread", 
      link: "/products?category=bread", 
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      icon: <Wheat className="w-6 h-6" />,
      description: "Artisanal breads baked fresh daily"
    },
    { 
      title: "Pastries", 
      link: "/products?category=pastries", 
      imageUrl: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      icon: <Coffee className="w-6 h-6" />,
      description: "Delicate pastries crafted with love"
    }
  ];

  return (
    <AppLayout>
      {/* Hero Section with Animated Background */}
      <div className="relative h-[600px] rounded-2xl overflow-hidden mb-16 group">
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/90 via-pink-500/80 to-purple-600/70 z-10">
          <div className="absolute inset-0 opacity-30">
            <div 
              className="absolute inset-0 bg-repeat animate-pulse" 
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            ></div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 z-15">
          <div className="absolute top-20 left-10 animate-bounce delay-100">
            <Sparkles className="w-8 h-8 text-yellow-300 opacity-70" />
          </div>
          <div className="absolute top-32 right-20 animate-bounce delay-300">
            <Gift className="w-6 h-6 text-purple-300 opacity-60" />
          </div>
          <div className="absolute bottom-32 left-20 animate-bounce delay-500">
            <Cookie className="w-7 h-7 text-yellow-200 opacity-80" />
          </div>
          <div className="absolute bottom-20 right-32 animate-bounce delay-700">
            <Cake className="w-8 h-8 text-pink-200 opacity-70" />
          </div>
          <div className="absolute top-1/2 left-1/4 animate-bounce delay-900">
            <Coffee className="w-5 h-5 text-orange-200 opacity-50" />
          </div>
        </div>
        
        <img 
          src="https://images.unsplash.com/photo-1612203985729-70726954388c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
          alt="Delicious bakery display" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Hero Content */}
        <div className={`absolute inset-0 z-20 flex items-center justify-center text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl px-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <ChefHat className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-medium">Handcrafted with Love</span>
            </div>
            
            <h1 className="text-white font-poppins font-bold text-5xl md:text-7xl leading-tight mb-6 drop-shadow-lg">
              Where Every Bite is 
              <span className="text-transparent bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text block mt-2 transition-all duration-500">
                {rotatingWords[rotatingText]}
              </span>
            </h1>
            
            <p className="text-white/90 text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed">
              Discover our artisanal bakery where traditional craftsmanship meets modern creativity. 
              From custom cakes to daily fresh bread, we bake happiness into every creation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Explore Our Delights
                </Button>
              </Link>
              <Link href="/custom-cake-builder">
                <Button size="lg" variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Cake className="w-5 h-5 mr-2" />
                  Create Custom Cake
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {[
          { number: "50K+", label: "Happy Customers", icon: <Heart className="w-8 h-8" /> },
          { number: "500+", label: "Custom Cakes Created", icon: <Cake className="w-8 h-8" /> },
          { number: "15+", label: "Years of Excellence", icon: <Star className="w-8 h-8" /> }
        ].map((stat, index) => (
          <div key={index} className={`text-center p-8 bg-gradient-to-br from-pink-50 to-orange-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${index * 200}ms` }}>
            <div className="text-pink-500 mb-4 flex justify-center">
              {stat.icon}
            </div>
            <div className="text-4xl font-bold text-gray-800 mb-2">{stat.number}</div>
            <div className="text-gray-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Categories Section */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
            Our Sweet Categories
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Discover our carefully crafted collections, each telling its own delicious story
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <div key={index} className={`group cursor-pointer transition-all duration-500 transform hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${index * 150}ms` }}>
              <Link href={category.link}>
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <img 
                    src={category.imageUrl} 
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-yellow-300">
                          {category.icon}
                        </div>
                        <h3 className="font-poppins font-bold text-xl">{category.title}</h3>
                      </div>
                      <p className="text-sm text-gray-200">{category.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Best Sellers Section */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Customer Favorites
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            These irresistible treats have won the hearts of our customers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 mb-2 w-3/4 rounded"></div>
                  <div className="h-4 bg-gray-200 mb-4 w-1/4 rounded"></div>
                  <div className="h-4 bg-gray-200 mb-4 rounded"></div>
                  <div className="h-4 bg-gray-200 mb-4 w-5/6 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))
          ) : bestSellers.length > 0 ? (
            bestSellers.map((product, index) => (
              <div key={product.id} className={`transform transition-all duration-500 hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${index * 200}ms` }}>
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-16">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Our delicious products are being prepared!</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/products">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Sparkles className="w-5 h-5 mr-2" />
              View All Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Custom Builder Promo */}
      <div className="bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 rounded-3xl shadow-xl mb-20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className="p-12 lg:p-16">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-purple-800 font-medium text-sm">Custom Creations</span>
            </div>
            
            <h2 className="font-poppins font-bold text-3xl lg:text-4xl mb-6 text-gray-800">
              Design Your Dream Cake
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Bring your vision to life with our interactive cake builder. Choose layers, flavors, colors, and decorations to create the perfect centerpiece for your special moments.
            </p>
            
            <div className="space-y-4">
              <Link href="/custom-cake-builder">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Cake className="w-5 h-5 mr-2" />
                  Start Creating
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative h-64 lg:h-full min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1621303837174-89787a7d4729?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Custom cake creation" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Review Statistics Section */}
      <div className="mb-20">
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 rounded-3xl p-12 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="font-poppins font-bold text-3xl lg:text-4xl mb-4 text-gray-800">
              Loved by Sweet Souls Everywhere
            </h2>
            <p className="text-gray-600 text-lg">
              Don't just take our word for it - see what our community is saying
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {reviews && reviews.length > 0 ? reviews.length : '50+'}
              </div>
              <div className="text-gray-600 font-medium">Happy Reviews</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <span className="text-4xl font-bold text-orange-600 mr-2">
                  {reviews && reviews.length > 0 ? 
                    (reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1) 
                    : '4.9'
                  }
                </span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {reviews && reviews.length > 0 ? 
                  Math.round((reviews.filter((review: any) => review.isVerifiedPurchase).length / reviews.length) * 100) + '%'
                  : '98%'
                }
              </div>
              <div className="text-gray-600 font-medium">Verified Purchases</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {reviews && reviews.length > 0 ? 
                  Math.round((reviews.filter((review: any) => review.rating >= 4).length / reviews.length) * 100) + '%'
                  : '96%'
                }
              </div>
              <div className="text-gray-600 font-medium">4+ Star Reviews</div>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Heart className="w-5 h-5 mr-2" />
                Join Our Happy Customers
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mb-20">          <div className="text-center">
            <h2 className="font-poppins font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Sweet Words from Sweet People
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-6">
              Don't just take our word for it - hear what our customers have to say about their blissful experiences
            </p>
            <Link href="/reviews">
              <Button variant="outline" className="bg-white border-2 border-orange-400 text-orange-600 hover:bg-orange-50 font-medium px-6 py-2 rounded-full transition-all duration-300">
                View All Reviews
              </Button>
            </Link>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(reviews && reviews.length > 0) ? (
            // Display real reviews from API
            reviews.slice(0, 3).map((review: any, index: number) => (
              <div key={review.id} className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border-l-4 border-orange-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${index * 250}ms` }}>
                <div className="flex items-center mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  {Array.from({ length: 5 - review.rating }).map((_, i) => (
                    <Star key={i + review.rating} className="w-5 h-5 text-gray-300" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{review.comment || 'Great experience with Bakery Bliss!'}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {review.user?.fullName?.[0] || 'C'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{review.user?.fullName || 'Valued Customer'}</div>
                    <div className="text-gray-500 text-sm">
                      {review.isVerifiedPurchase ? 'Verified Purchase' : 'Customer'}
                      {review.juniorBaker && ` • Baker: ${review.juniorBaker.fullName}`}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Fallback to hardcoded testimonials if no reviews available
            [
              {
                name: "Sarah Johnson",
                role: "Birthday Mom",
                text: "The custom birthday cake for my daughter was absolutely perfect! The design was exactly what we envisioned, and it tasted even better than it looked. Pure bliss indeed!",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Wedding Planner",
                text: "I've worked with many bakeries, but Bakery Bliss stands out. Their attention to detail, quality, and customer service is unmatched. My clients are always delighted!",
                rating: 5
              },
              {
                name: "Emma Rodriguez",
                role: "Coffee Shop Owner",
                text: "We source our pastries from Bakery Bliss and our customers can't get enough! The freshness and artisanal quality keep them coming back for more.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border-l-4 border-orange-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${index * 250}ms` }}>
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-3xl p-12 text-center text-white shadow-2xl">
        <div className="max-w-2xl mx-auto">
          <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-90" />
          <h2 className="font-poppins font-bold text-3xl lg:text-4xl mb-4">
            Join Our Sweet Community
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Be the first to know about our latest creations, seasonal specials, and exclusive offers
          </p>
          
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="flex-grow bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70 rounded-full px-6 py-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="bg-white text-orange-600 hover:bg-white/90 font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Heart className="w-5 h-5 mr-2" />
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;

