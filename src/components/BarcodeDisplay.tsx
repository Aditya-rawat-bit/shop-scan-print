import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, Printer } from "lucide-react";
import { Product } from "./ProductForm";
import JsBarcode from "jsbarcode";

interface BarcodeDisplayProps {
  product: Product;
  onClose: () => void;
}

export const BarcodeDisplay = ({ product, onClose }: BarcodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      JsBarcode(canvasRef.current, product.barcode, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 16,
        textMargin: 8,
      });
    }
  }, [product.barcode]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `barcode-${product.name}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const handlePrint = () => {
    if (canvasRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Barcode - ${product.name}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  font-family: Arial, sans-serif;
                  text-align: center;
                }
                .product-info {
                  margin-bottom: 20px;
                }
                .barcode {
                  margin: 20px 0;
                }
              </style>
            </head>
            <body>
              <div class="product-info">
                <h2>${product.name}</h2>
                <p>Weight: ${product.weight}kg | Price: $${product.price.toFixed(2)}</p>
              </div>
              <div class="barcode">
                <img src="${canvasRef.current.toDataURL()}" alt="Barcode" />
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Barcode - {product.name}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span>Weight: {product.weight}kg</span>
            <span>Price: ${product.price.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex justify-center bg-white p-4 rounded-lg">
          <canvas ref={canvasRef} />
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};