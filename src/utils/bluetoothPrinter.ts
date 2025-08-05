// Bluetooth thermal printer utility
declare global {
  interface Navigator {
    bluetooth: {
      requestDevice(options: any): Promise<any>;
    };
  }
}

export class BluetoothPrinter {
  private device: any | null = null;
  private characteristic: any | null = null;
  private isConnected = false;

  async connect(): Promise<string> {
    try {
      // Simple approach - just show all Bluetooth devices
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '0000ff00-0000-1000-8000-00805f9b34fb',
          '00001101-0000-1000-8000-00805f9b34fb',
          '0000180f-0000-1000-8000-00805f9b34fb',
          '0000fff0-0000-1000-8000-00805f9b34fb'
        ]
      });

      // Connect to GATT server
      const server = await device.gatt!.connect();
      
      // Try to find any writable characteristic
      let writeCharacteristic;
      const services = await server.getPrimaryServices();
      
      for (const service of services) {
        try {
          const characteristics = await service.getCharacteristics();
          
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              writeCharacteristic = char;
              break;
            }
          }
          
          if (writeCharacteristic) break;
        } catch (e) {
          continue;
        }
      }

      // If no writable characteristic found, still save device for future use
      this.device = device;
      this.characteristic = writeCharacteristic;
      this.isConnected = true;

      return device.name || "Bluetooth Printer";
    } catch (error: any) {
      throw new Error(`Failed to connect: ${error.message}`);
    }
  }

  disconnect() {
    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
    this.isConnected = false;
  }

  async print(data: string) {
    if (!this.characteristic || !this.isConnected) {
      throw new Error("Printer not connected");
    }

    const encoder = new TextEncoder();
    const escPos = encoder.encode(data);
    
    // Send in chunks
    const chunkSize = 20;
    for (let i = 0; i < escPos.length; i += chunkSize) {
      const chunk = escPos.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  getDeviceName() {
    return this.device?.name || null;
  }
}

// Global printer instance
export const bluetoothPrinter = new BluetoothPrinter();