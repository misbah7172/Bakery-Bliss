import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/hooks/use-cart";
import ShapeSelector from "@/components/ui/shape-selector";
import { Loader2 } from "lucide-react";
import { 
  CakeShape,
  CakeFlavor,
  CakeFrosting,
  CakeDecoration 
} from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const BASE_PRICE = 20.00;

const CakeBuilder = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedShape, setSelectedShape] = useState<CakeShape | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<CakeFlavor | null>(null);
  const [selectedFrosting, setSelectedFrosting] = useState<CakeFrosting | null>(null);
  const [selectedDecoration, setSelectedDecoration] = useState<CakeDecoration | null>(null);
  const [cakeMessage, setCakeMessage] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate total price
  const calculateTotalPrice = () => {
    let total = BASE_PRICE;
    
    if (selectedShape) {
      total += 30 * selectedShape.priceMultiplier;
    }
    
    if (selectedFlavor) {
      total += selectedFlavor.additionalPrice;
    }
    
    if (selectedFrosting) {
      total += selectedFrosting.additionalPrice;
    }
    
    if (selectedDecoration) {
      total += selectedDecoration.additionalPrice;
    }
    
    return total;
  };
  
  const totalPrice = calculateTotalPrice();
  
  // Fetch cake options
  const { data: shapes = [], isLoading: shapesLoading } = useQuery<CakeShape[]>({
    queryKey: ['/api/cake-builder/shapes'],
  });
  
  const { data: flavors = [], isLoading: flavorsLoading } = useQuery<CakeFlavor[]>({
    queryKey: ['/api/cake-builder/flavors'],
  });
  
  const { data: frostings = [], isLoading: frostingsLoading } = useQuery<CakeFrosting[]>({
    queryKey: ['/api/cake-builder/frostings'],
  });
  
  const { data: decorations = [], isLoading: decorationsLoading } = useQuery<CakeDecoration[]>({
    queryKey: ['/api/cake-builder/decorations'],
  });
  
  // Set default selections when data loads
  useEffect(() => {
    if (shapes.length > 0 && !selectedShape) {
      setSelectedShape(shapes[0]);
    }
  }, [shapes, selectedShape]);
  
  useEffect(() => {
    if (flavors.length > 0 && !selectedFlavor) {
      setSelectedFlavor(flavors[0]);
    }
  }, [flavors, selectedFlavor]);
  
  useEffect(() => {
    if (frostings.length > 0 && !selectedFrosting) {
      setSelectedFrosting(frostings[0]);
    }
  }, [frostings, selectedFrosting]);
  
  useEffect(() => {
    if (decorations.length > 0 && !selectedDecoration) {
      setSelectedDecoration(decorations[0]);
    }
  }, [decorations, selectedDecoration]);
  
  // Handle step navigation
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Handle form submission
  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add custom cakes to cart",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    if (!selectedShape || !selectedFlavor || !selectedFrosting) {
      toast({
        title: "Incomplete Selection",
        description: "Please complete all required selections",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const customCakeData = {
        userId: user.id,
        name: "Custom Cake",
        shapeId: selectedShape.id,
        flavorId: selectedFlavor.id,
        frostingId: selectedFrosting.id,
        decorationId: selectedDecoration?.id,
        message: cakeMessage,
        specialInstructions,
        totalPrice,
        isSaved: false
      };
      
      const response = await apiRequest("POST", "/api/cake-builder", customCakeData);
      const customCake = await response.json();
      
      // Add to cart
      addToCart(customCake, 1, true);
      
      toast({
        title: "Success!",
        description: "Your custom cake has been added to cart",
      });
      
      // Reset form
      setCurrentStep(1);
      setSelectedShape(shapes[0]);
      setSelectedFlavor(flavors[0]);
      setSelectedFrosting(frostings[0]);
      setSelectedDecoration(decorations[0]);
      setCakeMessage("");
      setSpecialInstructions("");
    } catch (error) {
      console.error("Error creating custom cake:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your custom cake",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if any required data is loading
  const isLoading = shapesLoading || flavorsLoading || frostingsLoading || decorationsLoading;
  
  // Determine if the cake is complete
  const isCakeComplete = selectedShape && selectedFlavor && selectedFrosting;
  
  // Handle flavor selection
  const handleFlavorSelect = (flavor: CakeFlavor) => {
    setSelectedFlavor(flavor);
  };
  
  // Handle frosting selection
  const handleFrostingSelect = (frosting: CakeFrosting) => {
    setSelectedFrosting(frosting);
  };
  
  // Handle decoration selection
  const handleDecorationSelect = (decoration: CakeDecoration) => {
    setSelectedDecoration(decoration);
  };
  
  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-poppins font-semibold text-foreground mb-2">
          Design Your Custom Cake
        </h1>
        <p className="text-foreground/70 mb-6">
          Build the perfect cake for your special occasion, exactly how you want it.
        </p>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Builder Steps */}
          <div className="lg:w-2/3">
            {/* Step Navigation */}
            <div className="flex mb-8">
              <div 
                className={`step-nav w-1/4 text-center py-3 rounded-l-lg font-poppins cursor-pointer ${
                  currentStep === 1 ? 'bg-primary text-white' : 'bg-background'
                }`}
                onClick={() => setCurrentStep(1)}
              >
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 mb-1 rounded-full ${
                    currentStep === 1 
                      ? 'bg-white text-primary border-2 border-white' 
                      : 'bg-white text-foreground/70 border-2 border-accent'
                  } flex items-center justify-center`}>1</div>
                  <span className="text-sm">Shape & Size</span>
                </div>
              </div>
              
              <div 
                className={`step-nav w-1/4 text-center py-3 font-poppins cursor-pointer ${
                  currentStep === 2 ? 'bg-primary text-white' : 'bg-background'
                }`}
                onClick={() => setCurrentStep(2)}
              >
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 mb-1 rounded-full ${
                    currentStep === 2 
                      ? 'bg-white text-primary border-2 border-white' 
                      : 'bg-white text-foreground/70 border-2 border-accent'
                  } flex items-center justify-center`}>2</div>
                  <span className="text-sm">Flavor</span>
                </div>
              </div>
              
              <div 
                className={`step-nav w-1/4 text-center py-3 font-poppins cursor-pointer ${
                  currentStep === 3 ? 'bg-primary text-white' : 'bg-background'
                }`}
                onClick={() => setCurrentStep(3)}
              >
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 mb-1 rounded-full ${
                    currentStep === 3 
                      ? 'bg-white text-primary border-2 border-white' 
                      : 'bg-white text-foreground/70 border-2 border-accent'
                  } flex items-center justify-center`}>3</div>
                  <span className="text-sm">Frosting</span>
                </div>
              </div>
              
              <div 
                className={`step-nav w-1/4 text-center py-3 rounded-r-lg font-poppins cursor-pointer ${
                  currentStep === 4 ? 'bg-primary text-white' : 'bg-background'
                }`}
                onClick={() => setCurrentStep(4)}
              >
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 mb-1 rounded-full ${
                    currentStep === 4 
                      ? 'bg-white text-primary border-2 border-white' 
                      : 'bg-white text-foreground/70 border-2 border-accent'
                  } flex items-center justify-center`}>4</div>
                  <span className="text-sm">Decorations</span>
                </div>
              </div>
            </div>
            
            {/* Current Step Content */}
            <Card className="mb-8">
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Step 1: Shape & Size */}
                    {currentStep === 1 && (
                      <div>
                        <h2 className="text-xl font-poppins font-semibold text-foreground mb-4">
                          Step 1: Choose Your Cake Shape & Size
                        </h2>
                        
                        <ShapeSelector 
                          shapes={shapes}
                          selectedShape={selectedShape}
                          onSelectShape={setSelectedShape}
                        />
                      </div>
                    )}
                    
                    {/* Step 2: Flavor */}
                    {currentStep === 2 && (
                      <div>
                        <h2 className="text-xl font-poppins font-semibold text-foreground mb-4">
                          Step 2: Choose Your Cake Flavor
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {flavors.map((flavor) => (
                            <Card 
                              key={flavor.id}
                              className={`border-2 transition-all cursor-pointer hover:shadow-md ${
                                selectedFlavor?.id === flavor.id ? 'border-primary' : 'border-accent hover:border-primary/60'
                              }`}
                              onClick={() => handleFlavorSelect(flavor)}
                            >
                              <CardContent className="p-4">
                                <div className="h-24 flex items-center justify-center mb-3">
                                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                                    <span className="text-sm text-foreground font-medium">{flavor.name.charAt(0)}</span>
                                  </div>
                                </div>
                                
                                <div className="text-center">
                                  <h3 className="font-poppins font-medium text-foreground">{flavor.name}</h3>
                                  {flavor.additionalPrice > 0 && (
                                    <p className="text-primary font-poppins font-medium mt-1">+${flavor.additionalPrice.toFixed(2)}</p>
                                  )}
                                  <p className="text-sm text-foreground/70 mt-1">{flavor.description}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Step 3: Frosting */}
                    {currentStep === 3 && (
                      <div>
                        <h2 className="text-xl font-poppins font-semibold text-foreground mb-4">
                          Step 3: Choose Your Frosting
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {frostings.map((frosting) => (
                            <Card 
                              key={frosting.id}
                              className={`border-2 transition-all cursor-pointer hover:shadow-md ${
                                selectedFrosting?.id === frosting.id ? 'border-primary' : 'border-accent hover:border-primary/60'
                              }`}
                              onClick={() => handleFrostingSelect(frosting)}
                            >
                              <CardContent className="p-4">
                                <div className="h-24 flex items-center justify-center mb-3">
                                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                                    <span className="text-sm text-foreground font-medium">{frosting.name.charAt(0)}</span>
                                  </div>
                                </div>
                                
                                <div className="text-center">
                                  <h3 className="font-poppins font-medium text-foreground">{frosting.name}</h3>
                                  {frosting.additionalPrice > 0 && (
                                    <p className="text-primary font-poppins font-medium mt-1">+${frosting.additionalPrice.toFixed(2)}</p>
                                  )}
                                  <p className="text-sm text-foreground/70 mt-1">{frosting.description}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Step 4: Decorations */}
                    {currentStep === 4 && (
                      <div>
                        <h2 className="text-xl font-poppins font-semibold text-foreground mb-4">
                          Step 4: Choose Decorations and Add Message
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          {decorations.map((decoration) => (
                            <Card 
                              key={decoration.id}
                              className={`border-2 transition-all cursor-pointer hover:shadow-md ${
                                selectedDecoration?.id === decoration.id ? 'border-primary' : 'border-accent hover:border-primary/60'
                              }`}
                              onClick={() => handleDecorationSelect(decoration)}
                            >
                              <CardContent className="p-4">
                                <div className="h-24 flex items-center justify-center mb-3">
                                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                                    <span className="text-sm text-foreground font-medium">{decoration.name.charAt(0)}</span>
                                  </div>
                                </div>
                                
                                <div className="text-center">
                                  <h3 className="font-poppins font-medium text-foreground">{decoration.name}</h3>
                                  {decoration.additionalPrice > 0 && (
                                    <p className="text-primary font-poppins font-medium mt-1">+${decoration.additionalPrice.toFixed(2)}</p>
                                  )}
                                  <p className="text-sm text-foreground/70 mt-1">{decoration.description}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
                        <div className="space-y-4 mt-6">
                          <div>
                            <label htmlFor="cake-message" className="block text-sm font-medium text-foreground/70 mb-1">
                              Cake Message (Optional)
                            </label>
                            <Input
                              id="cake-message"
                              placeholder="Happy Birthday, John!"
                              value={cakeMessage}
                              onChange={(e) => setCakeMessage(e.target.value)}
                              maxLength={50}
                            />
                            <p className="text-xs text-foreground/70 mt-1">
                              {cakeMessage.length}/50 characters
                            </p>
                          </div>
                          
                          <div>
                            <label htmlFor="special-instructions" className="block text-sm font-medium text-foreground/70 mb-1">
                              Special Instructions (Optional)
                            </label>
                            <Textarea
                              id="special-instructions"
                              placeholder="Any specific details or requests for your cake..."
                              value={specialInstructions}
                              onChange={(e) => setSpecialInstructions(e.target.value)}
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-8 flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={prevStep}
                        className="bg-accent/30 text-foreground hover:bg-accent/50"
                        disabled={currentStep === 1}
                      >
                        Back
                      </Button>
                      
                      {currentStep < 4 ? (
                        <Button onClick={nextStep} className="bg-primary hover:bg-primary/90">
                          Next Step
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleAddToCart} 
                          className="bg-primary hover:bg-primary/90"
                          disabled={!isCakeComplete || isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add to Cart"
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Preview & Summary */}
          <div className="lg:w-1/3">
            {/* Preview */}
            <Card className="mb-6">
              <div className="h-64 overflow-hidden">
                <img 
                  src="https://pixabay.com/get/gc8d7c3b21cd6669dc1870bb020a85403c254e7207d2da3e1fd0d402479736177de43c6861c845c4695c2c0e2a2778c31abfc17187fc93a7273e206c7a37be9ef_1280.jpg" 
                  alt="Preview of your custom cake" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="font-poppins font-semibold text-foreground text-lg mb-1">Cake Preview</h3>
                <p className="text-sm text-foreground/70 mb-4">This is a visual representation of your custom cake</p>
                
                <div className="border-t border-accent pt-4">
                  <h4 className="font-poppins font-medium text-foreground mb-3">Current Selections</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-sm text-foreground/70">Shape:</span>
                      <span className="text-sm font-medium text-foreground">
                        {selectedShape ? selectedShape.name : "Not selected yet"}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-sm text-foreground/70">Flavor:</span>
                      {selectedFlavor ? (
                        <span className="text-sm font-medium text-foreground">{selectedFlavor.name}</span>
                      ) : (
                        <span className="text-sm italic text-foreground/50">Not selected yet</span>
                      )}
                    </li>
                    <li className="flex justify-between">
                      <span className="text-sm text-foreground/70">Frosting:</span>
                      {selectedFrosting ? (
                        <span className="text-sm font-medium text-foreground">{selectedFrosting.name}</span>
                      ) : (
                        <span className="text-sm italic text-foreground/50">Not selected yet</span>
                      )}
                    </li>
                    <li className="flex justify-between">
                      <span className="text-sm text-foreground/70">Decorations:</span>
                      {selectedDecoration ? (
                        <span className="text-sm font-medium text-foreground">{selectedDecoration.name}</span>
                      ) : (
                        <span className="text-sm italic text-foreground/50">Not selected yet</span>
                      )}
                    </li>
                    {cakeMessage && (
                      <li className="flex justify-between">
                        <span className="text-sm text-foreground/70">Message:</span>
                        <span className="text-sm font-medium text-foreground">{cakeMessage}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            {/* Order Summary */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-poppins font-semibold text-foreground text-lg mb-4">Cake Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Base Price:</span>
                    <span className="text-foreground font-medium">${BASE_PRICE.toFixed(2)}</span>
                  </div>
                  
                  {selectedShape && (
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Shape ({selectedShape.name}):</span>
                      <span className="text-foreground font-medium">
                        +${(30 * selectedShape.priceMultiplier).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {selectedFlavor && selectedFlavor.additionalPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Flavor ({selectedFlavor.name}):</span>
                      <span className="text-foreground font-medium">
                        +${selectedFlavor.additionalPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {selectedFrosting && selectedFrosting.additionalPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Frosting ({selectedFrosting.name}):</span>
                      <span className="text-foreground font-medium">
                        +${selectedFrosting.additionalPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {selectedDecoration && selectedDecoration.additionalPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Decorations ({selectedDecoration.name}):</span>
                      <span className="text-foreground font-medium">
                        +${selectedDecoration.additionalPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-accent pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-foreground font-poppins font-semibold">Estimated Total:</span>
                    <span className="text-primary font-poppins font-semibold">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className={`w-full ${
                    isCakeComplete 
                      ? "bg-primary hover:bg-primary/90" 
                      : "bg-accent text-foreground opacity-60 cursor-not-allowed"
                  }`}
                  disabled={!isCakeComplete || isSubmitting}
                  onClick={() => {
                    if (currentStep < 4) {
                      nextStep();
                    } else {
                      handleAddToCart();
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : currentStep < 4 ? (
                    "Continue to Next Step"
                  ) : isCakeComplete ? (
                    "Add to Cart"
                  ) : (
                    "Complete All Steps to Continue"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CakeBuilder;
