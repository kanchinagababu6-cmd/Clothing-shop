// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "@/components/StoreProvider";
import { useRouter } from "next/navigation";

export default function Header() {
  const { cart, wishlist } = useStore();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const cartCount = cart ? cart.reduce((total, item) => total + (item.quantity || 1), 0) : 0;

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
          fontSize: "20px",
          fontWeight: "900",
          letterSpacing: "1px",
        }}
      >
        KNB CLOTHING
      </Link>

      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
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
            padding: "6px 10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            color: "#333",
            fontWeight: 600,
          }}
        >
          Admin
        </Link>

        {/* Dynamic Auth Section */}
        {user ? (
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#dc2626",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            style={{
              textDecoration: "none",
              fontSize: "12px",
              padding: "6px 12px",
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
