import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: "cash" | "card";
}

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "cash",
  });  useEffect(() => {
    // Don't redirect while auth is still loading
    if (loading) {
      return;
    }

    if (!user) {
      setLocation("/login");
      return;
    }

    if (cartItems.length === 0) {
      setLocation("/products");
      return;
    }
  }, [user, loading, cartItems, setLocation]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted!");
    console.log("Form data:", formData);
    console.log("Cart items:", cartItems);
    console.log("Cart total:", cartTotal);
    
    setIsSubmitting(true);    if (!user) {
      toast.error("Please log in to place an order");
      setLocation("/login");
      return;
    }

    // Validate required fields
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof CheckoutFormData]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {      // Show loading state to user
      toast.loading("Processing your order...", {
        description: "Please wait while we process your payment and submit your order.",
      });
      
      // Transform cart items to match server expectations and filter out invalid items
      const orderItems = cartItems
        .filter(item => (item.product?.id || item.customCake?.id)) // Filter out items without valid IDs
        .map(item => ({
          productId: item.product?.id || null,
          customCakeId: item.customCake?.id || null,
          quantity: item.quantity,
          pricePerItem: item.product ? 
            Number(item.product.price.toFixed(2)) : 
            Number((item.customCake?.totalPrice || 0).toFixed(2))
        }));
      
      if (orderItems.length === 0) {
        toast.error("No valid items in cart. Please add some products before checking out.");
        setIsSubmitting(false);
        return;
      }

      // Log the data we're sending to help troubleshoot
      console.log("Sending order data:", JSON.stringify({
        items: orderItems,
        totalAmount: Number(cartTotal.toFixed(2)),
        shippingInfo: formData
      }, null, 2));      // Make sure we're sending a proper totalAmount as a number
      const response = await apiRequest("/api/orders", "POST", {
        items: orderItems,
        totalAmount: Number(cartTotal.toFixed(2)), // Ensure it's a number
        status: "pending",
        shippingInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          paymentMethod: formData.paymentMethod
        }
      });

      if (!response.ok) {
        // Try to get the error message from the response
        let errorMessage = "Failed to place order. Please try again.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          
          if (errorData.errors) {
            // If we have validation errors, show details
            errorMessage += `: ${errorData.errors[0]?.message || 'Validation error'}`;
          }
        } catch (e) {
          console.error("Could not parse error response:", e);
        }
        
        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      clearCart();
      toast.success("Order placed successfully! Thank you for shopping with Bakery Bliss.");
      
      // Navigate to the order confirmation/details page
      if (data.id) {
        setLocation(`/orders/${data.id}`);
      } else if (data.orderId) {
        setLocation(`/orders/${data.orderId}`);
      } else {
        // Fallback if we don't have an ID
        setLocation(`/orders`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong while processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="cash">Cash on Delivery</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </form>
          </Card>
        </div>
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.product ? item.product.name : item.customCake?.name} x {item.quantity}
                  </span>
                  <span>
                    ${((item.product ? item.product.price : item.customCake?.totalPrice || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}