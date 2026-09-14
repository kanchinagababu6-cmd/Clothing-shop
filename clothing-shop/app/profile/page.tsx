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
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      try {
        const q = query(collection(db, "orders"), where("userId", "==", currentUser.uid));
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.log("Error loading orders:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "sans-serif" }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", padding: "0 16px 60px", fontFamily: "sans-serif" }}>
      {/* User Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fa", padding: "20px", borderRadius: "10px", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: "bold" }}>👤 {user?.displayName || "Customer Profile"}</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}
        >
          Logout
        </button>
      </div>

      {/* Support Button */}
      <div style={{ padding: "14px", border: "1px solid #eee", borderRadius: "8px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "14px" }}>Need help with an order?</span>
        <a
          href={`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=Hi%20KNB%20Clothing%2C%20I%20have%20an%20inquiry%20regarding%20my%20account%20(${encodeURIComponent(user?.email || "")})`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: "#25D366", color: "#fff", padding: "6px 12px", borderRadius: "6px", textDecoration: "none", fontSize: "12px", fontWeight: "bold" }}
        >
          WhatsApp Support
        </a>
      </div>

      {/* Orders List */}
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "14px" }}>Your Orders ({orders.length})</h3>

      {orders.length === 0 ? (
        <div style={{ padding: "30px", textAlign: "center", border: "1px dashed #ccc", borderRadius: "8px" }}>
          <p style={{ color: "#777", margin: "0 0 12px" }}>No orders placed yet.</p>
          <Link href="/" style={{ display: "inline-block", padding: "8px 16px", background: "#000", color: "#fff", borderRadius: "6px", textDecoration: "none", fontSize: "13px" }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {orders.map((ord) => (
            <div key={ord.id} style={{ border: "1px solid #eee", borderRadius: "8px", padding: "14px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>Order #{ord.id.slice(0, 8).toUpperCase()}</span>
                <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "10px", background: ord.status === "Delivered" ? "#dcfce7" : "#e0f2fe", color: ord.status === "Delivered" ? "#166534" : "#0369a1", fontWeight: "600" }}>
                  {ord.status || "Processing"}
                </span>
              </div>
              <div style={{ fontSize: "13px", color: "#555" }}>
                Items: {ord.items?.map((i) => `${i.name} (x${i.quantity || 1})`).join(", ")}
              </div>
              <div style={{ marginTop: "6px", fontWeight: "bold", fontSize: "14px" }}>
                Total: ₹{ord.total}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
    }
