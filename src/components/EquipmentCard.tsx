
import { Equipment } from "@/types";
import { Button } from "@/components/ui/button";
import placeholderImg from "/placeholder.svg";

interface EquipmentCardProps {
  equipment: Equipment;
  onReserve: (equipmentId: string) => void;
}

export default function EquipmentCard({ equipment, onReserve }: EquipmentCardProps) {
  const { id, name, description, available, image } = equipment;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-shrink-0 w-10 h-10 mr-3">
          <img 
            src={image || placeholderImg} 
            alt={name} 
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = placeholderImg;
            }}
          />
        </div>
        
        {available > 0 ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {available} available
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Out of stock
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-1">{name}</h3>
      <p className="text-sm text-gray-500 mb-4 flex-1">{description}</p>
      
      <Button 
        onClick={() => onReserve(id)} 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        disabled={available <= 0}
      >
        Request Now
      </Button>
    </div>
  );
}
