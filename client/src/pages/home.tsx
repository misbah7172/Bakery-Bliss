import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layouts/AppLayout";
import CategoryCard from "@/components/ui/category-card";
import ProductCard from "@/components/ui/product-card";
import TestimonialCard from "@/components/ui/testimonial-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@shared/schema";
import { ReviewDisplay } from "@/components/ReviewDisplay";

const Home = () => {
  const [email, setEmail] = useState("");
  
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch real customer reviews for homepage
  const { data: reviews = [] } = useQuery({
    queryKey: ['/api/reviews'],
  });
  
  const bestSellers = products.filter(product => product.isBestSeller).slice(0, 3);
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter subscription logic would go here
    console.log("Subscribing email:", email);
    setEmail("");
    // Show some feedback to the user
  };
  
  const categories = [
    { 
      title: "Cakes", 
      link: "/products?category=cakes", 
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
    },
    { 
      title: "Cookies", 
      link: "/products?category=cookies", 
      imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
    },
    { 
      title: "Bread", 
      link: "/products?category=bread", 
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
    },
    { 
      title: "Pastries", 
      link: "/products?category=pastries", 
      imageUrl: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
    }
  ];
  
  const testimonials = [
    {
      quote: "The cakes from Bakery Bliss are absolutely divine! I ordered a custom cake for my daughter's birthday and it was both beautiful and delicious. Everyone was impressed!",
      author: "Sarah K.",
      initials: "SK",
      color: "primary" as const
    },
    {
      quote: "Their sourdough bread is the best I've ever had! I'm completely addicted to their weekly special flavors. The chocolate builder tool is also amazing—I created custom gifts that everyone loved.",
      author: "John M.",
      initials: "JM",
      color: "secondary" as const
    },
    {
      quote: "I ordered custom chocolates for my wedding favors, and they were magnificent! The staff was incredibly helpful with the design process, and our guests couldn't stop raving about them.",
      author: "Maria T.",
      initials: "MT",
      color: "accent" as const
    }
  ];
  
  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="relative h-[500px] rounded-xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/50 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1612203985729-70726954388c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
          alt="Assortment of delicious pastries" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-start p-12">
          <div className="max-w-2xl">
            <h1 className="text-white font-poppins font-bold text-4xl md:text-5xl leading-tight mb-4">
              Craft Your Sweetest Dreams
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-8">
              Indulge in handcrafted chocolates or design your own unique creation with our easy-to-use builder.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-accent">
                  Explore Products
                </Button>
              </Link>
              <Link href="/cake-builder">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Design Custom Cake
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mb-16">
        <h2 className="font-poppins font-semibold text-3xl mb-8 text-center">
          Explore Our Sweet Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.title}
              imageUrl={category.imageUrl}
              link={category.link}
            />
          ))}
        </div>
      </div>

      {/* Best Sellers Section */}
      <div className="mb-16">
        <h2 className="font-poppins font-semibold text-3xl mb-4 text-center">Our Best Sellers</h2>
        <p className="text-foreground/70 text-center max-w-2xl mx-auto mb-8">
          Discover why our customers keep coming back for these delicious treats
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            // Show skeleton loaders when loading
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="h-64 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 animate-pulse mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse mb-4 w-1/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse mb-4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse mb-4 w-5/6"></div>
                  <div className="h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
              </div>
            ))
          ) : bestSellers.length > 0 ? (
            bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            // Fallback if no best sellers found
            <div className="col-span-3 text-center py-10">
              <p>No best sellers available at the moment.</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/products">
            <Button variant="outline" className="bg-accent text-primary hover:bg-accent/80">
              View All Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Custom Builder Promo */}
      <div className="bg-white rounded-xl shadow-sm mb-16 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="font-poppins font-semibold text-3xl mb-4">
              Create Your Own Sweet Masterpiece
            </h2>
            <p className="text-foreground/70 mb-6">
              Our custom cake and chocolate builders allow you to design the perfect treat for any occasion. Choose every detail from flavor to decoration.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/cake-builder">
                <Button className="bg-primary hover:bg-primary/90">
                  Design Custom Cake
                </Button>
              </Link>
              <Link href="/chocolate-builder">
                <Button className="bg-secondary hover:bg-secondary/90">
                  Create Chocolate Box
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:h-auto">
            <img 
              src="https://pixabay.com/get/gf318ec6b3465fe553d3e6874c72c996934e57da5a1a35bd1098c08d586494f13bc44ec1eb01d5987d9e585f23c8c0c232b564dd676a94b61d2c25772f1c63525_1280.jpg" 
              alt="Custom cake creation" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mb-16">
        <h2 className="font-poppins font-semibold text-3xl mb-8 text-center">
          What Our Customers Say
        </h2>
        
        {reviews && reviews.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <ReviewDisplay limit={3} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              We're just getting started! Be the first to share your experience with Bakery Bliss.
            </p>
            <Link href="/products">
              <Button>
                Start Your Sweet Journey
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Newsletter Section */}
      <div className="bg-accent/30 rounded-xl p-8 mb-16 text-center">
        <h2 className="font-poppins font-semibold text-2xl mb-3">Join our Sweet Newsletter!</h2>
        <p className="text-foreground/70 mb-6 max-w-lg mx-auto">
          Subscribe to receive updates about new products, seasonal specials, and exclusive discounts.
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Your email address"
            className="flex-grow"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            Subscribe
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Home;
