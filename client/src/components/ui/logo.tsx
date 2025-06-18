import { Link } from "wouter";

interface LogoProps {
  size?: "small" | "medium" | "large";
  color?: "primary" | "white";
  noLink?: boolean;
}

const Logo = ({ size = "medium", color = "primary", noLink = false }: LogoProps) => {
  const sizeClasses = {
    small: "text-xl",
    medium: "text-2xl",
    large: "text-3xl"
  };
  
  const iconSizeClasses = {
    small: "w-8 h-8",
    medium: "w-10 h-10",
    large: "w-12 h-12"
  };
  
  const textColorClasses = {
    primary: "text-foreground",
    white: "text-white"
  };
  
  const bgColorClasses = {
    primary: "bg-primary",
    white: "bg-white"
  };
    const iconTextClasses = color === "primary" ? "text-white" : "text-primary";
  
  const logoContent = (
    <div className="flex items-center cursor-pointer">
      <div className={`${iconSizeClasses[size]} ${bgColorClasses[color]} rounded-xl flex items-center justify-center mr-2`}>
        <span className={`${iconTextClasses} font-poppins font-bold`}>BB</span>
      </div>
      <span className={`${sizeClasses[size]} ${textColorClasses[color]} font-poppins font-semibold`}>
        Bakery Bliss
      </span>
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
