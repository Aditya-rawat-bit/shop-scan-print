import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Printer, Database, Download, Upload, Wifi } from "lucide-react";
import { toast } from "sonner";
import { Product } from "./ProductForm";
import { bluetoothPrinter } from "@/utils/bluetoothPrinter";

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
  const [isConnected, setIsConnected] = useState(false);

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

      toast("Searching for printers...", { duration: 2000 });

      const deviceName = await bluetoothPrinter.connect();
      setPrinterName(deviceName);
      setIsConnected(true);
      
      toast.success(`✅ Printer "${deviceName}" connected and ready!`);
    } catch (error: any) {
      console.error("Bluetooth connection error:", error);
      if (error.message.includes('NotFoundError')) {
        toast.error("No Bluetooth devices found. Make sure your printer is on and in pairing mode.");
      } else if (error.message.includes('NotAllowedError')) {
        toast.error("Bluetooth access denied. Please allow Bluetooth permissions.");
      } else if (error.message.includes('NetworkError')) {
        toast.error("Failed to connect to printer. Make sure it's in pairing mode.");
      } else {
        toast.error("Failed to connect: " + error.message);
      }
      setIsConnected(false);
    }
  };

  const disconnectPrinter = () => {
    bluetoothPrinter.disconnect();
    setIsConnected(false);
    setPrinterName("");
    toast.success("Printer disconnected");
  };

  const testPrint = async () => {
    if (!bluetoothPrinter.getConnectionStatus()) {
      toast.error("No printer connected. Please connect first.");
      return;
    }

    try {
      // ESC/POS commands for thermal printer
      const ESC = '\x1B';
      const LF = '\x0A';
      
      // Create test receipt with proper ESC/POS formatting
      let testReceipt = ESC + '@'; // Initialize printer
      testReceipt += ESC + 'a' + '\x01'; // Center align
      testReceipt += '================================' + LF;
      testReceipt += shopName + LF;
      if (shopAddress) testReceipt += shopAddress + LF;
      if (shopPhone) testReceipt += shopPhone + LF;
      testReceipt += '================================' + LF;
      testReceipt += ESC + 'a' + '\x00'; // Left align
      testReceipt += 'TEST PRINT' + LF;
      testReceipt += new Date().toLocaleString() + LF;
      testReceipt += '--------------------------------' + LF;
      testReceipt += 'Test Item               ₹1.00' + LF;
      testReceipt += '--------------------------------' + LF;
      testReceipt += ESC + 'E' + '\x01'; // Bold on
      testReceipt += 'TOTAL                   ₹1.00' + LF;
      testReceipt += ESC + 'E' + '\x00'; // Bold off
      testReceipt += '================================' + LF;
      testReceipt += ESC + 'a' + '\x01'; // Center align
      testReceipt += 'Test Successful!' + LF;
      testReceipt += '================================' + LF + LF + LF;
      testReceipt += ESC + 'd' + '\x03'; // Feed and cut

      await bluetoothPrinter.print(testReceipt);
      toast.success("✅ Test print sent to thermal printer!");
    } catch (error: any) {
      console.error("Print error:", error);
      toast.error("Failed to print: " + error.message);
    }
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
                <Label className="flex items-center gap-2">
                  Connected Printer
                  {bluetoothPrinter.getConnectionStatus() && <Wifi className="h-4 w-4 text-green-500" />}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {bluetoothPrinter.getDeviceName() || "No printer connected"}
                  {bluetoothPrinter.getConnectionStatus() && " (Connected)"}
                </p>
              </div>
              <div className="flex gap-2">
                {bluetoothPrinter.getConnectionStatus() ? (
                  <Button variant="outline" onClick={disconnectPrinter}>
                    Disconnect
                  </Button>
                ) : (
                  <Button onClick={handleConnectPrinter}>
                    Connect Bluetooth Printer
                  </Button>
                )}
              </div>
            </div>
            
            {bluetoothPrinter.getConnectionStatus() && (
              <Button variant="outline" onClick={testPrint}>
                🖨️ Test Print Receipt
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