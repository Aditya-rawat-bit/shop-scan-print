import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  name: string;
  weight: number;
  mainPrice: number;
  discountedPrice: number;
  barcode: string;
  createdAt: Date;
}

interface ProductFormProps {
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  products: Product[];
  editingProduct?: Product | null;
  onCancelEdit?: () => void;
}

export const ProductForm = ({ 
  onAddProduct, 
  onUpdateProduct, 
  products, 
  editingProduct, 
  onCancelEdit 
}: ProductFormProps) => {
  const [name, setName] = useState(editingProduct?.name || "");
  const [weight, setWeight] = useState(editingProduct?.weight?.toString() || "");
  const [mainPrice, setMainPrice] = useState(editingProduct?.mainPrice?.toString() || "");
  const [discountedPrice, setDiscountedPrice] = useState(editingProduct?.discountedPrice?.toString() || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !mainPrice || !discountedPrice) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!weight || parseFloat(weight) <= 0) {
      toast.error("Please enter a valid weight in grams");
      return;
    }

    // Check for duplicate product names (case insensitive)
    const isDuplicate = products.some(product => 
      product.name.toLowerCase() === name.toLowerCase() && 
      (!editingProduct || product.id !== editingProduct.id)
    );

    if (isDuplicate) {
      toast.error("Product with this name already exists!");
      return;
    }

    if (editingProduct) {
      // Update existing product
      const updatedProduct: Product = {
        ...editingProduct,
        name,
        weight: parseFloat(weight),
        mainPrice: parseFloat(mainPrice),
        discountedPrice: parseFloat(discountedPrice),
      };
      onUpdateProduct(updatedProduct);
      toast.success("Product updated successfully!");
    } else {
      // Add new product
      const product: Product = {
        id: uuidv4(),
        name,
        weight: parseFloat(weight),
        mainPrice: parseFloat(mainPrice),
        discountedPrice: parseFloat(discountedPrice),
        barcode: generateBarcode(),
        createdAt: new Date()
      };
      onAddProduct(product);
      toast.success("Product added successfully!");
    }

    // Reset form
    setName("");
    setWeight("");
    setMainPrice("");
    setDiscountedPrice("");
    if (onCancelEdit) onCancelEdit();
  };

  const generateBarcode = () => {
    // Generate barcode with format: 9130589130 + incremental number
    const nextNumber = products.length + 1;
    return `9130589130${nextNumber}`;
  };

  const handleCancel = () => {
    setName("");
    setWeight("");
    setMainPrice("");
    setDiscountedPrice("");
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {editingProduct ? <Edit className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
          {editingProduct ? "Edit Product" : "Add New Product"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (grams)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight in grams (e.g., 200 for 200g, 1000 for 1kg)"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mainPrice">Main Price (₹)</Label>
            <Input
              id="mainPrice"
              type="number"
              step="0.01"
              value={mainPrice}
              onChange={(e) => setMainPrice(e.target.value)}
              placeholder="Enter main price"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discountedPrice">Discounted Price (₹)</Label>
            <Input
              id="discountedPrice"
              type="number"
              step="0.01"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              placeholder="Enter selling price"
              required
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
            {editingProduct && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};