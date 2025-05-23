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
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
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
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    console.log('Initializing auth state:', {
      hasStoredToken: !!storedToken,
      tokenValue: storedToken
    });
    
    if (storedToken) {
      setToken(storedToken);
      
      // Fetch user data
      fetchCurrentUser(storedToken)
        .then(userData => {
          console.log('Fetched user data:', {
            id: userData.id,
            email: userData.email,
            role: userData.role
          });
          setUser(userData);
        })
        .catch(err => {
          console.error("Failed to fetch user data:", err);
          localStorage.removeItem("authToken");
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);
  
  // Set up token getter
  useEffect(() => {
    console.log('Setting up token getter');
    setTokenGetter(() => {
      const storedToken = localStorage.getItem("authToken");
      console.log('Token getter called, returning:', {
        hasToken: !!storedToken,
        tokenValue: storedToken
      });
      return storedToken;
    });
  }, [token]);
  
  const fetchCurrentUser = async (authToken: string): Promise<User> => {
    try {
      const res = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        credentials: "include"
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
      
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await res.json();
      console.log('Login successful:', {
        userId: data.user.id,
        role: data.user.role,
        hasToken: !!data.token
      });
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("authToken", data.token);
      
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
      
      const res = await apiRequest("POST", "/api/auth/register", userData);
      const data = await res.json();
      
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("authToken", data.token);
      
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
  
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    
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
        token,
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
