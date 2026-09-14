// @ts-nocheck
"use client";

import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import Link from "next/link";

const WHATSAPP_PHONE_NUMBER = "917075596910";

const COUPONS = {
  WELCOME10: 10,
  SAVE50: 50,
  FLAT100: 100,
};

export default function CheckoutPage() {
  const { cart, removeFromCart } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  const subtotal = (cart || []).reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 50;
  const finalTotal = Math.max(0, subtotal - discount + shippingFee);

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "WELCOME10") {
      setDiscount(Math.round((subtotal * 10) / 100));
      setCouponMsg("10% discount applied!");
    } else if (code === "FLAT100") {
      setDiscount(100);
      setCouponMsg("₹100 discount applied!");
    } else if (code === "SAVE50") {
      setDiscount(50);
      setCouponMsg("₹50 discount applied!");
    } else {
      setCouponMsg("Invalid coupon code.");
    }
  };

  const handleWhatsAppCheckout = () => {
    if (!name || !phone || !address || !pincode) {
      alert("Please enter Name, Phone, Address, and Pincode.");
      return;
    }

    let msg = `🛍️ *NEW ORDER - KNB CLOTHING*\n`;
    msg += `--------------------------------\n`;
    msg += `👤 *Customer Details:*\n`;
    msg += `• Name: ${name}\n`;
    msg += `• Phone: ${phone}\n`;
    msg += `• Address: ${address}, ${city} - ${pincode}\n`;
    if (orderNotes) msg += `• Note: ${orderNotes}\n`;
    msg += `• Payment: ${paymentMethod}\n`;
    msg += `--------------------------------\n`;
    msg += `📦 *Items:*\n`;

    cart.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.name} (${item.size || "Free"} / ${item.color || "Std"}) x ${item.quantity || 1} = ₹${item.price * (item.quantity || 1)}\n`;
    });

    msg += `--------------------------------\n`;
    msg += `Subtotal: ₹${subtotal}\n`;
    if (discount > 0) msg += `Discount: -₹${discount}\n`;
    msg += `Shipping: ${shippingFee === 0 ? "FREE" : `₹${shippingFee}`}\n`;
    msg += `💰 *Total: ₹${finalTotal}*\n`;

    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  if (!cart || cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "sans-serif" }}>
        <h2>Your bag is empty</h2>
        <Link href="/" style={{ display: "inline-block", marginTop: "16px", padding: "10px 20px", background: "#000", color: "#fff", textDecoration: "none", borderRadius: "6px" }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1>Checkout - KNB Clothing</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        <h3>1. Shipping Details</h3>
        <input placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        <input placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        <input placeholder="Delivery Address *" value={address} onChange={(e) => setAddress(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        <div style={{ display: "flex", gap: "10px" }}>
          <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
          <input placeholder="Pincode *" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        </div>
        <input placeholder="Delivery instructions (optional)" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>2. Payment Method</h3>
        <div style={{ display: "flex", gap: "15px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input type="radio" name="pay" checked={paymentMethod === "UPI"} onChange={() => setPaymentMethod("UPI")} /> UPI / Online
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input type="radio" name="pay" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} /> Cash on Delivery
          </label>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>3. Promo Code</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input placeholder="WELCOME10, FLAT100" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }} />
          <button onClick={applyCoupon} style={{ padding: "8px 16px", background: "#000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}>Apply</button>
        </div>
        {couponMsg && <p style={{ fontSize: "12px", color: discount > 0 ? "green" : "red", margin: "6px 0 0" }}>{couponMsg}</p>}
      </div>

      <div style={{ borderTop: "2px solid #eee", paddingTop: "15px", marginBottom: "20px" }}>
        <p>Subtotal: ₹{subtotal}</p>
        {discount > 0 && <p style={{ color: "green" }}>Discount: -₹{discount}</p>}
        <p>Shipping: {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</p>
        <h2>Total: ₹{finalTotal}</h2>
      </div>

      <button onClick={handleWhatsAppCheckout} style={{ width: "100%", padding: "14px", background: "#25D366", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
        💬 Place Order via WhatsApp
      </button>
    </div>
  );
}
