import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MessageCircle,
  Settings,
  UserCircle,
  LogOut,
  ClipboardList,
  User,
  Sliders,
} from "lucide-react";

interface SidebarProps {
  type: "customer" | "junior" | "main" | "admin";
}

const Sidebar = ({ type }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
    const sidebarLinks = {
    customer: [
      { label: "Dashboard", href: "/dashboard/customer", icon: LayoutDashboard },
      { label: "Order Status", href: "/dashboard/customer/orders", icon: ShoppingBag },
      { label: "Saved Designs", href: "/dashboard/customer/saved", icon: Heart },
      { label: "Chat", href: "/dashboard/customer/chat", icon: MessageCircle },
      { label: "Account Settings", href: "/dashboard/customer/settings", icon: Settings },
    ],
    junior: [
      { label: "Dashboard", href: "/dashboard/junior-baker", icon: LayoutDashboard },
      { label: "My Tasks", href: "/dashboard/junior-baker/tasks", icon: ClipboardList },
      { label: "Chat", href: "/dashboard/junior-baker/chat", icon: MessageCircle },
      { label: "Completed Orders", href: "/dashboard/junior-baker/completed", icon: ShoppingBag },
    ],    main: [
      { label: "Dashboard", href: "/dashboard/main-baker", icon: LayoutDashboard },
      { label: "My Products", href: "/dashboard/main-baker/products", icon: ShoppingBag },
      { label: "Order Management", href: "/dashboard/main-baker/orders", icon: ClipboardList },
      { label: "Baker Management", href: "/dashboard/main-baker/bakers", icon: User },
      { label: "Quality Control", href: "/dashboard/main-baker/quality", icon: Sliders },
      { label: "Chat", href: "/dashboard/main-baker/chat", icon: MessageCircle },
    ],
    admin: [
      { label: "Admin Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      { label: "User Management", href: "/dashboard/admin/users", icon: User },
      { label: "Baker Applications", href: "/dashboard/admin/applications", icon: ClipboardList },
      { label: "System Settings", href: "/dashboard/admin/settings", icon: Sliders },
      { label: "Reports", href: "/dashboard/admin/reports", icon: ShoppingBag },
    ],
  };
    const getRoleDisplayName = () => {
    if (!user) return "";
    
    switch (user.role) {
      case 'customer': return `Customer since ${user.customerSince || new Date().getFullYear()}`;
      case 'junior_baker': return "Junior Baker";
      case 'main_baker': return "Main Baker";
      case 'admin': return "Administrator";
      default: return user.role;
    }
  };

  const links = sidebarLinks[type];
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
      {user && (
        <div className="p-4 border-b border-accent flex flex-col items-center mb-4">
          <Avatar className="w-12 h-12 mb-2">
            <AvatarFallback className="bg-primary text-white">
              {user.fullName.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <h2 className="font-medium">{user.fullName}</h2>
          <p className="text-xs text-foreground/70">{getRoleDisplayName()}</p>
        </div>
      )}
        <div className="flex flex-col space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          
          return (
            <Link key={link.href} href={link.href}>
              <div className={`flex items-center py-2 px-4 rounded-lg cursor-pointer ${
                isActive 
                  ? "bg-primary text-white" 
                  : "text-foreground hover:bg-accent hover:bg-opacity-30 transition-all"
              } font-poppins`}>
                <Icon className={`h-5 w-5 mr-3 ${isActive ? "text-white" : ""}`} />
                <span className="text-sm">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-accent">        <div className="flex flex-col space-y-1">
          <Link href="/profile">
            <div className="flex items-center py-2 px-4 rounded-lg text-foreground hover:bg-accent hover:bg-opacity-30 transition-all font-poppins cursor-pointer">
              <UserCircle className="h-5 w-5 mr-3" />
              <span className="text-sm">Profile</span>
            </div>
          </Link>
          <Link href="/settings">
            <div className="flex items-center py-2 px-4 rounded-lg text-foreground hover:bg-accent hover:bg-opacity-30 transition-all font-poppins cursor-pointer">
              <Settings className="h-5 w-5 mr-3" />
              <span className="text-sm">Settings</span>
            </div>
          </Link>
          <Button 
            onClick={logout}
            variant="ghost" 
            className="flex items-center justify-start py-2 px-4 rounded-lg text-destructive hover:bg-destructive hover:bg-opacity-10 transition-all font-poppins"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="text-sm">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
