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
import AppLayout from "@/components/layouts/AppLayout";
import { 
  Cake, 
  Image, 
  ShoppingCart, 
  AlertCircle, 
  CheckCircle, 
  Palette, 
  User, 
  Star, 
  Scale, 
  Sparkles, 
  Heart, 
  ChefHat,
  Timer,
  Trophy,
  Crown,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface CakeDesignOptions {
  layers: string[];
  colors: string[];
  shapes: string[];
  sideDesigns: string[];
  upperDesigns: string[];
  availableCombinations?: Array<{
    layer: string;
    shape: string;
    color: string;
    sideDesign: string;
    upperDesign: string;
  }>;
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
  shape: string;
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
    shape: '',
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
    shapes: [],
    sideDesigns: [],
    upperDesigns: []
  });
  const [mainBakers, setMainBakers] = useState<MainBaker[]>([]);
  const [selectedBaker, setSelectedBaker] = useState<MainBaker | null>(null);
  const [showBakerProfile, setShowBakerProfile] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<{
    colors: string[];
    shapes: string[];
    sideDesigns: string[];
    upperDesigns: string[];
  }>({
    colors: [],
    shapes: [],
    sideDesigns: [],
    upperDesigns: []
  });

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
    if (selection.layers && selection.color && selection.shape && selection.sideDesign && selection.upperDesign) {
      updatePreview();
    }
  }, [selection.layers, selection.color, selection.shape, selection.sideDesign, selection.upperDesign]);

  // Update filtered options when selections change
  useEffect(() => {
    if (currentStep > 1) {
      loadFilteredOptions();
    }
  }, [selection.layers, selection.shape, selection.color, selection.sideDesign, currentStep]);

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

  // Load filtered options based on current selections
  const loadFilteredOptions = async () => {
    try {
      const params = new URLSearchParams();
      if (selection.layers) params.append('layer', selection.layers);
      if (selection.shape) params.append('shape', selection.shape);
      if (selection.color) params.append('color', selection.color);
      if (selection.sideDesign) params.append('sideDesign', selection.sideDesign);

      const response = await fetch(`/api/cake-builder/filtered-options?${params.toString()}`);
      if (response.ok) {
        const options = await response.json();
        setFilteredOptions(options);
      } else {
        console.error('Failed to load filtered options');
      }
    } catch (error) {
      console.error('Error loading filtered options:', error);
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
    return `${selection.layers}, ${selection.shape}, ${selection.color}, ${selection.sideDesign}, ${selection.upperDesign}`;
  };

  // Update preview image
  const updatePreview = async () => {
    setIsLoadingPreview(true);
    
    try {
      const response = await fetch('/api/cake-builder/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layer: selection.layers,
          shape: selection.shape,
          color: selection.color,
          sideDesign: selection.sideDesign,
          upperDesign: selection.upperDesign,
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setDesignAvailable(result.available);
        setPreviewImage(result.available ? result.imageUrl : result.fallbackUrl);
      } else {
        setDesignAvailable(false);
        setPreviewImage('/design/fallback.jpeg');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      setDesignAvailable(false);
      setPreviewImage('/design/fallback.jpeg');
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
        setSelection(prev => ({ 
          ...prev, 
          layers: value,
          // Reset subsequent selections when layer changes
          shape: '',
          color: '',
          sideDesign: '',
          upperDesign: ''
        }));
        break;
      case 2:
        setSelection(prev => ({ 
          ...prev, 
          shape: value,
          // Reset subsequent selections when shape changes
          color: '',
          sideDesign: '',
          upperDesign: ''
        }));
        break;
      case 3:
        setSelection(prev => ({ 
          ...prev, 
          color: value,
          // Reset subsequent selections when color changes
          sideDesign: '',
          upperDesign: ''
        }));
        break;
      case 4:
        setSelection(prev => ({ 
          ...prev, 
          sideDesign: value,
          // Reset subsequent selections when side design changes
          upperDesign: ''
        }));
        break;
      case 5:
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
    setCurrentStep(8); // Move to final step
  };

  // Get current step data
  const getCurrentStepData = () => {
    switch (currentStep) {
      case 1:
        return { title: 'Choose Layers', options: designOptions.layers, icon: <Cake className="h-5 w-5" /> };
      case 2:
        return { title: 'Choose Shape', options: selection.layers ? filteredOptions.shapes : designOptions.shapes, icon: <Image className="h-5 w-5" /> };
      case 3:
        return { title: 'Select Color', options: selection.shape ? filteredOptions.colors : designOptions.colors, icon: <Palette className="h-5 w-5" /> };
      case 4:
        return { title: 'Side Design', options: selection.color ? filteredOptions.sideDesigns : designOptions.sideDesigns, icon: <Image className="h-5 w-5" /> };
      case 5:
        return { title: 'Upper Design', options: selection.sideDesign ? filteredOptions.upperDesigns : designOptions.upperDesigns, icon: <Image className="h-5 w-5" /> };
      case 6:
        return { title: 'Cake Weight', options: [], icon: <Scale className="h-5 w-5" /> };
      case 7:
        return { title: 'Choose Main Baker', options: [], icon: <User className="h-5 w-5" /> };
      case 8:
        return { title: 'Review & Order', options: [], icon: <ShoppingCart className="h-5 w-5" /> };
      default:
        return { title: 'Step', options: [], icon: null };
    }
  };

  // Navigate to next step
  const nextStep = () => {
    if (currentStep < 8) {
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
      case 2: return !!selection.shape;
      case 3: return !!selection.color;
      case 4: return !!selection.sideDesign;
      case 5: return !!selection.upperDesign;
      case 6: return selection.pounds > 0;
      case 7: return !!selection.mainBakerId;
      case 8: return designAvailable && !!selection.mainBakerId;
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
        shape: selection.shape,
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
        shape: '',
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
    <AppLayout>
      {/* Hero Section */}
      <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-pink-400/20"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-6 right-12 animate-bounce delay-100">
            <Sparkles className="w-6 h-6 text-yellow-400 opacity-60" />
          </div>
          <div className="absolute bottom-8 left-16 animate-bounce delay-300">
            <Heart className="w-5 h-5 text-red-400 opacity-50" />
          </div>
          <div className="absolute top-12 left-1/4 animate-bounce delay-500">
            <Star className="w-4 h-4 text-purple-400 opacity-70" />
          </div>
        </div>
        
        <div className="relative z-10 px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
            <ChefHat className="w-5 h-5 text-orange-500" />
            <span className="text-gray-700 font-medium">Crafted Just for You</span>
          </div>
          
          <h1 className="font-poppins font-bold text-4xl md:text-6xl mb-4 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Custom Cake Builder
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Design your dream cake with our interactive builder. Every layer, every color, every detail crafted to perfection.
          </p>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="mb-12">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
              <div key={step} className={`flex items-center ${step !== 8 ? 'flex-1' : ''}`}>
                <div className={`relative`}>
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
                    ${currentStep >= step 
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white border-orange-500 shadow-lg' 
                      : currentStep === step - 1
                      ? 'bg-orange-100 text-orange-600 border-orange-300'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                    }
                  `}>
                    {currentStep > step ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step
                    )}
                  </div>
                  {currentStep === step && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 animate-ping opacity-30"></div>
                  )}
                </div>
                {step !== 8 && (
                  <div className={`h-2 flex-1 mx-3 rounded-full transition-all duration-500 ${
                    currentStep > step 
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500' 
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-1">
              <Cake className="w-4 h-4" />
              Layers
            </span>
            <span className="flex items-center gap-1">
              <Image className="w-4 h-4" />
              Shape
            </span>
            <span className="flex items-center gap-1">
              <Palette className="w-4 h-4" />
              Color
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Side
            </span>
            <span className="flex items-center gap-1">
              <Crown className="w-4 h-4" />
              Upper
            </span>
            <span className="flex items-center gap-1">
              <Scale className="w-4 h-4" />
              Weight
            </span>
            <span className="flex items-center gap-1">
              <ChefHat className="w-4 h-4" />
              Baker
            </span>
            <span className="flex items-center gap-1">
              <ShoppingCart className="w-4 h-4" />
              Review
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Selection Panel */}
        <Card className="h-fit border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6">
            <CardTitle className="flex items-center gap-3 text-white text-xl">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {stepData.icon}
              </div>
              {stepData.title}
            </CardTitle>
          </div>
          <CardContent className="p-6">
            {/* Steps 1-5: Design Options */}
            {currentStep >= 1 && currentStep <= 5 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stepData.options.map((option, index) => {
                  const isSelected = (
                    (currentStep === 1 && selection.layers === option) ||
                    (currentStep === 2 && selection.shape === option) ||
                    (currentStep === 3 && selection.color === option) ||
                    (currentStep === 4 && selection.sideDesign === option) ||
                    (currentStep === 5 && selection.upperDesign === option)
                  );
                  
                  return (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(currentStep, option)}
                      className={`group relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-pink-50 shadow-lg' 
                          : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-md'
                      }`}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                            : 'bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-600'
                        }`}>
                          {currentStep === 1 && <Cake className="w-4 h-4" />}
                          {currentStep === 2 && <Image className="w-4 h-4" />}
                          {currentStep === 3 && <Palette className="w-4 h-4" />}
                          {currentStep === 4 && <Sparkles className="w-4 h-4" />}
                          {currentStep === 5 && <Crown className="w-4 h-4" />}
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className={`font-semibold text-sm capitalize transition-colors duration-300 ${
                          isSelected ? 'text-orange-700' : 'text-gray-800 group-hover:text-orange-600'
                        }`}>
                          {option.replace(/[_-]/g, ' ')}
                        </h3>
                      </div>
                      
                      {isSelected && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400/10 to-pink-400/10 pointer-events-none">
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-orange-500" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 6: Pounds Selection */}
            {currentStep === 6 && (
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

            {/* Step 7: Main Baker Selection */}
            {currentStep === 7 && (
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

            {/* Step 8: Review */}
            {currentStep === 8 && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Layers:</strong> {selection.layers.replace('_', ' ')}</p>
                    <p><strong>Shape:</strong> {selection.shape}</p>
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

          {/* Enhanced Preview Panel */}
          <Card className="h-fit border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
              <CardTitle className="flex items-center gap-3 text-white text-xl">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Image className="h-5 w-5" />
                </div>
                Live Preview
              </CardTitle>
            </div>
            <CardContent className="p-6">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden mb-6 border-2 border-gray-100">
                {isLoadingPreview ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
                        <div className="absolute inset-0 h-12 w-12 animate-ping bg-pink-400 rounded-full opacity-20 mx-auto"></div>
                      </div>
                      <p className="text-gray-600 font-medium">Baking your preview...</p>
                      <div className="flex space-x-1 mt-2 justify-center">
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                ) : previewImage ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={previewImage}
                      alt="Cake preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Cake className="h-8 w-8 text-orange-400" />
                      </div>
                      <h3 className="font-semibold text-gray-700 mb-2">Your Cake Awaits</h3>
                      <p className="text-sm text-gray-500">Select options to see your masterpiece</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Design Status */}
              {previewImage && (
                <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  {designAvailable ? (
                    <>
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-green-700 font-semibold">Perfect Match!</span>
                        <p className="text-green-600 text-sm">This exact design is available</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <span className="text-yellow-700 font-semibold">Similar Design</span>
                        <p className="text-yellow-600 text-sm">We'll create something beautiful for you</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Enhanced Selection Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Your Selections
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selection.layers && (
                    <div className="bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Cake className="w-3 h-3" />
                      {selection.layers}
                    </div>
                  )}
                  {selection.color && (
                    <div className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      {selection.color}
                    </div>
                  )}
                  {selection.sideDesign && (
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {selection.sideDesign}
                    </div>
                  )}
                  {selection.upperDesign && (
                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      {selection.upperDesign}
                    </div>
                  )}
                  {selection.pounds > 0 && (
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      {selection.pounds}lbs
                    </div>
                  )}
                </div>
                
                {selection.pounds > 0 && (
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-4 rounded-xl text-center">
                    <h4 className="font-semibold mb-1">Total Price</h4>
                    <p className="text-2xl font-bold">${calculatePrice().toFixed(2)}</p>
                  </div>
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
                onClick={() => selectedBaker && handleBakerSelect(selectedBaker)}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                Select This Baker
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CustomCakeBuilder;