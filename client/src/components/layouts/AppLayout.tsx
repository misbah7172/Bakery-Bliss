import { ReactNode } from "react";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import Sidebar from "@/components/navigation/Sidebar";
import CartDrawer from "@/components/ui/cart-drawer";
import { useAuth } from "@/hooks/use-auth";

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  sidebarType?: "customer" | "junior" | "main" | "admin";
}

const AppLayout = ({ 
  children, 
  showSidebar = false, 
  sidebarType = "customer" 
}: AppLayoutProps) => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <CartDrawer />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-6">
          {showSidebar ? (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/5">
                <Sidebar type={sidebarType} />
              </div>
              <div className="md:w-4/5">
                {children}
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AppLayout;
