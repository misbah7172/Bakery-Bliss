import React, { useEffect, useState } from 'react';
import { Cake, Cookie, Heart, Star, Sparkles, Coffee, Gift } from 'lucide-react';

const BakeryBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const floatingElements = [
    { icon: <Cake className="w-6 h-6" />, delay: '0s', duration: '8s', top: '10%', left: '10%' },
    { icon: <Cookie className="w-5 h-5" />, delay: '2s', duration: '10s', top: '20%', left: '80%' },
    { icon: <Heart className="w-4 h-4" />, delay: '4s', duration: '12s', top: '60%', left: '15%' },
    { icon: <Star className="w-5 h-5" />, delay: '1s', duration: '9s', top: '80%', left: '70%' },
    { icon: <Sparkles className="w-6 h-6" />, delay: '3s', duration: '11s', top: '30%', left: '60%' },
    { icon: <Coffee className="w-5 h-5" />, delay: '5s', duration: '13s', top: '70%', left: '30%' },
    { icon: <Gift className="w-4 h-4" />, delay: '6s', duration: '7s', top: '40%', left: '90%' },
    { icon: <Cake className="w-4 h-4" />, delay: '8s', duration: '14s', top: '90%', left: '50%' },
    { icon: <Cookie className="w-6 h-6" />, delay: '7s', duration: '6s', top: '50%', left: '5%' },
    { icon: <Heart className="w-5 h-5" />, delay: '9s', duration: '10s', top: '15%', left: '45%' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      {/* Enhanced Animated Gradient Overlay */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: 'linear-gradient(45deg, rgba(251, 146, 60, 0.2) 0%, rgba(236, 72, 153, 0.15) 25%, rgba(168, 85, 247, 0.1) 50%, rgba(245, 158, 11, 0.2) 75%, rgba(217, 70, 239, 0.15) 100%)',
          backgroundSize: '400% 400%',
          animation: 'bakery-gradient 20s ease infinite',
        }}
      ></div>
      
      {/* Floating Bakery Icons */}
      {floatingElements.map((element, index) => (
        <div
          key={index}
          className="absolute text-orange-400/40 animate-bounce"
          style={{
            top: element.top,
            left: element.left,
            animationDelay: element.delay,
            animationDuration: element.duration,
            fontSize: '1.5rem',
          }}
        >
          {element.icon}
        </div>
      ))}
      
      {/* Sparkle Effects */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-yellow-300/50 rounded-full animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Interactive Mouse Follower */}
      <div
        className="absolute w-20 h-20 pointer-events-none transition-all duration-1000 ease-out"
        style={{
          left: mousePosition.x - 40,
          top: mousePosition.y - 40,
          background: 'radial-gradient(circle, rgba(251, 146, 60, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: -1,
        }}
      />
      
      {/* Subtle Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          animation: 'float 20s ease-in-out infinite',
        }}
      />
    </div>
  );
};

export default BakeryBackground;
