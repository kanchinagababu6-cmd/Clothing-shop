// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect automatically to Profile
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        window.location.href = "/profile";
      }
    });
    return () => unsub();
  }, [router]);

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // Force direct navigation so the header updates immediately
        window.location.href = "/profile";
      }
    } catch (e) {
      console.error(e);
      alert("Google sign-in failed: " + (e.message || "Please check popup settings"));
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "80px auto",
        padding: "32px 24px",
        textAlign: "center",
        borderRadius: "12px",
        border: "1px solid #eee",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px" }}>
        Welcome to KNB Clothing
      </h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "28px" }}>
        Sign in to view orders, track packages, and manage your account.
      </p>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#000",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <span>🌐</span>
        {loading ? "Signing in..." : "Continue with Google"}
      </button>

      <div style={{ marginTop: "24px", borderTop: "1px solid #eee", paddingTop: "16px" }}>
        <Link
          href="/"
          style={{ textDecoration: "none", color: "#666", fontSize: "13px" }}
        >
          ← Back to Store
        </Link>
      </div>
    </div>
  );
}
