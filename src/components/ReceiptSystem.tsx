import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, Receipt, Trash2 } from "lucide-react";
import { Product } from "./ProductForm";

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

interface ReceiptSystemProps {
  receipts: ReceiptData[];
  onDeleteReceipt: (id: string) => void;
}

interface ShopSettings {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  taxRate: number;
  autoConnect: boolean;
  printerName: string;
}

export const ReceiptSystem = ({ receipts, onDeleteReceipt }: ReceiptSystemProps) => {
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    shopName: "MY SHOP",
    shopAddress: "",
    shopPhone: "",
    taxRate: 0,
    autoConnect: false,
    printerName: ""
  });
  const printRef = useRef<HTMLDivElement>(null);

  // Load shop settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pos-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setShopSettings({
          shopName: settings.shopName || "MY SHOP",
          shopAddress: settings.shopAddress || "",
          shopPhone: settings.shopPhone || "",
          taxRate: settings.taxRate || 0,
          autoConnect: settings.autoConnect || false,
          printerName: settings.printerName || ""
        });
      } catch (error) {
        console.error("Failed to load shop settings:", error);
      }
    }
  }, []);

  const handlePrint = (receipt: ReceiptData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePrintableReceipt(receipt);
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = (receipt: ReceiptData) => {
    const receiptText = generateTextReceipt(receipt);
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generatePrintableReceipt = (receipt: ReceiptData) => {
    const subtotal = receipt.total / (1 + shopSettings.taxRate / 100);
    const taxAmount = receipt.total - subtotal;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: monospace; width: 3in; margin: 0; padding: 10px; }
          .center { text-align: center; }
          .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 2px 0; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2>${shopSettings.shopName}</h2>
          ${shopSettings.shopAddress ? `<p>${shopSettings.shopAddress}</p>` : ''}
          ${shopSettings.shopPhone ? `<p>Phone: ${shopSettings.shopPhone}</p>` : ''}
          <p>Receipt #${receipt.id.slice(0, 8)}</p>
          <p>${receipt.timestamp.toLocaleString()}</p>
          ${receipt.customerName ? `<p>Customer: ${receipt.customerName}</p>` : ''}
        </div>
        <div class="line"></div>
        <table>
          ${receipt.items.map(item => `
             <tr>
               <td>${item.name}</td>
               <td class="right">${item.quantity}x</td>
               <td class="right">₹${(item.price * item.quantity).toFixed(2)}</td>
             </tr>
          `).join('')}
        </table>
        <div class="line"></div>
        <table>
           ${shopSettings.taxRate > 0 ? `
           <tr>
             <td>Subtotal</td>
             <td class="right">₹${subtotal.toFixed(2)}</td>
           </tr>
           <tr>
             <td>Tax (${shopSettings.taxRate}%)</td>
             <td class="right">₹${taxAmount.toFixed(2)}</td>
           </tr>
           ` : ''}
           <tr>
             <td><strong>TOTAL</strong></td>
             <td class="right"><strong>₹${receipt.total.toFixed(2)}</strong></td>
           </tr>
        </table>
        <div class="line"></div>
        <div class="center">
          <p>Thank you for your business!</p>
          <p>Visit us again!</p>
        </div>
      </body>
      </html>
    `;
  };

  const generateTextReceipt = (receipt: ReceiptData) => {
    const subtotal = receipt.total / (1 + shopSettings.taxRate / 100);
    const taxAmount = receipt.total - subtotal;
    
    return `
=============================
      ${shopSettings.shopName}
${shopSettings.shopAddress ? shopSettings.shopAddress + '\n' : ''}${shopSettings.shopPhone ? 'Phone: ' + shopSettings.shopPhone + '\n' : ''}
=============================
Receipt #${receipt.id.slice(0, 8)}
${receipt.timestamp.toLocaleString()}
${receipt.customerName ? `Customer: ${receipt.customerName}` : ''}
-----------------------------
${receipt.items.map(item => 
  `${item.name.padEnd(15)} ${item.quantity}x ₹${(item.price * item.quantity).toFixed(2).padStart(8)}`
).join('\n')}
-----------------------------
${shopSettings.taxRate > 0 ? `Subtotal${' '.repeat(10)}₹${subtotal.toFixed(2).padStart(8)}
Tax (${shopSettings.taxRate}%)${' '.repeat(8)}₹${taxAmount.toFixed(2).padStart(8)}
-----------------------------
` : ''}TOTAL${' '.repeat(15)}₹${receipt.total.toFixed(2).padStart(8)}
=============================
    Thank you for your business!
         Visit us again!
=============================
    `;
  };

  if (receipts.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No receipts generated yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Receipt History ({receipts.length} receipts)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      #{receipt.id.slice(0, 8)}
                    </Badge>
                  </TableCell>
                  <TableCell>{receipt.customerName || "Walk-in"}</TableCell>
                  <TableCell>{receipt.items.length} items</TableCell>
                  <TableCell>₹{receipt.total.toFixed(2)}</TableCell>
                  <TableCell>{receipt.timestamp.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(receipt)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(receipt)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(receipt)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteReceipt(receipt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedReceipt && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Receipt Details
              <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Receipt ID:</strong> #{selectedReceipt.id.slice(0, 8)}
                </div>
                <div>
                  <strong>Date:</strong> {selectedReceipt.timestamp.toLocaleString()}
                </div>
                <div>
                  <strong>Customer:</strong> {selectedReceipt.customerName || "Walk-in"}
                </div>
                <div>
                  <strong>Total Items:</strong> {selectedReceipt.items.length}
                </div>
              </div>
              
              <Separator />
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedReceipt.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div>{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.weight}kg ({(item.weight * 1000).toFixed(0)}g)
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.price.toFixed(2)}</TableCell>
                      <TableCell>₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">
                  Total: ₹{selectedReceipt.total.toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handlePrint(selectedReceipt)}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" onClick={() => handleDownload(selectedReceipt)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
