// @ts-nocheck
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const StoreContext = createContext<any>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);

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

  const saveCart = (items: any[]) => {
    setCart(items);
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (e) {}
  };

  const addToCart = (item: any) => {
    const existingIndex = cart.findIndex(
      (c) => c.id === item.id && c.size === item.size && c.color === item.color
    );
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity = (updated[existingIndex].quantity || 1) + (item.quantity || 1);
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

  const toggleWishlist = (prod: any) => {
    let updated;
    if (wishlist.some((w) => w.id === prod.id)) {
      updated = wishlist.filter((w) => w.id !== prod.id);
    } else {
      updated = [...wishlist, prod];
    }
    setWishlist(updated);
    try {
      localStorage.setItem("wishlist", JSON.stringify(updated));
    } catch (e) {}
  };

  const isWishlisted = (id: string) => {
    return (wishlist || []).some((w) => w.id === id);
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

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    return {
      cart: [],
      wishlist: [],
      addToCart: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      toggleWishlist: () => {},
      isWishlisted: () => false,
    };
  }
  return context;
}
