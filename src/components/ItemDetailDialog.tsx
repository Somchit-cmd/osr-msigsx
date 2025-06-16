import React, { useState } from "react";
import { InventoryItem } from "@/types";
import { useTranslation } from "react-i18next";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import placeholderImg from "/placeholder.svg";

// Add global styles to remove focus outlines
const globalStyles = `
  button:focus, input:focus {
    outline: none !important;
    box-shadow: none !important;
  }
`;

interface ItemDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export default function ItemDetailDialog({
  isOpen,
  onClose,
  item,
}: ItemDetailDialogProps) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= item.available) {
      setQuantity(value);
    }
  };

  const increaseQuantity = () => {
    if (quantity < item.available) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(item, quantity);
    onClose();
  };

  return (
    <>
      <style>{globalStyles}</style>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
            <DialogDescription>{item.category || t("itemDetail.viewDetails")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex justify-center bg-gray-50 rounded-lg p-4">
              <img
                src={item.image || placeholderImg}
                alt={item.name}
                className="h-40 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = placeholderImg;
                }}
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t("itemDetail.description")}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t("itemDetail.availability")}</h4>
              <p className="text-sm">
                {t("itemDetail.availableUnits", { count: item.available })}
              </p>
            </div>

            {item.available > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">{t("itemDetail.quantity")}</h4>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-r-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={item.available}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="h-8 w-14 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-l-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    onClick={increaseQuantity}
                    disabled={quantity >= item.available}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              {t("itemDetail.cancel")}
            </Button>
            <Button
              onClick={handleAddToCart}
              className="flex-1 sm:flex-initial focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={item.available <= 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t("itemDetail.addToCart")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 