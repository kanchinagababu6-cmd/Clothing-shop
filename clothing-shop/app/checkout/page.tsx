// @ts-nocheck
"use client";

import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import Link from "next/link";

const WHATSAPP_PHONE_NUMBER = "917075596910";

const COUPONS = {
  WELCOME10: { type: "percent", value: 10 },
  SAVE50: { type: "flat", value: 50 },
  FLAT100: { type: "flat", value: 100 },
};

export default function CheckoutPage() {
  const { cart, removeFromCart } = useStore();

  // Customer Details State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percent") {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else if (appliedCoupon.type === "flat") {
      discount = appliedCoupon.value;
    }
  }

  const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 50;
  const finalTotal = Math.max(0, subtotal - discount + shippingFee);

  const applyCoupon = () => {
    setCouponError("");
    const cleaned = couponCode.trim().toUpperCase();
    if (COUPONS[cleaned]) {
      setAppliedCoupon({ code: cleaned, ...COUPONS[cleaned] });
    } else {
      setCouponError("Invalid code. Try WELCOME10 or FLAT100");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleWhatsAppCheckout = (e) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      alert("Please fill in your Name, Phone Number, Address, and Pincode.");
      return;
    }

    let msg = `🛍️ *NEW ORDER - THREADLY STORE*\n`;
    msg += `--------------------------------\n`;
    msg += `👤 *Customer Details:*\n`;
    msg += `• *Name:* ${name.trim()}\n`;
    msg += `• *Contact:* ${phone.trim()}\n`;
    msg += `• *Shipping Address:*\n  ${address.trim()}, ${city.trim()} - ${pincode.trim()}\n`;
    if (orderNotes.trim()) {
      msg += `• *Note:* ${orderNotes.trim()}\n`;
    }
    msg += `• *Payment Preference:* ${paymentMethod}\n`;
    msg += `--------------------------------\n`;
    msg += `📦 *Order Summary:*\n`;

    cart.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.name}*\n`;
      msg += `   Size: ${item.size || "Free"} | Color: ${item.color || "Standard"}\n`;
      msg += `   Qty: ${item.quantity || 1} × ₹${item.price} = ₹${item.price * (item.quantity || 1)}\n`;
    });

    msg += `--------------------------------\n`;
    msg += `Subtotal: ₹${subtotal}\n`;
    if (appliedCoupon) {
      msg += `Coupon (${appliedCoupon.code}): -₹${discount}\n`;
    }
    msg += `Shipping: ${shippingFee === 0 ? "FREE" : `₹${shippingFee}`}\n`;
    msg += `💰 *TOTAL AMOUNT: ₹${finalTotal}*\n`;
    msg += `--------------------------------\n`;
    msg += `Please confirm my order and share details!`;

    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(msg)}`;
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
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "24px" }}>Checkout</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "40px" }}>
        {/* Left Column: Shipping & Payment Form */}
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>1. Shipping Details</h2>
          <form onSubmit={handleWhatsAppCheckout} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Street Address / Flat No *</label>
              <textarea
                required
                rows={2}
                placeholder="House/Door No, Street Name, Landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>City / Town</label>
                <input
                  type="text"
                  placeholder="e.g. Vijayawada"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 520001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>Delivery Note (Optional)</label>
              <input
                type="text"
                placeholder="Leave with security, call before arrival, etc."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
              />
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: 700, marginTop: "16px", marginBottom: "8px" }}>2. Payment Preference</h2>
            <div style={{ display: "flex", gap: "12px" }}>
              <label
                style={{
                  flex: 1,
                  padding: "12px",
                  border: paymentMethod === "UPI" ? "2px solid #000" : "1px solid #ccc",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={() => setPaymentMethod("UPI")}
                />
                UPI / GPay / PhonePe
              </label>

              <label
                style={{
                  flex: 1,
                  padding: "12px",
                  border: paymentMethod === "COD" ? "2px solid #000" : "1px solid #ccc",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                Cash on Delivery
              </label>
            </div>
          </form>
        </div>

        {/* Right Column: Order Items & Pricing Breakdown */}
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Order Items ({cart.length})</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "280px", overflowY: "auto", marginBottom: "20px" }}>
            {cart.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "12px",
                  gap: "12px",
                }}
              >
                <img
                  src={item.image || item.imageUrl || "https://placehold.co/80?text=No+Img"}
                  alt={item.name}
                  style={{ width: "60px", height: "75px", objectFit: "cover", borderRadius: "6px" }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 600 }}>{item.name}</h4>
                  <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#666" }}>
                    {item.size ? `Size: ${item.size}` : ""} {item.color ? `| Color: ${item.color}` : ""}
                  </p>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "13px" }}>₹{item.price} × {item.quantity || 1}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart && removeFromCart(item.id)}
                  style={{ background: "transparent", border: "none", color: "#dc2626", fontSize: "13px", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Coupon Code Box */}
          <div style={{ padding: "14px", backgroundColor: "#f9f9f9", borderRadius: "8px", marginBottom: "20px" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: 600 }}>Apply Coupon</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="WELCOME10, FLAT100"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon}
                style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc", textTransform: "uppercase", fontSize: "13px" }}
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={removeCoupon}
                  style={{ backgroundColor: "#dc2626", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "12px" }}
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  style={{ backgroundColor: "#000", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "12px" }}
                >
                  Apply
                </button>
              )}
            </div>
            {couponError && <p style={{ margin: "6px 0 0 0", color: "#dc2626", fontSize: "12px" }}>{couponError}</p>}
            {appliedCoupon && <p style={{ margin: "6px 0 0 0", color: "#16a34a", fontSize: "12px", fontWeight: 600 }}>✓ Applied: {appliedCoupon.code}</p>}
          </div>

          {/* Total Breakdown */}
          <div style={{ borderTop: "2px solid #000", paddingTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {appliedCoupon && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px", color: "#16a34a" }}>
                <span>Coupon Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
              <span>Shipping Fee</span>
              <span>{shippingFee === 0 ? <strong style={{ color: "#16a34a" }}>FREE</strong> : `₹${shippingFee}`}</span>
            </div>
            {subtotal <= 999 && (
              <p style={{ margin: "4px 0 10px 0", fontSize: "11px", color: "#777" }}>
                Tip: Add ₹{1000 - subtotal} more for free delivery!
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0 20px" }}>
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>Total Payable:</span>
              <span style={{ fontSize: "22px", fontWeight: "bold" }}>₹{finalTotal}</span>
            </div>

            <button
              type="button"
              onClick={handleWhatsAppCheckout}
              style={{
                width: "100%",
                backgroundColor: "#25D366",
                color: "#fff",
                border: "none",
                padding: "14px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              💬 Place Order via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
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
