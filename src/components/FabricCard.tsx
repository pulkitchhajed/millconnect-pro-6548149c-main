import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorSwatchList } from "./ColorSwatch";

export interface FabricItem {
  id: string;
  name: string;
  type: string;
  color: string;
  pricePerMeter: number;
  minOrder: number;
  unit: string;
  available: boolean;
  description: string;
  apc_available?: boolean;
}

export const fabricCatalog: FabricItem[] = [
  { id: "1", name: "Premium Cotton Poplin", type: "Cotton", color: "White / Off-White", pricePerMeter: 120, minOrder: 500, unit: "meters", available: true, description: "Smooth, tightly woven cotton ideal for shirts and dresses" },
  { id: "2", name: "Linen Blend Suiting", type: "Linen Blend", color: "Navy / Charcoal", pricePerMeter: 280, minOrder: 300, unit: "meters", available: true, description: "Premium linen-cotton blend for formal suits and blazers" },
  { id: "3", name: "Denim Twill 10oz", type: "Denim", color: "Indigo / Black", pricePerMeter: 180, minOrder: 1000, unit: "meters", available: true, description: "Heavy-duty denim for jeans and workwear" },
  { id: "4", name: "Silk Crepe de Chine", type: "Silk", color: "Ivory / Blush", pricePerMeter: 650, minOrder: 100, unit: "meters", available: true, description: "Luxurious silk with a subtle sheen for evening wear" },
  { id: "5", name: "Polyester Georgette", type: "Polyester", color: "Multiple", pricePerMeter: 85, minOrder: 1000, unit: "meters", available: true, description: "Lightweight, flowing fabric for dresses and scarves" },
  { id: "6", name: "Organic Cotton Jersey", type: "Cotton", color: "Natural / Custom", pricePerMeter: 150, minOrder: 500, unit: "meters", available: false, description: "Soft, stretchy knit fabric for t-shirts and casual wear" },
];

const FabricCard = ({ fabric }: { fabric: FabricItem }) => {
  const colorMap: Record<string, string> = {
    Cotton: "bg-secondary/10 text-secondary",
    "Linen Blend": "bg-primary/10 text-primary",
    Denim: "bg-primary/15 text-primary",
    Silk: "bg-secondary/15 text-secondary",
    Polyester: "bg-muted text-muted-foreground",
  };
  const badgeClass = colorMap[fabric.type] || "bg-muted text-muted-foreground";

  return (
    <div className="group rounded-xl border bg-card p-5 transition-all hover:shadow-lg hover:border-primary/30">
      <div className="mb-3 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
          {fabric.type}
        </span>
        {!fabric.available && (
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
            Out of Stock
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold">{fabric.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{fabric.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Colors</span>
          <div className="mt-1">
            <ColorSwatchList colors={fabric.color} limit={6} size="sm" />
            {!fabric.color && <span className="text-xs font-medium block">Standard</span>}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Min. Order</span>
          <p className="font-medium">{fabric.minOrder} {fabric.unit}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <div>
          <span className="text-2xl font-bold text-primary">₹{fabric.pricePerMeter}</span>
          <span className="text-sm text-muted-foreground">/meter</span>
        </div>
        <Button asChild size="sm" disabled={!fabric.available}>
          <Link to={`/order/${fabric.id}`}>
            Order <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default FabricCard;
