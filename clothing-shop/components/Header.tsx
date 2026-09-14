// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useStore } from "@/components/StoreProvider";

const ADMIN_EMAIL = "kanchinagababu6@gmail.com";

export default function Header() {
  const { cart } = useStore();
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const cartCount = cart ? cart.reduce((total, item) => total + (item.quantity || 1), 0) : 0;
  const isAdmin = user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

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
      {/* Brand Home Link */}
      <Link
        href="/"
        style={{
          textDecoration: "none",
          color: "#000",
          fontSize: "19px",
          fontWeight: "900",
          letterSpacing: "0.5px",
        }}
      >
        KNB CLOTHING
      </Link>

      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
        {/* Shop / Home Navigation */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#333",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Shop
        </Link>

        {/* Bag */}
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

        {/* Profile Link */}
        <Link
          href="/profile"
          style={{
            textDecoration: "none",
            fontSize: "13px",
            padding: "6px 12px",
            backgroundColor: "#f5f5f5",
            borderRadius: "6px",
            color: "#000",
            fontWeight: 600,
          }}
        >
          👤 Profile
        </Link>

        {/* Admin Link (Only for kanchinagababu6@gmail.com) */}
        {!loadingAuth && isAdmin && (
          <Link
            href="/admin"
            style={{
              textDecoration: "none",
              fontSize: "12px",
              padding: "6px 10px",
              backgroundColor: "#000",
              color: "#fff",
              borderRadius: "4px",
              fontWeight: 600,
            }}
          >
            Admin
          </Link>
        )}

        {/* Direct Login / Logout Button */}
        {!loadingAuth && (
          user ? (
            <button
              type="button"
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
          )
        )}
      </div>
    </header>
  );
}
