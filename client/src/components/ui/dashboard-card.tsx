import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  progress?: number;
  progressTarget?: number;
  iconColor?: string;
}

const DashboardCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon,
  progress,
  progressTarget,
  iconColor = "text-primary"
}: DashboardCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-poppins text-foreground/70">{title}</h3>
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
        </div>
        
        <p className="text-4xl font-poppins font-semibold text-foreground mb-2">{value}</p>
        
        {progress !== undefined && (
          <div className="w-full bg-accent/30 rounded-full h-2 mb-2">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {(description || progressTarget) && (
          <div className="flex justify-between text-xs">
            {progressTarget && <span className="text-foreground/70">Target {progressTarget}%</span>}
            {description && <span className="text-foreground/70">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
