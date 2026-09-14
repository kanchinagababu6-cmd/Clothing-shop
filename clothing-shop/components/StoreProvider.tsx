// @ts-nocheck
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem, Product } from "@/lib/types";

type Ctx = {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
};

const StoreContext = createContext<Ctx>({
  cart: [],
  wishlist: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  toggleWishlist: () => {},
  isWishlisted: () => false,
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) setCart(JSON.parse(storedCart));
      const storedWish = localStorage.getItem("wishlist");
      if (storedWish) setWishlist(JSON.parse(storedWish));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem("cart", JSON.stringify(items));
  };

  const addToCart = (item: CartItem) => {
    const existing = cart.find(
      (c) => c.id === item.id && c.size === item.size && c.color === item.color
    );
    if (existing) {
      const updated = cart.map((c) =>
        c.id === item.id && c.size === item.size && c.color === item.color
          ? { ...c, quantity: (c.quantity || 1) + (item.quantity || 1) }
          : c
      );
      saveCart(updated);
    } else {
      saveCart([...cart, item]);
    }
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter((c) => c.id !== id);
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const toggleWishlist = (prod: Product) => {
    let updated;
    if (wishlist.some((w) => w.id === prod.id)) {
      updated = wishlist.filter((w) => w.id !== prod.id);
    } else {
      updated = [...wishlist, prod];
    }
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  const isWishlisted = (id: string) => {
    return wishlist.some((w) => w.id === id);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);

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
