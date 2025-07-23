import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Receipt, Settings } from "lucide-react";

interface POSNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const POSNavigation = ({ activeTab, onTabChange }: POSNavigationProps) => {
  const tabs = [
    { id: "products", label: "Products", icon: Package },
    { id: "pos", label: "Point of Sale", icon: ShoppingCart },
    { id: "receipts", label: "Receipts", icon: Receipt },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex gap-2 p-4 bg-card border-b">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
};