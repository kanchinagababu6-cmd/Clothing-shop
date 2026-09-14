// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const WHATSAPP_PHONE_NUMBER = "917075596910";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      // Fetch customer orders from Firestore (if orders collection exists)
      try {
        const q = query(collection(db, "orders"), where("userId", "==", currentUser.uid));
        const snap = await getDocs(q);
        const orderList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(orderList);
      } catch (err) {
        console.log("No orders found or error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "sans-serif" }}>
        Loading your profile...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "850px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      {/* Account Info Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: "24px", fontWeight: "800" }}>
            👤 {user?.displayName || "My Profile"}
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Email: <strong>{user?.email}</strong>
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#dc2626",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* Quick Dashboard Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "36px",
        }}
      >
        <div style={{ border: "1px solid #eee", padding: "18px", borderRadius: "8px", backgroundColor: "#fff" }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: "15px" }}>🛍️ Active Orders</h3>
          <p style={{ margin: 0, fontSize: "22px", fontWeight: "bold" }}>{orders.length}</p>
        </div>

        <div style={{ border: "1px solid #eee", padding: "18px", borderRadius: "8px", backgroundColor: "#fff" }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: "15px" }}>💬 Support</h3>
          <a
            href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=Hi%20KNB%20Clothing%2C%20I%20have%20an%20inquiry%20regarding%20my%20account%20(${encodeURIComponent(user?.email || "")})`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#25D366", fontWeight: "bold", textDecoration: "none", fontSize: "14px" }}
          >
            Chat with us on WhatsApp →
          </a>
        </div>
      </div>

      {/* Orders Section */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>📦 Your Orders</h2>

        {orders.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              backgroundColor: "#fff",
              border: "1px dashed #ccc",
              borderRadius: "8px",
            }}
          >
            <p style={{ color: "#777", marginBottom: "16px" }}>You haven't placed any orders yet.</p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                backgroundColor: "#000",
                color: "#fff",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>Order #{ord.id.slice(0, 8)}</span>
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      backgroundColor: "#e0f2fe",
                      color: "#0369a1",
                      fontWeight: 600,
                    }}
                  >
                    {ord.status || "Processing"}
                  </span>
                </div>
                <p style={{ margin: "4px 0", fontSize: "13px", color: "#555" }}>
                  Items: {ord.items?.map((i) => i.name).join(", ") || "Standard order"}
                </p>
                <p style={{ margin: "4px 0", fontSize: "14px", fontWeight: "bold" }}>Total: ₹{ord.total}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Info / Tips Card */}
      <div style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Need Help with an Order?</h3>
        <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.5, margin: 0 }}>
          For instant tracking, order exchanges, or size changes, contact our WhatsApp support team at{" "}
          <a
            href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}`}
            style={{ color: "#25D366", fontWeight: "bold", textDecoration: "none" }}
          >
            +91 70755 96910
          </a>
          .
        </p>
      </div>
    </div>
  );
}
