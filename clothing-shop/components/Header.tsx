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

  const goTo = (path: string) => {
    window.location.assign(path);
  };

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
      {/* KNB CLOTHING Logo Button */}
      <button
        type="button"
        onClick={() => goTo("/")}
        style={{
          background: "none",
          border: "none",
          color: "#000",
          fontSize: "19px",
          fontWeight: "900",
          letterSpacing: "0.5px",
          cursor: "pointer",
          padding: 0,
        }}
      >
        KNB CLOTHING
      </button>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {/* Shop / Home Button */}
        <button
          type="button"
          onClick={() => goTo("/")}
          style={{
            background: "none",
            border: "none",
            color: "#333",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
          }}
        >
          Shop
        </button>

        {/* Bag Button */}
        <button
          type="button"
          onClick={() => goTo("/checkout")}
          style={{
            background: "none",
            border: "none",
            color: "#000",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            cursor: "pointer",
            padding: 0,
          }}
        >
          🛍️ Bag ({cartCount})
        </button>

        {/* Profile Button */}
        <button
          type="button"
          onClick={() => goTo(user ? "/profile" : "/login")}
          style={{
            fontSize: "13px",
            padding: "6px 12px",
            backgroundColor: "#f5f5f5",
            borderRadius: "6px",
            color: "#000",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          👤 {user ? "Profile" : "Login"}
        </button>

        {/* Admin Link */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => goTo("/admin")}
            style={{
              fontSize: "12px",
              padding: "6px 10px",
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "4px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
}
