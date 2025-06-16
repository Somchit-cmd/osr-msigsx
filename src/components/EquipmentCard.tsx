import { InventoryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye, Send } from "lucide-react";
import placeholderImg from "/placeholder.svg";
import { useTranslation } from 'react-i18next';
import { useCart } from "@/context/CartContext";

interface EquipmentCardProps {
  equipment: InventoryItem;
  onView: (equipmentId: string) => void;
  onRequestNow: (equipmentId: string) => void;
}

export default function EquipmentCard({ equipment, onView, onRequestNow }: EquipmentCardProps) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { id, name, description, available, image } = equipment;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(equipment, 1);
  };

  const handleRequestNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestNow(id);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-card hover:shadow-md transition-shadow p-4 flex flex-col relative cursor-pointer"
      onClick={() => onView(id)}
    >
      <Badge 
        variant={available > 0 ? "default" : "destructive"} 
        className={`px-2 py-0.5 absolute top-3 right-3 z-10 ${
          available > 0 ? "bg-green-500 hover:bg-green-600" : ""
        }`}
      >
        {available > 0 ? t('equipment.available', {count: available}) : t('equipment.outOfStock')}
      </Badge>

      <div className="flex justify-center mb-4 bg-gray-50 rounded-lg p-4">
        <img 
          src={image || placeholderImg} 
          alt={name} 
          className="h-28 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImg;
          }}
        />
      </div>
      
      <h3 className="font-semibold text-lg mb-2">{name}</h3>
      <p className="text-text-muted text-sm mb-4 flex-1 line-clamp-2">{description}</p>
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onView(id);
          }}
          className="col-span-2"
          size="sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          {t('equipment.view')}
        </Button>
        
        <Button 
          onClick={handleAddToCart}
          variant="secondary" 
          className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20"
          disabled={available <= 0}
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {t('equipment.addToCart')}
        </Button>
        
        <Button 
          onClick={handleRequestNow}
          className="bg-brand-blue hover:bg-brand-blue/90"
          disabled={available <= 0}
          size="sm"
        >
          <Send className="h-4 w-4 mr-2" />
          {t('equipment.requestNow')}
        </Button>
      </div>
    </div>
  );
}
