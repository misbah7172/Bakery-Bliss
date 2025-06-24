import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package, DollarSign, Eye } from "lucide-react";
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  imageUrl: string;
  inStock: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  mainBakerId: number;
  createdAt: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  subcategory: string;
  imageUrl: string;
  inStock: boolean;
  isBestSeller: boolean;
  isNew: boolean;
}

const categories = [
  "Cakes",
  "Pastries",
  "Cookies",
  "Breads",
  "Muffins",
  "Cupcakes",
  "Donuts",
  "Pies"
];

export default function MainBakerProducts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    category: "",
    subcategory: "",
    imageUrl: "https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Product+Image", // Default placeholder
    inStock: true,
    isBestSeller: false,
    isNew: false
  });
  // Get products created by this main baker - moved before conditional return
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [`/api/main-baker/products`],
    enabled: !!user && user.role === 'main_baker'
  });
  // Create product mutation - moved before conditional return
  const createProductMutation = useMutation({
    mutationFn: async (productData: Omit<Product, 'id' | 'mainBakerId' | 'createdAt'>) => {
      return await apiRequest("/api/main-baker/products", "POST", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/main-baker/products`] });
      toast.success("Product created successfully!");
      resetForm();
      setIsAddDialogOpen(false);
    },    onError: (error: any) => {
      toast.error(error.message || "Failed to create product");
    }
  });  // Update product mutation - moved before conditional return
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }: Partial<Product>) => {
      return await apiRequest(`/api/main-baker/products/${id}`, "PUT", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/main-baker/products`] });
      toast.success("Product updated successfully!");
      resetForm();
      setEditingProduct(null);
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product");
    }
  });
  // Delete product mutation - moved before conditional return
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest(`/api/main-baker/products/${productId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/main-baker/products`] });
      toast.success("Product deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product");
    }
  });

  // Only main bakers can access this page
  if (user?.role !== 'main_baker') {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-orange-600 mb-4">Access Restricted</h1>
              <p className="text-gray-600 mb-4">Only main bakers can manage products.</p>
              <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );  }
  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      subcategory: "",
      imageUrl: "https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Product+Image", // Default placeholder
      inStock: true,
      isBestSeller: false,
      isNew: false
    });
  };const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.description || !productForm.price || !productForm.category || !productForm.imageUrl) {
      toast.error("Please fill in all required fields including image URL");
      return;
    }

    const productData = {
      ...productForm,
      price: parseFloat(productForm.price)
    };

    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      subcategory: product.subcategory || "",
      imageUrl: product.imageUrl,
      inStock: product.inStock,
      isBestSeller: product.isBestSeller,
      isNew: product.isNew
    });
    setIsAddDialogOpen(true);
  };
  const handleDelete = (productId: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  return (
    <AppLayout showSidebar sidebarType="main">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Products</h1>
            <p className="text-gray-600">Manage your bakery products</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {product.isNew && (
                      <Badge className="bg-green-500 text-white">New</Badge>
                    )}
                    {product.isBestSeller && (
                      <Badge className="bg-yellow-500 text-white">Best Seller</Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{product.category}</Badge>
                    {product.subcategory && (
                      <Badge variant="outline" className="text-xs">
                        {product.subcategory}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {products?.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first product</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        )}

        {/* Add/Edit Product Dialog */}
        <Dialog open={isAddDialogOpen || !!editingProduct} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingProduct(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update your product details' : 'Create a new product for your bakery'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Chocolate Cake"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="25.99"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Delicious chocolate cake with rich frosting..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={productForm.category}
                    onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={productForm.subcategory}
                    onChange={(e) => setProductForm(prev => ({ ...prev, subcategory: e.target.value }))}
                    placeholder="Birthday, Wedding, etc."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL *</Label>
                <Input
                  id="imageUrl"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="inStock"
                    checked={productForm.inStock}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, inStock: checked }))}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isBestSeller"
                    checked={productForm.isBestSeller}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isBestSeller: checked }))}
                  />
                  <Label htmlFor="isBestSeller">Best Seller</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isNew"
                    checked={productForm.isNew}
                    onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isNew: checked }))}
                  />
                  <Label htmlFor="isNew">New Product</Label>
                </div>              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                  {createProductMutation.isPending || updateProductMutation.isPending ? 'Processing...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </Button>
              </div>
            </form>
          </DialogContent>        </Dialog>
      </div>
    </AppLayout>
  );
}
