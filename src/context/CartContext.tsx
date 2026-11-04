import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "@/types";
import { toast } from "sonner";

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    qty?: number,
    selectedColor?: string,
    selectedStorage?: string,
    unitPrice?: number
  ) => void;
  removeFromCart: (identifier: string) => void;
  updateQty: (identifier: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("shipnest-cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("shipnest-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (
    product: Product,
    qty = 1,
    selectedColor?: string,
    selectedStorage?: string,
    unitPrice?: number
  ) => {
    const effectivePrice = unitPrice !== undefined ? unitPrice : (product.price || 0);
    const targetLineId = `${product.id}__${selectedColor || ""}_${selectedStorage || ""}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          (i.lineId || `${i.product.id}__${i.selectedColor || ""}_${i.selectedStorage || ""}`) ===
          targetLineId
      );

      if (existingIndex > -1) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, qty: item.qty + qty, unitPrice: effectivePrice }
            : item
        );
      }

      return [
        ...prev,
        {
          product,
          qty,
          selectedColor,
          selectedStorage,
          unitPrice: effectivePrice,
          lineId: targetLineId,
        },
      ];
    });

    const variantLabel = [selectedColor, selectedStorage].filter(Boolean).join(" · ");
    toast.success(
      variantLabel
        ? `${product.name} (${variantLabel}) added to bag`
        : `${product.name} added to bag`
    );
  };

  const removeFromCart = (identifier: string) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          (i.lineId || `${i.product.id}__${i.selectedColor || ""}_${i.selectedStorage || ""}`) !==
            identifier && i.product.id !== identifier
      )
    );
    toast.info("Item removed from bag");
  };

  const updateQty = (identifier: string, qty: number) => {
    if (qty < 1) return removeFromCart(identifier);
    setItems((prev) =>
      prev.map((i) => {
        const lineId =
          i.lineId || `${i.product.id}__${i.selectedColor || ""}_${i.selectedStorage || ""}`;
        if (lineId === identifier || i.product.id === identifier) {
          return { ...i, qty };
        }
        return i;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce(
    (sum, i) =>
      sum +
      (i.unitPrice !== undefined ? i.unitPrice : i.product.price || 0) * i.qty,
    0
  );

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
