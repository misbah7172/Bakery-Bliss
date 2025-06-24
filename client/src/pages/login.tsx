import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-r from-accent to-primary/20 flex items-center justify-center p-4">
      <div className="flex rounded-xl shadow-md overflow-hidden w-full max-w-4xl">
        {/* Login Form Side */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12">          <div className="mb-8">
            <Logo noLink />
          </div>
          
          <h2 className="text-2xl font-poppins font-semibold text-foreground mb-1">Welcome Back!</h2>
          <p className="text-foreground/70 mb-8">Enter your credentials to access your dashboard.</p>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="baker@bakerybliss.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
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
                className="w-full"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/forgot-password">
              <a className="text-primary hover:text-primary/80 text-sm font-medium">
                Forgot password?
              </a>
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-foreground/70">
              Don't have an account?{" "}
              <Link href="/register">
                <a className="text-primary hover:text-primary/80 font-medium">
                  Register
                </a>
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link href="/">
              <a className="flex items-center justify-center text-foreground/70 hover:text-foreground text-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Landing Page
              </a>
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-accent text-xs text-foreground/70 text-center">
            By clicking continue, you agree to our{" "}
            <Link href="/terms">
              <a className="text-primary hover:text-primary/80">Terms of Service</a>
            </Link>{" "}
            and{" "}
            <Link href="/privacy">
              <a className="text-primary hover:text-primary/80">Privacy Policy</a>
            </Link>
          </div>
        </div>
        
        {/* Testimonial Side */}
        <div className="hidden md:block md:w-1/2 bg-accent/20 p-12 relative">
          <div className="flex flex-col h-full justify-center">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm overflow-hidden">
                <img 
                  src="https://pixabay.com/get/g55e72a65bca82e86c3caefe3a7c1176dc9a46fe2c332a0c0689e061ea8701b4fd70f399012bc9ad1a0b1d8e475617fe08a4cc8434863a2c52945b2ca39cd0482_1280.jpg" 
                  alt="Baker portrait" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <blockquote className="italic text-foreground mb-4">
              "The Bakery Bliss Dashboard has revolutionized our bakery operations, making tasks clearer and communication seamless. It's like having a well-organized kitchen in the cloud!"
            </blockquote>
            
            <div>
              <p className="font-poppins font-semibold text-foreground">Sarah Jenkins</p>
              <p className="text-sm text-foreground/70">Founder of Bakery Bliss</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
