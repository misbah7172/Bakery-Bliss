import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  initials: string;
  rating?: number;
  color?: "primary" | "secondary" | "accent";
}

const TestimonialCard = ({ 
  quote, 
  author, 
  role, 
  initials, 
  rating = 5,
  color = "primary" 
}: TestimonialCardProps) => {
  
  const bgColorClasses = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    accent: "bg-accent text-foreground"
  };
  
  return (
    <Card className="bg-white h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={`star-${i}`} className="h-5 w-5 text-primary fill-primary" />
          ))}
        </div>
        
        <p className="text-foreground italic mb-6 flex-grow">{quote}</p>
        
        <div className="flex items-center">
          <Avatar className={`w-10 h-10 ${bgColorClasses[color]} mr-3`}>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-poppins font-medium text-foreground">{author}</h4>
            {role && (
              <p className="text-sm text-foreground/70">{role}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
