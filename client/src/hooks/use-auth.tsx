import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest, setTokenGetter } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  role: "customer" | "junior_baker" | "main_baker" | "admin";
  profileImage?: string;
  customerSince?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Initialize auth state - check if user has valid session
  useEffect(() => {
    console.log('Initializing auth state');
    
    // Try to fetch current user to check if session is valid
    fetchCurrentUser()
      .then(userData => {
        console.log('Fetched user data:', {
          id: userData.id,
          email: userData.email,
          role: userData.role
        });
        setUser(userData);
      })
      .catch(err => {
        console.error("No valid session found:", err);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  // Set up token getter (legacy compatibility - returns null for session-based auth)
  useEffect(() => {
    console.log('Setting up token getter');
    setTokenGetter(() => {
      console.log('Token getter called, using session-based auth');
      return null;
    });
  }, []);
  
  const fetchCurrentUser = async (): Promise<User> => {
    try {
      const res = await fetch("/api/users/me", {
        credentials: "include" // Include session cookies
      });
      
      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      return await res.json();
    } catch (error) {
      throw error;
    }
  };
    const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include session cookies
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      const data = await response.json();
      console.log('Login successful:', {
        userId: data.user.id,
        role: data.user.role
      });
      
      setUser(data.user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.fullName}!`,
      });
      
      // Redirect based on role
      switch (data.user.role) {
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
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid credentials. Please try again.");
      
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
    const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include session cookies
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      
      const data = await response.json();
      
      setUser(data.user);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
      });
      
      navigate("/dashboard/customer");
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed. Please try again.");
      
      toast({
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
    const logout = async () => {
    try {
      // Call logout endpoint to destroy session
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    setUser(null);
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    
    navigate("/");
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
