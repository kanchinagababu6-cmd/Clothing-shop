// @ts-nocheck
"use client";

import { useStore } from "@/components/StoreProvider";
import Link from "next/link";

const WHATSAPP_PHONE_NUMBER = "917075596910";

export default function CheckoutPage() {
  const { cart, removeFromCart } = useStore();

  const total = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    let message = `🛒 *New Order from THREADLY Shop*\n\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   • Size: ${item.size || "N/A"} | Color: ${item.color || "N/A"}\n`;
      message += `   • Qty: ${item.quantity || 1} × ₹${item.price} = ₹${item.price * (item.quantity || 1)}\n\n`;
    });

    message += `💰 *Grand Total: ₹${total}*\n\n`;
    message += `Please confirm my order and share payment details!`;

    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "sans-serif" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "12px" }}>Your bag is empty</h2>
        <p style={{ color: "#666", marginBottom: "24px" }}>Looks like you haven't added anything to your cart yet.</p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#000",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "850px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>Review Your Order</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {cart.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #eee",
              paddingBottom: "16px",
              gap: "16px",
            }}
          >
            <img
              src={item.image || item.imageUrl || "https://placehold.co/100?text=No+Img"}
              alt={item.name}
              style={{ width: "70px", height: "90px", objectFit: "cover", borderRadius: "6px" }}
            />

            <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "600" }}>{item.name}</h3>
              <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#666" }}>
                {item.size ? `Size: ${item.size}` : ""} {item.color ? `| Color: ${item.color}` : ""}
              </p>
              <p style={{ margin: 0, fontWeight: "bold" }}>₹{item.price}</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>Qty: {item.quantity || 1}</span>
              <button
                onClick={() => removeFromCart && removeFromCart(item.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#dc2626",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "32px", borderTop: "2px solid #000", paddingTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>Total:</span>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>₹{total}</span>
        </div>

        <button
          onClick={handleWhatsAppCheckout}
          style={{
            width: "100%",
            backgroundColor: "#25D366",
            color: "#fff",
            border: "none",
            padding: "16px",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          💬 Order All via WhatsApp
        </button>
      </div>
    </div>
  );
}
