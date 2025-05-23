import { Link } from "wouter";
import Logo from "@/components/ui/logo";
import { InstagramIcon, FacebookIcon, TwitterIcon, Facebook } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for newsletter subscription would go here
    console.log("Subscribing email:", email);
    setEmail("");
  };
  
  return (
    <footer className="bg-foreground text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Logo color="white" />
            </div>
            <p className="text-sm opacity-80 mb-4">
              Creating delightful moments through our handcrafted baked goods since 2010.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <div className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors cursor-pointer">Home</div>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <div className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors cursor-pointer">About Us</div>
                </Link>
              </li>
              <li>
                <Link href="/products">
                  <div className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors cursor-pointer">Products</div>
                </Link>
              </li>
              <li>
                <Link href="/cake-builder">
                  <div className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors cursor-pointer">Custom Orders</div>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <div className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors cursor-pointer">Contact</div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold text-lg mb-4">Products</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=cakes">
                  <div className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors cursor-pointer">Cakes</div>
                </Link>
              </li>
              <li>
                <Link href="/products?category=pastries">
                  <div className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors cursor-pointer">Pastries</div>
                </Link>
              </li>
              <li>
                <Link href="/products?category=bread">
                  <div className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors cursor-pointer">Bread</div>
                </Link>
              </li>
              <li>
                <Link href="/products?category=cookies">
                  <div className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors cursor-pointer">Cookies</div>
                </Link>
              </li>
              <li>
                <Link href="/products?category=chocolates">
                  <div className="text-sm opacity-80 hover:opacity-100 hover:text-primary transition-colors cursor-pointer">Chocolates</div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm opacity-80">123 Sweet Street, Bakery District, BB 92010</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-sm opacity-80">(555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-sm opacity-80">hello@bakerybliss.com</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm opacity-80">Mon-Sat: 7am - 7pm<br/>Sunday: 8am - 4pm</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-80">&copy; {new Date().getFullYear()} Bakery Bliss. All rights reserved.</p>
          
          <form onSubmit={handleSubmit} className="mt-4 md:mt-0 flex w-full md:w-auto">
            <Input
              type="email"
              placeholder="Subscribe to newsletter..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-r-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" className="rounded-l-none">
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
