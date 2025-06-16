import React from "react";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "react-i18next";
import { Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const { t } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems } =
    useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/checkout");
    onClose();
  };

  // Calculate total price (if your items have prices)
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t("cart.title")} ({totalItems})
            </SheetTitle>
          </div>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("cart.empty")}</p>
            <Button variant="outline" className="mt-4" onClick={onClose}>
              {t("cart.continueShopping")}
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 my-4">
              <ul className="space-y-4">
                {cartItems.map((cartItem) => (
                  <li
                    key={cartItem.item.id}
                    className="flex items-start gap-4 pb-4 border-b"
                  >
                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {cartItem.item.image ? (
                        <img
                          src={cartItem.item.image}
                          alt={cartItem.item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          {cartItem.item.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {cartItem.item.name}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {cartItem.item.category}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() =>
                              updateQuantity(
                                cartItem.item.id,
                                Math.max(1, cartItem.quantity - 1)
                              )
                            }
                            disabled={cartItem.quantity <= 1}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={cartItem.item.available}
                            value={cartItem.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                cartItem.item.id,
                                Math.min(
                                  Math.max(1, parseInt(e.target.value) || 1),
                                  cartItem.item.available
                                )
                              )
                            }
                            className="h-8 w-12 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() =>
                              updateQuantity(
                                cartItem.item.id,
                                Math.min(
                                  cartItem.quantity + 1,
                                  cartItem.item.available
                                )
                              )
                            }
                            disabled={cartItem.quantity >= cartItem.item.available}
                          >
                            +
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeFromCart(cartItem.item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">
                        {t("cart.available", { count: cartItem.item.available })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <SheetFooter className="border-t pt-4">
              <div className="flex items-center justify-between w-full">
                <div>
                  <span className="font-medium">{t("cart.totalItems")} {subtotal}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => clearCart()}
                  >
                    {t("cart.clear")}
                  </Button>
                  <Button onClick={handleCheckout}>
                    {t("cart.checkout")}
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar; 