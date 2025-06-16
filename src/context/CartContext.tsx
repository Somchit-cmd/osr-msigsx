import React, { createContext, useState, useContext, ReactNode } from "react";
import { InventoryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

// Define the cart item type (inventory item + quantity)
export interface CartItem {
  item: InventoryItem;
  quantity: number;
}

// Define the cart context interface
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: InventoryItem, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Export the provider component
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Calculate total items in cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Add item to cart
  const addToCart = (item: InventoryItem, quantity: number) => {
    // Check if we already have this item in the cart
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.item.id === item.id
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedItems = [...cartItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      
      // Check if new quantity exceeds available stock
      if (newQuantity > item.available) {
        toast({
          title: "Cannot add to cart",
          description: `Only ${item.available} units available.`,
          variant: "destructive",
        });
        return;
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity;
      setCartItems(updatedItems);
    } else {
      // Add new item if it doesn't exist
      if (quantity > item.available) {
        toast({
          title: "Cannot add to cart",
          description: `Only ${item.available} units available.`,
          variant: "destructive",
        });
        return;
      }
      
      setCartItems([...cartItems, { item, quantity }]);
    }
    
    toast({
      title: "Added to cart",
      description: `${quantity} ${item.name}(s) added to your cart.`,
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter((item) => item.item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    const itemIndex = cartItems.findIndex((item) => item.item.id === itemId);
    
    if (itemIndex >= 0) {
      const item = cartItems[itemIndex].item;
      
      // Validate against available stock
      if (quantity > item.available) {
        toast({
          title: "Invalid quantity",
          description: `Only ${item.available} units available.`,
          variant: "destructive",
        });
        return;
      }
      
      const updatedItems = [...cartItems];
      updatedItems[itemIndex].quantity = quantity;
      setCartItems(updatedItems);
    }
  };

  // Clear the cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
} 