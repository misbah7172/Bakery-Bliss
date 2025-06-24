import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import Logo from "@/components/ui/logo";
import CartIcon from "@/components/ui/cart-icon";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const [location] = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implementation for search would go here
  };    const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Custom Cake Builder", href: "/custom-cake-builder" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];
  
  const renderDesktopNav = () => (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className={`navbar-link ${
                location === link.href ? "text-primary" : "text-foreground"
              } hover:text-primary transition-colors cursor-pointer`}>
                {link.label}
              </div>
            </Link>
          ))}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <form onSubmit={handleSearch}>
              <Input
                type="text"
                placeholder="Search for delicious treats..."
                className="w-64 pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
          
          <CartIcon />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white">
                      {user.fullName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user.role === "customer" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/customer">
                      <a className="cursor-pointer w-full">Dashboard</a>
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "junior_baker" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/junior-baker">
                      <a className="cursor-pointer w-full">Baker Dashboard</a>
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "main_baker" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/main-baker">
                      <a className="cursor-pointer w-full">Main Baker Dashboard</a>
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/admin">
                      <a className="cursor-pointer w-full">Admin Dashboard</a>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="cursor-pointer w-full">Profile</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
  
  const renderMobileNav = () => (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        
        <div className="flex items-center space-x-3">
          <CartIcon />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6">
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search..."
                      className="pr-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </form>
                
                <div className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link href={link.href}>
                        <div className={`text-lg font-medium ${
                          location === link.href ? "text-primary" : "text-foreground"
                        } cursor-pointer`}>
                          {link.label}
                        </div>
                      </Link>
                    </SheetClose>
                  ))}
                  
                  {user ? (
                    <>
                      <div className="h-px bg-border my-2"></div>
                      
                      {user.role === "customer" && (
                        <SheetClose asChild>
                          <Link href="/dashboard/customer">
                            <div className="text-lg font-medium text-foreground cursor-pointer">Dashboard</div>
                          </Link>
                        </SheetClose>
                      )}
                      {user.role === "junior_baker" && (
                        <SheetClose asChild>
                          <Link href="/dashboard/junior-baker">
                            <div className="text-lg font-medium text-foreground cursor-pointer">Baker Dashboard</div>
                          </Link>
                        </SheetClose>
                      )}
                      {user.role === "main_baker" && (
                        <SheetClose asChild>
                          <Link href="/dashboard/main-baker">
                            <div className="text-lg font-medium text-foreground cursor-pointer">Main Baker Dashboard</div>
                          </Link>
                        </SheetClose>
                      )}
                      {user.role === "admin" && (
                        <SheetClose asChild>
                          <Link href="/dashboard/admin">
                            <div className="text-lg font-medium text-foreground cursor-pointer">Admin Dashboard</div>
                          </Link>
                        </SheetClose>
                      )}
                      
                      <SheetClose asChild>
                        <Link href="/profile">
                          <div className="text-lg font-medium text-foreground cursor-pointer">Profile</div>
                        </Link>
                      </SheetClose>
                      
                      {user.role === "customer" && (
                        <>
                          <SheetClose asChild>
                            <Link href="/orders">
                              <div className="text-lg font-medium text-foreground cursor-pointer">My Orders</div>
                            </Link>
                          </SheetClose>
                          
                          <SheetClose asChild>
                            <Link href="/chat">
                              <div className="text-lg font-medium text-foreground cursor-pointer">Chat</div>
                            </Link>
                          </SheetClose>
                        </>
                      )}
                      
                      <Button 
                        onClick={logout} 
                        variant="ghost" 
                        className="justify-start p-0 text-lg font-medium text-foreground hover:text-destructive"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Link href="/login">
                        <Button className="w-full bg-primary hover:bg-primary/90">Login</Button>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
  
  return isMobile ? renderMobileNav() : renderDesktopNav();
};

export default Navbar;
