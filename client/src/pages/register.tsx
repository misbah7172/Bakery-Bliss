import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Star, Crown, Sparkles, Upload, User } from "lucide-react";
import Logo from "@/components/ui/logo";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    profileImage: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { register, loading, error, user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      // Redirect based on user role
      switch (user.role) {
        case "customer":
          navigate("/dashboard/customer");
          break;
        case "junior_baker":
          navigate("/dashboard/junior-baker");
          break;
        case "main_baker":
          navigate("/dashboard/main-baker");
          break;
        case "admin":
          navigate("/dashboard/admin");
          break;
        default:
          navigate("/");
      }
    }
  }, [user, loading, navigate]);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-accent to-primary/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground/70">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  // Don't render register form if user is authenticated
  if (user) {
    return null; // Will redirect in useEffect
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear password error when either password field changes
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }
      
      // Resize and compress image
      resizeImage(file, 300, 300, 0.8).then(base64String => {
        setImagePreview(base64String);
        setFormData(prev => ({
          ...prev,
          profileImage: base64String
        }));
      }).catch(error => {
        console.error('Error processing image:', error);
        alert("Error processing image. Please try another file.");
      });
    }
  };

  const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const base64String = canvas.toDataURL('image/jpeg', quality);
        resolve(base64String);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    // Check password strength
    if (formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    
    // Register user
    await register({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      fullName: formData.fullName,
      profileImage: formData.profileImage
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 right-20 animate-bounce delay-100">
          <Star className="w-6 h-6 text-pink-400 opacity-60" />
        </div>
        <div className="absolute bottom-24 left-16 animate-bounce delay-300">
          <Crown className="w-5 h-5 text-purple-400 opacity-50" />
        </div>
        <div className="absolute top-1/3 left-20 animate-bounce delay-500">
          <Sparkles className="w-4 h-4 text-blue-400 opacity-70" />
        </div>
        <div className="absolute bottom-1/3 right-24 animate-bounce delay-700">
          <Star className="w-5 h-5 text-purple-400 opacity-60" />
        </div>
      </div>

      <Card className="w-full max-w-md relative z-10 bg-gradient-to-br from-white/95 to-purple-50/80 backdrop-blur-sm border-purple-200 shadow-2xl">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          
          <h2 className="text-3xl font-poppins font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 text-center">
            Create Your Account 🎂
          </h2>
          <p className="text-purple-600 mb-6 text-center font-medium">
            Join Bakery Bliss and start your sweet journey
          </p>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 p-4 rounded-xl mb-6 text-sm border border-red-200 shadow-md">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Profile Image Upload */}
              <div className="text-center">
                <label className="block text-sm font-semibold text-purple-700 mb-3">
                  Profile Picture (Optional) 📸
                </label>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-purple-200 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-3 overflow-hidden">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-purple-400" />
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profileImage"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Photo
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-purple-700 mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder=""
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-purple-700 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder=""
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-purple-700 mb-2">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder=""
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-purple-700 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-purple-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm"
                />
                {passwordError && (
                  <p className="text-red-500 text-xs mt-2 bg-red-50 p-2 rounded-lg">{passwordError}</p>
                )}
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Join the Bakery Family! 🎉"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-purple-600">
              Already have an account?{" "}
              <Link href="/login">
                <a className="text-pink-600 hover:text-pink-800 font-bold transition-colors">
                  Welcome Back! 🍰
                </a>
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link href="/">
              <a className="flex items-center justify-center text-purple-500 hover:text-purple-700 text-sm transition-colors font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Landing Page
              </a>
            </Link>
          </div>
          
          <div className="mt-6 pt-6 border-t border-purple-200 text-xs text-purple-600 text-center">
            By registering, you agree to our{" "}
            <Link href="/terms">
              <a className="text-pink-600 hover:text-pink-800 font-semibold">Terms of Service</a>
            </Link>{" "}
            and{" "}
            <Link href="/privacy">
              <a className="text-pink-600 hover:text-pink-800 font-semibold">Privacy Policy</a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
