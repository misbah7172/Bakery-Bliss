import { Link } from "wouter";
import { useEffect, useState } from "react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "white";
  noLink?: boolean;
}

const Logo = ({ size = "medium", color = "primary", noLink = false }: LogoProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  const sizeClasses = {
    small: "text-lg",
    medium: "text-xl",
    large: "text-2xl"
  };
  
  const iconSizeClasses = {
    small: "w-8 h-8",
    medium: "w-10 h-10",
    large: "w-12 h-12"
  };
  
  const textColorClasses = {
    primary: "text-gray-800",
    white: "text-white"
  };

  // Custom SVG Logo Component
  const CustomLogo = ({ className, fillColor }: { className: string; fillColor: string }) => (
    <svg
      viewBox="0 0 50 50"
      className={`${className} drop-shadow-lg`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Enhanced gradient definitions */}
        <linearGradient id="cakeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FF8A80', stopOpacity: 1 }} />
          <stop offset="30%" style={{ stopColor: '#FFB74D', stopOpacity: 1 }} />
          <stop offset="70%" style={{ stopColor: '#FF8A65', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#F48FB1', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="frostingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FFF3E0', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#FFECB3', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FFE0B2', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id="cherryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#E91E63', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#C2185B', stopOpacity: 1 }} />
        </linearGradient>
        
        <radialGradient id="shimmer" cx="50%" cy="30%" r="70%">
          <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#FFFFFF', stopOpacity: 0 }} />
        </radialGradient>
        
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#FF6B6B" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Cake Base - Bottom Layer with enhanced styling */}
      <ellipse cx="25" cy="42" rx="18" ry="4" fill="url(#cakeGradient)" opacity="0.9" />
      <rect x="7" y="35" width="36" height="8" rx="3" fill="url(#cakeGradient)" filter="url(#dropshadow)" />
      <ellipse cx="25" cy="35" rx="18" ry="2" fill="url(#shimmer)" />
      
      {/* Cake Base - Middle Layer */}
      <ellipse cx="25" cy="32" rx="15" ry="3" fill="url(#cakeGradient)" opacity="0.95" />
      <rect x="10" y="26" width="30" height="7" rx="2.5" fill="url(#cakeGradient)" filter="url(#dropshadow)" />
      <ellipse cx="25" cy="26" rx="15" ry="1.5" fill="url(#shimmer)" />
      
      {/* Cake Base - Top Layer */}
      <ellipse cx="25" cy="23" rx="12" ry="2.5" fill="url(#cakeGradient)" />
      <rect x="13" y="18" width="24" height="6" rx="2" fill="url(#cakeGradient)" filter="url(#dropshadow)" />
      <ellipse cx="25" cy="18" rx="12" ry="1.2" fill="url(#shimmer)" />
      
      {/* Enhanced Frosting Decorations */}
      <path d="M 8 35 Q 12 31 16 35 Q 20 31 24 35 Q 28 31 32 35 Q 36 31 40 35 Q 42 33 42 35" 
            stroke="url(#frostingGradient)" 
            strokeWidth="3" 
            fill="none" 
            opacity="0.9"
            strokeLinecap="round" />
      <path d="M 11 26 Q 15 22 19 26 Q 23 22 27 26 Q 31 22 35 26 Q 37 24 39 26" 
            stroke="url(#frostingGradient)" 
            strokeWidth="2.5" 
            fill="none" 
            opacity="0.9"
            strokeLinecap="round" />
      
      {/* Enhanced Cherry on Top */}
      <circle cx="25" cy="15" r="3.5" fill="url(#cherryGradient)" filter="url(#glow)" />
      <ellipse cx="24" cy="13.5" rx="1" ry="0.8" fill="#FF6B9D" opacity="0.6" />
      <path d="M 25 11 Q 22 6 19 7 Q 21 8 23 10 L 24 11" 
            stroke="#4CAF50" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round" />
      <path d="M 26 11 Q 28 8 30 7 Q 29 8 27 9" 
            stroke="#4CAF50" 
            strokeWidth="1.5" 
            fill="none"
            strokeLinecap="round" />
      
      {/* Enhanced Sparkle Effects with animation */}
      <g opacity="0.8">
        <g className="animate-pulse">
          <path d="M 15 20 L 16 17 L 17 20 L 16 23 Z" fill="#FFD700" transform="rotate(45 16 20)" />
          <path d="M 16 18 L 16 22 M 14 20 L 18 20" stroke="#FFEB3B" strokeWidth="0.5" />
        </g>
        
        <g className="animate-pulse" style={{ animationDelay: '0.5s' }}>
          <path d="M 35 28 L 36 25 L 37 28 L 36 31 Z" fill="#FFD700" transform="rotate(45 36 28)" />
          <path d="M 36 26 L 36 30 M 34 28 L 38 28" stroke="#FFEB3B" strokeWidth="0.5" />
        </g>
        
        <g className="animate-pulse" style={{ animationDelay: '1s' }}>
          <path d="M 12 40 L 13 37 L 14 40 L 13 43 Z" fill="#FFD700" transform="rotate(45 13 40)" />
          <path d="M 13 38 L 13 42 M 11 40 L 15 40" stroke="#FFEB3B" strokeWidth="0.5" />
        </g>
        
        <circle cx="38" cy="20" r="1.5" fill="#FFD700" className="animate-ping" />
        <circle cx="8" cy="30" r="1.2" fill="#FFEB3B" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
      </g>
      
      {/* Enhanced decorative elements */}
      <circle cx="20" cy="30" r="2" fill="#FFE4E1" opacity="0.9" />
      <circle cx="19.5" cy="29" r="0.8" fill="#FFF" opacity="0.6" />
      
      <circle cx="30" cy="38" r="2" fill="#FFE4E1" opacity="0.9" />
      <circle cx="29.5" cy="37" r="0.8" fill="#FFF" opacity="0.6" />
      
      <circle cx="18" cy="25" r="1.2" fill="#FFC0CB" opacity="0.8" />
      <circle cx="32" cy="33" r="1.2" fill="#FFC0CB" opacity="0.8" />
      
      {/* Additional sweet details */}
      <path d="M 22 38 Q 25 36 28 38" stroke="#FFB6C1" strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round" />
      <path d="M 16 28 Q 19 26 22 28" stroke="#FFB6C1" strokeWidth="1.2" fill="none" opacity="0.7" strokeLinecap="round" />
    </svg>
  );
  
  const logoContent = (
    <div className={`flex items-center cursor-pointer group transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className={`${iconSizeClasses[size]} mr-3 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
        <CustomLogo 
          className={`${iconSizeClasses[size]} object-contain`}
          fillColor={color === "white" ? "white" : "#FF6B6B"}
        />
      </div>
      <div className="flex flex-col">
        <span className={`${sizeClasses[size]} ${textColorClasses[color]} font-poppins font-bold tracking-wide transition-all duration-300 group-hover:text-orange-500`}>
          <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Bakery
          </span>
          <span className="ml-1">Bliss</span>
        </span>
        <span className={`text-xs ${color === "white" ? "text-white/80" : "text-orange-500"} font-medium tracking-widest uppercase transition-all duration-300 group-hover:tracking-wider`}>
          ✨ Artisan Bakery ✨
        </span>
      </div>
    </div>
  );
  
  if (noLink) {
    return logoContent;
  }
  
  return (
    <Link href="/">
      {logoContent}
    </Link>
  );
};

export default Logo;
