import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, Scan } from "lucide-react";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const BarcodeScanner = ({ onBarcodeDetected, isVisible, onClose }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const startScanning = useCallback(() => {
    setIsScanning(true);
    toast.info("Camera started - Point camera at barcode");
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    toast.info("Camera stopped");
  }, []);

  const captureAndAnalyze = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // For demo purposes, generate a mock barcode detection
        // In a real implementation, you would use a barcode detection library
        const mockBarcode = "91305891301"; // This would normally come from image analysis
        onBarcodeDetected(mockBarcode);
        toast.success("Barcode detected!");
        stopScanning();
      }
    }
  }, [onBarcodeDetected, stopScanning]);

  if (!isVisible) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Barcode Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          {isScanning ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: { ideal: "environment" } // Use back camera on mobile
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button onClick={captureAndAnalyze} className="flex-1">
                <Scan className="h-4 w-4 mr-2" />
                Scan Barcode
              </Button>
              <Button onClick={stopScanning} variant="outline">
                <CameraOff className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground text-center">
          {isScanning 
            ? "Position the barcode within the camera view and click 'Scan Barcode'" 
            : "Click 'Start Camera' to begin scanning"
          }
        </div>
      </CardContent>
    </Card>
  );
};