// @ts-nocheck
"use client";

import Link from "next/link";
import { useStore } from "@/components/StoreProvider";

export default function Header() {
  const { cart, wishlist } = useStore();

  const cartCount = cart ? cart.reduce((total, item) => total + (item.quantity || 1), 0) : 0;
  const wishCount = wishlist ? wishlist.length : 0;

  return (
    <header
      style={{
        borderBottom: "1px solid #eee",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        href="/"
        style={{
          textDecoration: "none",
          color: "#000",
          fontSize: "22px",
          fontWeight: "900",
          letterSpacing: "1px",
        }}
      >
        KNB CLOTHING
      </Link>

      <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
        <Link
          href="/"
          style={{ textDecoration: "none", color: "#333", fontSize: "14px", fontWeight: 600 }}
        >
          Shop
        </Link>

        <Link
          href="/checkout"
          style={{
            textDecoration: "none",
            color: "#000",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          🛍️ Bag ({cartCount})
        </Link>

        <Link
          href="/admin"
          style={{
            textDecoration: "none",
            fontSize: "12px",
            padding: "6px 12px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            color: "#333",
            fontWeight: 600,
          }}
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
