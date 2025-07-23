import { useState } from "react";
import { ProductForm, Product } from "@/components/ProductForm";
import { ProductList } from "@/components/ProductList";
import { POSNavigation } from "@/components/POSNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<Product[]>([]);

  const handleAddProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success("Product deleted successfully!");
  };

  const handleEditProduct = (product: Product) => {
    // For now, just show a toast - we can implement edit functionality later
    toast.info("Edit functionality coming soon!");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <ProductForm onAddProduct={handleAddProduct} />
            <ProductList 
              products={products}
              onDeleteProduct={handleDeleteProduct}
              onEditProduct={handleEditProduct}
            />
          </div>
        );
      case "pos":
        return (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Point of Sale</h3>
              <p className="text-muted-foreground text-center">
                POS functionality coming soon!<br />
                This will include barcode scanning and billing.
              </p>
            </CardContent>
          </Card>
        );
      case "receipts":
        return (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Receipt History</h3>
              <p className="text-muted-foreground">Receipt management coming soon!</p>
            </CardContent>
          </Card>
        );
      case "settings":
        return (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Store className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Settings</h3>
              <p className="text-muted-foreground">
                Printer configuration and app settings coming soon!
              </p>
            </CardContent>
          </Card>
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
            <Store className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Shop POS System</h1>
              <p className="text-sm text-muted-foreground">
                Manage products, generate barcodes, and process sales
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