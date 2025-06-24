import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCart } from "@/hooks/use-cart";
import Navbar from "@/components/navigation/Navbar";
import { Cake, Image, ShoppingCart, AlertCircle, CheckCircle, Palette, User, Star, Scale } from "lucide-react";
import { toast } from "sonner";

interface CakeDesignOptions {
  layers: string[];
  colors: string[];
  sideDesigns: string[];
  upperDesigns: string[];
}

interface MainBaker {
  id: number;
  fullName: string;
  email: string;
  profileImage?: string;
  completedOrders: number;
  teamSize: number;
  averageRating?: number;
  joinedAt?: string;
}

interface CakeSelection {
  layers: string;
  color: string;
  sideDesign: string;
  upperDesign: string;
  pounds: number;
  mainBakerId: number | null;
  customMessage?: string;
}

const CustomCakeBuilder = () => {
  const { addToCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [selection, setSelection] = useState<CakeSelection>({
    layers: '',
    color: '',
    sideDesign: '',
    upperDesign: '',
    pounds: 1.0,
    mainBakerId: null,
    customMessage: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [designAvailable, setDesignAvailable] = useState<boolean>(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [designOptions, setDesignOptions] = useState<CakeDesignOptions>({
    layers: [],
    colors: [],
    sideDesigns: [],
    upperDesigns: []
  });
  const [mainBakers, setMainBakers] = useState<MainBaker[]>([]);
  const [selectedBaker, setSelectedBaker] = useState<MainBaker | null>(null);
  const [showBakerProfile, setShowBakerProfile] = useState(false);

  // Pricing configuration
  const PRICING = {
    basePrice: 25, // Base price for 1 pound cake
    pricePerPound: 15, // Additional price per pound
    layerMultiplier: {
      '2layer': 1.0,
      '3layer': 1.3,
      '4layer': 1.6
    },
    designMultiplier: {
      'simple': 1.0,
      'medium': 1.2,
      'complex': 1.5
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDesignOptions();
    loadMainBakers();
  }, []);

  // Update preview when selection changes
  useEffect(() => {
    if (selection.layers && selection.color && selection.sideDesign && selection.upperDesign) {
      updatePreview();
    }
  }, [selection.layers, selection.color, selection.sideDesign, selection.upperDesign]);

  // Load design options from API
  const loadDesignOptions = async () => {
    try {
      const response = await fetch('/api/cake-builder/options');
      if (response.ok) {
        const options = await response.json();
        setDesignOptions(options);
      } else {
        toast.error('Failed to load design options');
      }
    } catch (error) {
      console.error('Error loading design options:', error);
      toast.error('Failed to load design options');
    }
  };

  // Load main bakers from API
  const loadMainBakers = async () => {
    try {
      const response = await fetch('/api/main-bakers');
      if (response.ok) {
        const bakers = await response.json();
        setMainBakers(bakers);
      } else {
        toast.error('Failed to load main bakers');
      }
    } catch (error) {
      console.error('Error loading main bakers:', error);
      toast.error('Failed to load main bakers');
    }
  };

  // Generate design key for image lookup
  const generateDesignKey = (): string => {
    return `${selection.color}_${selection.layers}_${selection.sideDesign}_${selection.upperDesign}`;
  };

  // Update preview image
  const updatePreview = async () => {
    setIsLoadingPreview(true);
    const designKey = generateDesignKey();
    
    try {
      const response = await fetch(`/api/cake-builder/preview?key=${designKey}`);
      if (response.ok) {
        const result = await response.json();
        setDesignAvailable(result.available);
        setPreviewImage(result.available ? result.imageUrl : result.fallbackUrl);
      } else {
        setDesignAvailable(false);
        setPreviewImage(null);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      setDesignAvailable(false);
      setPreviewImage(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Calculate total price
  const calculatePrice = (): number => {
    if (!selection.pounds || selection.pounds <= 0) return 0;
    
    let price = PRICING.basePrice;
    
    // Add price per pound (excluding first pound)
    if (selection.pounds > 1) {
      price += (selection.pounds - 1) * PRICING.pricePerPound;
    }
    
    // Apply layer multiplier
    const layerKey = selection.layers as keyof typeof PRICING.layerMultiplier;
    if (layerKey && PRICING.layerMultiplier[layerKey]) {
      price *= PRICING.layerMultiplier[layerKey];
    }
    
    // Apply design complexity multiplier (simplified)
    price *= PRICING.designMultiplier.medium;
    
    return Math.round(price * 100) / 100; // Round to 2 decimal places
  };

  // Handle option selection
  const handleOptionSelect = (step: number, value: string) => {
    switch (step) {
      case 1:
        setSelection(prev => ({ ...prev, layers: value }));
        break;
      case 2:
        setSelection(prev => ({ ...prev, color: value }));
        break;
      case 3:
        setSelection(prev => ({ ...prev, sideDesign: value }));
        break;
      case 4:
        setSelection(prev => ({ ...prev, upperDesign: value }));
        break;
    }
  };

  // Handle pounds change
  const handlePoundsChange = (pounds: number) => {
    setSelection(prev => ({ ...prev, pounds: Math.max(0.5, pounds) }));
  };

  // Handle main baker selection
  const handleBakerSelect = (baker: MainBaker) => {
    setSelection(prev => ({ ...prev, mainBakerId: baker.id }));
    setSelectedBaker(baker);
    setShowBakerProfile(false);
    setCurrentStep(7); // Move to final step
  };

  // Get current step data
  const getCurrentStepData = () => {
    switch (currentStep) {
      case 1:
        return { title: 'Choose Layers', options: designOptions.layers, icon: <Cake className="h-5 w-5" /> };
      case 2:
        return { title: 'Select Color', options: designOptions.colors, icon: <Palette className="h-5 w-5" /> };
      case 3:
        return { title: 'Side Design', options: designOptions.sideDesigns, icon: <Image className="h-5 w-5" /> };
      case 4:
        return { title: 'Upper Design', options: designOptions.upperDesigns, icon: <Image className="h-5 w-5" /> };
      case 5:
        return { title: 'Cake Weight', options: [], icon: <Scale className="h-5 w-5" /> };
      case 6:
        return { title: 'Choose Main Baker', options: [], icon: <User className="h-5 w-5" /> };
      case 7:
        return { title: 'Review & Order', options: [], icon: <ShoppingCart className="h-5 w-5" /> };
      default:
        return { title: 'Step', options: [], icon: null };
    }
  };

  // Navigate to next step
  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if current step is valid
  const isCurrentStepValid = (): boolean => {
    switch (currentStep) {
      case 1: return !!selection.layers;
      case 2: return !!selection.color;
      case 3: return !!selection.sideDesign;
      case 4: return !!selection.upperDesign;
      case 5: return selection.pounds > 0;
      case 6: return !!selection.mainBakerId;
      case 7: return designAvailable && !!selection.mainBakerId;
      default: return false;
    }
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!designAvailable) {
      toast.error('This design combination is not available. Please try a different combination.');
      return;
    }

    if (!selection.mainBakerId) {
      toast.error('Please select a main baker for your custom cake.');
      return;
    }

    try {
      // Create the custom cake object
      const customCakeData = {
        name: `Custom Cake - ${selection.color} ${selection.layers}`,
        layers: selection.layers,
        color: selection.color,
        sideDesign: selection.sideDesign,
        upperDesign: selection.upperDesign,
        pounds: selection.pounds,
        designKey: generateDesignKey(),
        message: selection.customMessage || null,
        totalPrice: calculatePrice(),
        mainBakerId: selection.mainBakerId,
        specialInstructions: null
      };

      // Call API to create custom cake
      const response = await fetch('/api/cake-builder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customCakeData),
      });

      if (!response.ok) {
        throw new Error('Failed to create custom cake');
      }

      const createdCake = await response.json();

      // Add to cart with proper structure
      const cartItem = {
        ...createdCake,
        imageUrl: previewImage || '/design/fallback.jpeg',
        category: 'custom',
        description: `Custom ${selection.layers} cake in ${selection.color} with ${selection.sideDesign} side design and ${selection.upperDesign} upper design`,
        price: calculatePrice(),
        inStock: true,
        isBestSeller: false,
        isNew: true
      };

      addToCart(cartItem, 1, true); // true indicates it's a custom cake
      
      toast.success('Custom cake added to cart!');
      
      // Reset form
      setSelection({
        layers: '',
        color: '',
        sideDesign: '',
        upperDesign: '',
        pounds: 1.0,
        mainBakerId: null,
        customMessage: ''
      });
      setCurrentStep(1);
      setPreviewImage(null);
      setDesignAvailable(false);
      setSelectedBaker(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add custom cake to cart');
    }
  };

  const stepData = getCurrentStepData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Custom Cake Builder</h1>
          <p className="text-lg text-gray-600">Create your perfect cake with our step-by-step builder</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
              <div key={step} className={`flex items-center ${step !== 7 ? 'flex-1' : ''}`}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {step}
                </div>
                {step !== 7 && (
                  <div className={`h-1 flex-1 mx-2 ${currentStep > step ? 'bg-pink-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Layers</span>
            <span>Color</span>
            <span>Side</span>
            <span>Upper</span>
            <span>Weight</span>
            <span>Baker</span>
            <span>Review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Selection Panel */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {stepData.icon}
                {stepData.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Steps 1-4: Design Options */}
              {currentStep >= 1 && currentStep <= 4 && (
                <div className="grid grid-cols-2 gap-3">
                  {stepData.options.map((option) => (
                    <Button
                      key={option}
                      variant={
                        (currentStep === 1 && selection.layers === option) ||
                        (currentStep === 2 && selection.color === option) ||
                        (currentStep === 3 && selection.sideDesign === option) ||
                        (currentStep === 4 && selection.upperDesign === option)
                          ? "default" : "outline"
                      }
                      onClick={() => handleOptionSelect(currentStep, option)}
                      className="h-12 capitalize"
                    >
                      {option.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              )}

              {/* Step 5: Pounds Selection */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pounds">Cake Weight (pounds)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePoundsChange(selection.pounds - 0.5)}
                        disabled={selection.pounds <= 0.5}
                      >
                        -
                      </Button>
                      <Input
                        id="pounds"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={selection.pounds}
                        onChange={(e) => handlePoundsChange(parseFloat(e.target.value) || 0.5)}
                        className="w-20 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePoundsChange(selection.pounds + 0.5)}
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Minimum: 0.5 pounds. Price: ${calculatePrice().toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Quick pound selection buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 1.5, 2, 2.5, 3, 4, 5, 6].map((pounds) => (
                      <Button
                        key={pounds}
                        variant={selection.pounds === pounds ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePoundsChange(pounds)}
                      >
                        {pounds}lb
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Main Baker Selection */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Choose a main baker who will handle your custom cake order:
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {mainBakers.map((baker) => (
                      <div
                        key={baker.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selection.mainBakerId === baker.id
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleBakerSelect(baker)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={baker.profileImage} alt={baker.fullName} />
                              <AvatarFallback>
                                {baker.fullName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{baker.fullName}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{baker.completedOrders} completed orders</span>
                                <span>{baker.teamSize} team members</span>
                                {baker.averageRating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{baker.averageRating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <Dialog open={showBakerProfile} onOpenChange={setShowBakerProfile}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBaker(baker);
                                  setShowBakerProfile(true);
                                }}
                              >
                                View Profile
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 7: Review */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Order Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Layers:</strong> {selection.layers.replace('_', ' ')}</p>
                      <p><strong>Color:</strong> {selection.color}</p>
                      <p><strong>Side Design:</strong> {selection.sideDesign}</p>
                      <p><strong>Upper Design:</strong> {selection.upperDesign}</p>
                      <p><strong>Weight:</strong> {selection.pounds} pounds</p>
                      <p><strong>Main Baker:</strong> {selectedBaker?.fullName}</p>
                      <p><strong>Total Price:</strong> ${calculatePrice().toFixed(2)}</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">Custom Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Add a personal message to your cake..."
                      value={selection.customMessage || ''}
                      onChange={(e) => setSelection(prev => ({ ...prev, customMessage: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  {!designAvailable && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Design Not Available</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        This design combination is not currently available. You can still place the order,
                        but it will be fulfilled with a similar design.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < 7 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!isCurrentStepValid()}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleAddToCart}
                    disabled={!selection.mainBakerId}
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart - ${calculatePrice().toFixed(2)}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {isLoadingPreview ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                  </div>
                ) : previewImage ? (
                  <img
                    src={previewImage}
                    alt="Cake preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Cake className="h-12 w-12 mx-auto mb-2" />
                      <p>Select options to see preview</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Design Status */}
              {previewImage && (
                <div className="flex items-center gap-2 mb-4">
                  {designAvailable ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-700 font-medium">Design Available</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="text-yellow-700 font-medium">Similar Design Available</span>
                    </>
                  )}
                </div>
              )}

              {/* Selection Summary */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {selection.layers && <Badge variant="secondary">{selection.layers}</Badge>}
                  {selection.color && <Badge variant="secondary">{selection.color}</Badge>}
                  {selection.sideDesign && <Badge variant="secondary">{selection.sideDesign}</Badge>}
                  {selection.upperDesign && <Badge variant="secondary">{selection.upperDesign}</Badge>}
                  {selection.pounds > 0 && <Badge variant="secondary">{selection.pounds}lbs</Badge>}
                </div>
                
                {selection.pounds > 0 && (
                  <p className="text-lg font-semibold text-pink-600">
                    Total: ${calculatePrice().toFixed(2)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Baker Profile Dialog */}
        <Dialog open={showBakerProfile} onOpenChange={setShowBakerProfile}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Baker Profile</DialogTitle>
            </DialogHeader>
            {selectedBaker && (
              <div className="space-y-4">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarImage src={selectedBaker.profileImage} alt={selectedBaker.fullName} />
                    <AvatarFallback className="text-lg">
                      {selectedBaker.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">{selectedBaker.fullName}</h3>
                  <p className="text-gray-600">{selectedBaker.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-pink-600">{selectedBaker.completedOrders}</p>
                    <p className="text-sm text-gray-600">Completed Orders</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-pink-600">{selectedBaker.teamSize}</p>
                    <p className="text-sm text-gray-600">Team Members</p>
                  </div>
                </div>
                
                {selectedBaker.averageRating && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold">{selectedBaker.averageRating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                )}
                
                <Button
                  onClick={() => handleBakerSelect(selectedBaker)}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  Select This Baker
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomCakeBuilder;
