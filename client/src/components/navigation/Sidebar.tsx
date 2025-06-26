import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-purple-100 p-6 sticky top-24 backdrop-blur-sm">
      {user && (
        <div className="p-4 border-b border-purple-200 flex flex-col items-center mb-6 bg-white/50 rounded-xl backdrop-blur-sm">
          <Avatar className="w-16 h-16 mb-3 shadow-lg border-2 border-white">
            {user.profileImage && (
              <AvatarImage 
                src={user.profileImage} 
                alt={user.fullName}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg font-semibold">
              {user.fullName.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <h2 className="font-semibold text-gray-800 text-lg">{user.fullName}</h2>
          <p className="text-sm text-purple-600 font-medium">{getRoleDisplayName()}</p>
        </div>
      )}
        <div className="flex flex-col space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          
          return (
            <Link key={link.href} href={link.href}>
              <div className={`flex items-center py-3 px-4 rounded-xl cursor-pointer transition-all duration-200 ${
                isActive 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-[1.02]" 
                  : "text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-[1.01] bg-white/30"
              } font-poppins font-medium`}>
                <Icon className={`h-5 w-5 mr-3 ${isActive ? "text-white" : "text-purple-600"}`} />
                <span className="text-sm">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-purple-200">
        <div className="flex flex-col space-y-2">
          <Link href="/profile">
            <div className="flex items-center py-3 px-4 rounded-xl text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-[1.01] transition-all duration-200 font-poppins font-medium cursor-pointer bg-white/30">
              <UserCircle className="h-5 w-5 mr-3 text-purple-600" />
              <span className="text-sm">Profile</span>
            </div>
          </Link>
          <Link href="/settings">
            <div className="flex items-center py-3 px-4 rounded-xl text-gray-700 hover:bg-white/60 hover:shadow-md hover:scale-[1.01] transition-all duration-200 font-poppins font-medium cursor-pointer bg-white/30">
              <Settings className="h-5 w-5 mr-3 text-purple-600" />
              <span className="text-sm">Settings</span>
            </div>
          </Link>
          <Button 
            onClick={logout}
            variant="ghost" 
            className="flex items-center justify-start py-3 px-4 rounded-xl text-red-600 hover:bg-red-50 hover:shadow-md hover:scale-[1.01] transition-all duration-200 font-poppins font-medium bg-white/30"
          >
            <LogOut className="h-5 w-5 mr-3 text-red-500" />
            <span className="text-sm">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
