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
      { label: "Junior Baker Dashboard", href: "/dashboard/junior-baker", icon: LayoutDashboard },
      { label: "Main Baker Dashboard", href: "/dashboard/main-baker", icon: ClipboardList },
      { label: "Admin Dashboard", href: "/dashboard/admin", icon: User },
    ],
    main: [
      { label: "Junior Baker Dashboard", href: "/dashboard/junior-baker", icon: User },
      { label: "Main Baker Dashboard", href: "/dashboard/main-baker", icon: LayoutDashboard },
      { label: "Admin Dashboard", href: "/dashboard/admin", icon: Sliders },
    ],
    admin: [
      { label: "Junior Baker Dashboard", href: "/dashboard/junior-baker", icon: User },
      { label: "Main Baker Dashboard", href: "/dashboard/main-baker", icon: ClipboardList },
      { label: "Admin Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    ],
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
          <p className="text-xs text-foreground/70">{
            type === "customer" 
              ? `Customer since ${user.customerSince || new Date().getFullYear()}`
              : type === "junior"
                ? "Junior Baker"
                : type === "main"
                  ? "Main Baker"
                  : "Administrator"
          }</p>
        </div>
      )}
      
      <div className="flex flex-col space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          
          return (
            <Link key={link.href} href={link.href}>
              <a className={`flex items-center py-2 px-4 rounded-lg ${
                isActive 
                  ? "bg-primary text-white" 
                  : "text-foreground hover:bg-accent hover:bg-opacity-30 transition-all"
              } font-poppins`}>
                <Icon className={`h-5 w-5 mr-3 ${isActive ? "text-white" : ""}`} />
                <span className="text-sm">{link.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-accent">
        <div className="flex flex-col space-y-1">
          <Link href="/profile">
            <a className="flex items-center py-2 px-4 rounded-lg text-foreground hover:bg-accent hover:bg-opacity-30 transition-all font-poppins">
              <UserCircle className="h-5 w-5 mr-3" />
              <span className="text-sm">Profile</span>
            </a>
          </Link>
          <Link href="/settings">
            <a className="flex items-center py-2 px-4 rounded-lg text-foreground hover:bg-accent hover:bg-opacity-30 transition-all font-poppins">
              <Settings className="h-5 w-5 mr-3" />
              <span className="text-sm">Settings</span>
            </a>
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
