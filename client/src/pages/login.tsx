import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Star, Crown, Sparkles } from "lucide-react";
import Logo from "@/components/ui/logo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, user } = useAuth();
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
  
  // Don't render login form if user is authenticated
  if (user) {
    return null; // Will redirect in useEffect
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-20 animate-bounce delay-100">
          <Star className="w-8 h-8 text-pink-400 opacity-60" />
        </div>
        <div className="absolute bottom-20 left-16 animate-bounce delay-300">
          <Crown className="w-6 h-6 text-purple-400 opacity-50" />
        </div>
        <div className="absolute top-32 left-1/4 animate-bounce delay-500">
          <Sparkles className="w-5 h-5 text-blue-400 opacity-70" />
        </div>
        <div className="absolute bottom-32 right-1/3 animate-bounce delay-700">
          <Star className="w-4 h-4 text-purple-400 opacity-60" />
        </div>
      </div>

      <div className="flex rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl relative z-10 backdrop-blur-sm bg-white/95">
        {/* Login Form Side */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-white to-purple-50/30 p-8 md:p-12">
          <div className="mb-8">
            <Logo noLink />
          </div>
          
          <h2 className="text-3xl font-poppins font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Welcome Back! 🎉
          </h2>
          <p className="text-purple-600 mb-8 font-medium">Enter your credentials to access your sweet dashboard.</p>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 p-4 rounded-xl mb-6 text-sm border border-red-200 shadow-md">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-semibold text-purple-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="baker@bakerybliss.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-purple-700">
                  Password
                </label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white/80 backdrop-blur-sm"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login to Your Sweet Dashboard"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/forgot-password">
              <a className="text-purple-600 hover:text-purple-800 text-sm font-semibold transition-colors">
                Forgot password? 🔑
              </a>
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-purple-600">
              Don't have an account?{" "}
              <Link href="/register">
                <a className="text-pink-600 hover:text-pink-800 font-bold transition-colors">
                  Join the Bakery! 🍰
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
          
          <div className="mt-8 pt-6 border-t border-purple-200 text-xs text-purple-600 text-center">
            By clicking continue, you agree to our{" "}
            <Link href="/terms">
              <a className="text-pink-600 hover:text-pink-800 font-semibold">Terms of Service</a>
            </Link>{" "}
            and{" "}
            <Link href="/privacy">
              <a className="text-pink-600 hover:text-pink-800 font-semibold">Privacy Policy</a>
            </Link>
          </div>
        </div>
        
        {/* Testimonial Side */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 p-12 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 animate-pulse">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <div className="absolute bottom-20 right-10 animate-pulse delay-1000">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div className="absolute top-1/2 left-1/4 animate-pulse delay-500">
              <Star className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex flex-col h-full justify-center relative z-10">
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full bg-white shadow-xl overflow-hidden border-4 border-white/50 flex items-center justify-center">
                <Logo size="medium" color="primary" noLink={true} />
              </div>
            </div>
            
            <blockquote className="italic text-white text-lg mb-6 leading-relaxed">
              "The Bakery Bliss Dashboard has revolutionized our bakery operations, making tasks clearer and communication seamless. It's like having a well-organized kitchen in the cloud! 🍰✨"
            </blockquote>
            
            <div>
              <p className="font-poppins font-bold text-white text-xl">MD. Habibullah Misbah</p>
              <p className="text-white/90 font-medium">👑 Founder of Bakery Bliss</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
