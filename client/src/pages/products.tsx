import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layouts/AppLayout";
import ProductCard from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Product } from "@shared/schema";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { Loader2, Cake, Cookie, Wheat, Coffee, Heart, Sparkles, Filter, Grid, Star } from "lucide-react";

const PRODUCTS_PER_PAGE = 12;

const Products = () => {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  
  const [currentCategory, setCurrentCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("popularity");
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', currentCategory !== 'all' ? currentCategory : null],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Filter and sort products based on selected options
  const filteredProducts = currentCategory === 'all' 
    ? products 
    : products.filter(product => product.category === currentCategory);
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "name-a-z":
        return a.name.localeCompare(b.name);
      case "name-z-a":
        return b.name.localeCompare(a.name);
      default: 
        // Default to popularity (best sellers first, then new products)
        if (a.isBestSeller && !b.isBestSeller) return -1;
        if (!a.isBestSeller && b.isBestSeller) return 1;
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
    }
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );
  
  // Change category handler
  const handleCategoryChange = (category: string) => {
    setCurrentCategory(category);
    setCurrentPage(1);
    
    // Update URL if needed
    if (category === 'all') {
      setLocation('/products');
    } else {
      setLocation(`/products?category=${category}`);
    }
  };
  
  // Categories with beautiful icons and descriptions
  const categories = [
    { 
      value: "all", 
      label: "All Products", 
      icon: <Grid className="w-5 h-5" />,
      description: "Browse our complete collection",
      gradient: "from-purple-400 to-pink-400"
    },
    { 
      value: "cakes", 
      label: "Cakes", 
      icon: <Cake className="w-5 h-5" />,
      description: "Custom & classic cakes",
      gradient: "from-pink-400 to-rose-400"
    },
    { 
      value: "cookies", 
      label: "Cookies", 
      icon: <Cookie className="w-5 h-5" />,
      description: "Freshly baked cookies",
      gradient: "from-amber-400 to-orange-400"
    },
    { 
      value: "bread", 
      label: "Bread", 
      icon: <Wheat className="w-5 h-5" />,
      description: "Artisanal breads daily",
      gradient: "from-yellow-400 to-amber-400"
    },
    { 
      value: "pastries", 
      label: "Pastries", 
      icon: <Coffee className="w-5 h-5" />,
      description: "Delicate pastries & croissants",
      gradient: "from-orange-400 to-red-400"
    },
    { 
      value: "chocolates", 
      label: "Chocolates", 
      icon: <Heart className="w-5 h-5" />,
      description: "Premium chocolates",
      gradient: "from-rose-400 to-pink-400"
    },
  ];
  
  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-pink-400/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-6 right-12 animate-bounce delay-100">
            <Sparkles className="w-6 h-6 text-yellow-400 opacity-60" />
          </div>
          <div className="absolute bottom-8 left-16 animate-bounce delay-300">
            <Heart className="w-5 h-5 text-red-400 opacity-50" />
          </div>
          <div className="absolute top-12 left-1/4 animate-bounce delay-500">
            <Star className="w-4 h-4 text-purple-400 opacity-70" />
          </div>
        </div>
        
        <div className={`relative z-10 px-8 py-16 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <Cake className="w-5 h-5 text-orange-500" />
            <span className="text-gray-700 font-medium">Handcrafted Daily</span>
          </div>
          
          <h1 className="font-poppins font-bold text-4xl md:text-6xl mb-4 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Our Delicious Products
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover our artisanal collection of handcrafted treats, made with premium ingredients and traditional techniques passed down through generations.
          </p>
        </div>
      </div>
      
      {/* Enhanced Category Filters */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="font-poppins font-bold text-2xl md:text-3xl mb-2 text-gray-800">
            Explore Our Categories
          </h2>
          <p className="text-gray-600">Each category tells its own delicious story</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                currentCategory === category.value 
                  ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-pink-50 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-md'
              } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 bg-gradient-to-r ${category.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {category.icon}
              </div>
              <div className="text-left">
                <h3 className={`font-semibold text-sm mb-1 transition-colors duration-300 ${
                  currentCategory === category.value ? 'text-orange-700' : 'text-gray-800 group-hover:text-orange-600'
                }`}>
                  {category.label}
                </h3>
                <p className="text-xs text-gray-500 leading-tight">{category.description}</p>
              </div>
              
              {currentCategory === category.value && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/10 to-pink-400/10 pointer-events-none">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Enhanced Sort and Filter Options */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-orange-500" />
              <span className="text-gray-700 font-medium">
                {filteredProducts.length} delicious {filteredProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
            
            {currentCategory !== 'all' && (
              <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full">
                <span className="text-orange-700 text-sm font-medium">
                  Filtering by: {categories.find(c => c.value === currentCategory)?.label}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <label htmlFor="sort" className="text-sm text-gray-600 font-medium">Sort by:</label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="w-[180px] border-gray-200 focus:border-orange-400 focus:ring-orange-400/20">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">✨ Popularity</SelectItem>
                  <SelectItem value="price-low-high">💰 Price: Low to High</SelectItem>
                  <SelectItem value="price-high-low">💎 Price: High to Low</SelectItem>
                  <SelectItem value="name-a-z">🔤 Name: A to Z</SelectItem>
                  <SelectItem value="name-z-a">🔤 Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Product Grid */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-orange-500" />
            <div className="absolute inset-0 h-16 w-16 animate-ping bg-orange-400 rounded-full opacity-20"></div>
          </div>
          <p className="mt-6 text-gray-600 text-lg">Preparing our delicious treats...</p>
          <div className="flex space-x-2 mt-4">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      ) : paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {paginatedProducts.map((product, index) => (
            <div 
              key={product.id} 
              className={`transition-all duration-500 transform hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cake className="w-12 h-12 text-orange-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No treats found</h3>
          <p className="text-lg text-gray-600 mb-6">
            We don't have any products in this category yet, but our bakers are working on something special!
          </p>
          <Button 
            onClick={() => handleCategoryChange('all')}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Browse All Products
          </Button>
        </div>
      )}
      
      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">
              Page {currentPage} of {totalPages}
            </h3>
            <p className="text-gray-500 text-sm">
              Showing {(currentPage - 1) * PRODUCTS_PER_PAGE + 1} - {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
            </p>
          </div>
          
          <Pagination>
            <PaginationContent className="flex justify-center">
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={`${
                    currentPage === 1 
                      ? "pointer-events-none opacity-50" 
                      : "cursor-pointer hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300"
                  } transition-all duration-300`}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`transition-all duration-300 ${
                      currentPage === i + 1
                        ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white border-orange-500 shadow-lg"
                        : "hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300"
                    }`}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={`${
                    currentPage === totalPages 
                      ? "pointer-events-none opacity-50" 
                      : "cursor-pointer hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300"
                  } transition-all duration-300`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </AppLayout>
  );
};

export default Products;
