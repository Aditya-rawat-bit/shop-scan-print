import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Printer, Database, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Product } from "./ProductForm";

interface SettingsProps {
  products: Product[];
  onImportProducts: (products: Product[]) => void;
}

export const Settings = ({ products, onImportProducts }: SettingsProps) => {
  const [shopName, setShopName] = useState("MY SHOP");
  const [shopAddress, setShopAddress] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [autoConnect, setAutoConnect] = useState(false);
  const [printerName, setPrinterName] = useState("");

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('pos-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setShopName(settings.shopName || "MY SHOP");
        setShopAddress(settings.shopAddress || "");
        setShopPhone(settings.shopPhone || "");
        setTaxRate(settings.taxRate?.toString() || "0");
        setAutoConnect(settings.autoConnect || false);
        setPrinterName(settings.printerName || "");
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      shopName,
      shopAddress,
      shopPhone,
      taxRate: parseFloat(taxRate),
      autoConnect,
      printerName
    };
    
    localStorage.setItem('pos-settings', JSON.stringify(settings));
    toast.success("Settings saved successfully!");
  };

  const handleExportData = () => {
    const data = {
      products,
      settings: {
        shopName,
        shopAddress,
        shopPhone,
        taxRate,
        autoConnect,
        printerName
      },
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Data exported successfully!");
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.products && Array.isArray(data.products)) {
          onImportProducts(data.products);
        }
        
        if (data.settings) {
          setShopName(data.settings.shopName || "MY SHOP");
          setShopAddress(data.settings.shopAddress || "");
          setShopPhone(data.settings.shopPhone || "");
          setTaxRate(data.settings.taxRate?.toString() || "0");
          setAutoConnect(data.settings.autoConnect || false);
          setPrinterName(data.settings.printerName || "");
        }
        
        toast.success("Data imported successfully!");
      } catch (error) {
        toast.error("Failed to import data. Invalid file format.");
      }
    };
    
    reader.readAsText(file);
    // Reset the input
    event.target.value = '';
  };

  const handleConnectPrinter = async () => {
    try {
      // Check if Web Bluetooth is supported
      if (!('bluetooth' in navigator)) {
        toast.error("Bluetooth is not supported in this browser. Please use Chrome or Edge.");
        return;
      }

      // Request Bluetooth device - use acceptAllDevices for broader compatibility
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '0000ff00-0000-1000-8000-00805f9b34fb',
          '00001101-0000-1000-8000-00805f9b34fb',
          '0000180f-0000-1000-8000-00805f9b34fb'
        ]
      });

      setPrinterName(device.name || "Unknown Printer");
      toast.success(`Connected to ${device.name || "Bluetooth Printer"}`);
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        toast.error("No Bluetooth printer found. Make sure your printer is in pairing mode.");
      } else {
        toast.error("Failed to connect to printer: " + error.message);
      }
    }
  };

  const testPrint = () => {
    if (!printerName) {
      toast.error("No printer connected");
      return;
    }

    // Create a test receipt
    const testReceipt = `
=============================
         ${shopName}
${shopAddress ? shopAddress + '\n' : ''}${shopPhone ? shopPhone + '\n' : ''}
=============================
TEST PRINT
${new Date().toLocaleString()}
-----------------------------
Test Item               $1.00
-----------------------------
TOTAL                   $1.00
=============================
    Test Successful!
=============================
    `;

    // For now, just open print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre>${testReceipt}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
    
    toast.success("Test print sent to printer");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Shop Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Enter shop name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shopPhone">Phone Number</Label>
              <Input
                id="shopPhone"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="shopAddress">Shop Address</Label>
            <Input
              id="shopAddress"
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              placeholder="Enter shop address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="Enter tax rate"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Thermal Printer Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Connect to Printer</Label>
              <p className="text-sm text-muted-foreground">
                Automatically connect to saved printer on startup
              </p>
            </div>
            <Switch
              checked={autoConnect}
              onCheckedChange={setAutoConnect}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Connected Printer</Label>
                <p className="text-sm text-muted-foreground">
                  {printerName || "No printer connected"}
                </p>
              </div>
              <Button onClick={handleConnectPrinter}>
                Connect Bluetooth Printer
              </Button>
            </div>
            
            {printerName && (
              <Button variant="outline" onClick={testPrint}>
                Test Print
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
                id="import-file"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('import-file')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Export your products and settings as a backup, or import from a previous backup.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>
          Save All Settings
        </Button>
      </div>
    </div>
  );
};