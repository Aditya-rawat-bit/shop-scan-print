import { useState } from "react";
import { ProductForm, Product } from "@/components/ProductForm";
import { ProductList } from "@/components/ProductList";
import { POSNavigation } from "@/components/POSNavigation";
import { POSSystem } from "@/components/POSSystem";
import { ReceiptSystem } from "@/components/ReceiptSystem";
import { Settings } from "@/components/Settings";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface CartItem extends Product {
  quantity: number;
}

interface ReceiptData {
  id: string;
  customerName?: string;
  items: CartItem[];
  total: number;
  timestamp: Date;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
    toast.success("Product deleted successfully");
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setActiveTab("products");
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleGenerateReceipt = (cartItems: CartItem[], total: number) => {
    const receipt: ReceiptData = {
      id: uuidv4(),
      items: cartItems,
      total,
      timestamp: new Date()
    };
    setReceipts([receipt, ...receipts]);
  };

  const handleDeleteReceipt = (id: string) => {
    setReceipts(receipts.filter(receipt => receipt.id !== id));
    toast.success("Receipt deleted successfully");
  };

  const handleImportProducts = (importedProducts: Product[]) => {
    setProducts(importedProducts);
    toast.success("Products imported successfully");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <div className="space-y-6">
            <ProductForm 
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              products={products}
              editingProduct={editingProduct}
              onCancelEdit={handleCancelEdit}
            />
            <ProductList 
              products={products} 
              onDeleteProduct={handleDeleteProduct}
              onEditProduct={handleEditProduct}
            />
          </div>
        );
      case "pos":
        return (
          <POSSystem 
            products={products}
            onGenerateReceipt={handleGenerateReceipt}
          />
        );
      case "receipts":
        return (
          <ReceiptSystem 
            receipts={receipts}
            onDeleteReceipt={handleDeleteReceipt}
          />
        );
      case "settings":
        return (
          <Settings 
            products={products}
            onImportProducts={handleImportProducts}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold">
              S
            </div>
            <div>
              <h1 className="text-2xl font-bold">Shop POS System</h1>
              <p className="text-sm text-muted-foreground">
                Complete POS solution with barcode generation and thermal printing
              </p>
            </div>
          </div>
        </div>
      </header>

      <POSNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;