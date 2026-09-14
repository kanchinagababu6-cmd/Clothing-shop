// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "@/components/StoreProvider";

const ADMIN_EMAIL = "kanchinagababu6@gmail.com";

export default function Header() {
  const { cart } = useStore();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const cartCount = cart ? cart.reduce((total, item) => total + (item.quantity || 1), 0) : 0;
  const isAdmin = user && user.email === ADMIN_EMAIL;

  return (
    <header
      style={{
        borderBottom: "1px solid #eee",
        padding: "14px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand Icon / Title - Direct browser navigation to home */}
      <a
        href="/"
        style={{
          textDecoration: "none",
          color: "#000",
          fontSize: "19px",
          fontWeight: "900",
          letterSpacing: "0.5px",
          cursor: "pointer",
        }}
      >
        KNB CLOTHING
      </a>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {/* Shop / Home Link */}
        <a
          href="/"
          style={{
            textDecoration: "none",
            color: "#333",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Shop
        </a>

        {/* Bag */}
        <a
          href="/checkout"
          style={{
            textDecoration: "none",
            color: "#000",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
          }}
        >
          🛍️ Bag ({cartCount})
        </a>

        {/* Profile */}
        <a
          href={user ? "/profile" : "/login"}
          style={{
            textDecoration: "none",
            fontSize: "13px",
            padding: "6px 12px",
            backgroundColor: "#f5f5f5",
            borderRadius: "6px",
            color: "#000",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
          }}
        >
          👤 {user ? "Profile" : "Login"}
        </a>

        {/* Admin Link */}
        {isAdmin && (
          <a
            href="/admin"
            style={{
              textDecoration: "none",
              fontSize: "12px",
              padding: "6px 10px",
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "4px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Admin
          </a>
        )}
      </div>
    </header>
  );
}
