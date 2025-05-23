import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CakeShape } from "@shared/schema";

interface ShapeSelectorProps {
  shapes: CakeShape[];
  selectedShape: CakeShape | null;
  onSelectShape: (shape: CakeShape) => void;
}

const ShapeSelector = ({ shapes, selectedShape, onSelectShape }: ShapeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
      {shapes.map((shape) => (
        <Card 
          key={shape.id}
          className={`border-2 transition-all cursor-pointer hover:shadow-md ${
            selectedShape?.id === shape.id ? 'border-primary' : 'border-accent hover:border-primary/60'
          }`}
          onClick={() => onSelectShape(shape)}
        >
          <CardContent className="p-4">
            <div className="h-48 flex items-center justify-center mb-3">
              {shape.name.toLowerCase().includes('round') ? (
                <div className={`${
                  shape.name.includes('6') ? 'h-32 w-32' : 'h-40 w-40'
                } rounded-full bg-accent flex items-center justify-center`}>
                  <span className="text-sm text-foreground font-medium">
                    {shape.name.includes('6') ? '6"' : '8"'}
                  </span>
                </div>
              ) : shape.name.toLowerCase().includes('square') ? (
                <div className={`${
                  shape.name.includes('6') ? 'h-32 w-32' : 'h-40 w-40'
                } bg-accent flex items-center justify-center`}>
                  <span className="text-sm text-foreground font-medium">
                    {shape.name.includes('6') ? '6"' : '8"'}
                  </span>
                </div>
              ) : (
                <div className="h-32 w-40 bg-accent flex items-center justify-center">
                  <span className="text-sm text-foreground font-medium">9"×13"</span>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <h3 className="font-poppins font-medium text-foreground">{shape.name}</h3>
              <p className="text-primary font-poppins font-medium mt-1">+${(30 * shape.priceMultiplier).toFixed(2)}</p>
              <p className="text-sm text-foreground/70 mt-1">{shape.servingSize}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ShapeSelector;
