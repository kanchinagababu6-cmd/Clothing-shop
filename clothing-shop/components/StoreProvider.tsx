"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { CartItem, Product } from "@/lib/types";

type Ctx = {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartTotal: number;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("clothing-cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("clothing-cart", JSON.stringify(cart));
  }, [cart]);

  function addToCart(product: Product, size: string, color: string) {
    setCart((old) => {
      const index = old.findIndex(x => x.id === product.id && x.size === size && x.color === color);
      if (index >= 0) {
        return old.map((x, i) => i === index ? { ...x, quantity: x.quantity + 1 } : x);
      }
      return [...old, { ...product, size, color, quantity: 1 }];
    });
  }

  return (
    <StoreContext.Provider value={{
      cart,
      addToCart,
      removeFromCart: (index) => setCart(c => c.filter((_, i) => i !== index)),
      clearCart: () => setCart([]),
      cartTotal: cart.reduce((s, x) => s + x.price * x.quantity, 0)
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
