
import { Equipment } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import placeholderImg from "/placeholder.svg";

interface EquipmentCardProps {
  equipment: Equipment;
  onReserve: (equipmentId: string) => void;
}

export default function EquipmentCard({ equipment, onReserve }: EquipmentCardProps) {
  const { id, name, description, available, image } = equipment;

  return (
    <div className="bg-white rounded-xl shadow-card hover:shadow-md transition-shadow p-4 flex flex-col">
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
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">{name}</h3>
        <Badge variant={available > 0 ? "default" : "destructive"} className={`px-2 py-0.5 ${available > 0 ? "bg-green-500 hover:bg-green-600" : ""}`}>
          {available > 0 ? `${available} available` : "Out of stock"}
        </Badge>
      </div>
      <p className="text-text-muted text-sm mb-4 flex-1">{description}</p>
      <Button 
        onClick={() => onReserve(id)} 
        className="w-full bg-brand-blue hover:bg-brand-blue/90"
        disabled={available <= 0}
      >
        Reserve Now
      </Button>
    </div>
  );
}
