import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  name: string;
  weight: number;
  price: number;
  barcode: string;
  createdAt: Date;
}

interface ProductFormProps {
  onAddProduct: (product: Product) => void;
}

export const ProductForm = ({ onAddProduct }: ProductFormProps) => {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !weight || !price) {
      toast.error("Please fill in all fields");
      return;
    }

    const product: Product = {
      id: uuidv4(),
      name,
      weight: parseFloat(weight),
      price: parseFloat(price),
      barcode: generateBarcode(),
      createdAt: new Date()
    };

    onAddProduct(product);
    setName("");
    setWeight("");
    setPrice("");
    toast.success("Product added successfully!");
  };

  const generateBarcode = () => {
    // Generate a unique barcode using timestamp and random number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp.slice(-8)}${random}`; // 11 digit code
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Add New Product
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
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              required
            />
          </div>
          
          <Button type="submit" className="w-full">
            Add Product
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};