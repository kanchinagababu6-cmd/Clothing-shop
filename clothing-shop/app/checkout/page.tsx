// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/components/StoreProvider";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const WHATSAPP_PHONE_NUMBER = "917075596910";
const UPI_ID = "7075596910@ybl"; // Change to your preferred UPI VPA / PhonePe / GPay

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [savedAddressFound, setSavedAddressFound] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Load saved customer address from Firestore on mount
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.savedAddress) {
              setName(data.savedAddress.name || "");
              setPhone(data.savedAddress.phone || "");
              setAddress(data.savedAddress.address || "");
              setCity(data.savedAddress.city || "");
              setPincode(data.savedAddress.pincode || "");
              setSavedAddressFound(true);
            }
          }
        } catch (err) {
          console.error("Error reading saved address:", err);
        }
      }
    });
    return () => unsub();
  }, []);

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

  // Helper to persist order to Firestore
  const createFirestoreOrder = async () => {
    const currentUser = auth.currentUser;
    const fullAddress = `${address}, ${city} - ${pincode}`;

    if (currentUser) {
      await setDoc(
        doc(db, "users", currentUser.uid),
        {
          savedAddress: { name, phone, address, city, pincode },
          email: currentUser.email,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    const orderRef = await addDoc(collection(db, "orders"), {
      userId: currentUser ? currentUser.uid : "guest",
      customerEmail: currentUser ? currentUser.email : "",
      customerName: name,
      phone,
      address: fullAddress,
      notes: orderNotes,
      items: cart,
      subtotal,
      discount,
      shippingFee,
      total: finalTotal,
      status: "Processing",
      paymentMethod,
      orderSource: "Web Store",
      createdAt: new Date().toISOString(),
    });

    return orderRef.id;
  };

  // 1. Direct Web-Only Order Placement
  const handleDirectWebOrder = async () => {
    if (!name || !phone || !address || !pincode) {
      alert("Please enter Name, Phone, Delivery Address, and Pincode.");
      return;
    }

    setPlacingOrder(true);
    try {
      const orderId = await createFirestoreOrder();
      setOrderSuccess({
        id: orderId,
        total: finalTotal,
        paymentMethod,
        phone,
      });
      if (clearCart) clearCart();
    } catch (e) {
      console.error(e);
      alert("Failed to place order: " + e.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // 2. WhatsApp Order Placement
  const handleWhatsAppCheckout = async () => {
    if (!name || !phone || !address || !pincode) {
      alert("Please fill in Name, Phone, Delivery Address, and Pincode.");
      return;
    }

    let orderId = "PENDING";
    try {
      orderId = await createFirestoreOrder();
      if (clearCart) clearCart();
    } catch (e) {
      console.log("Firestore sync note:", e);
    }

    const fullAddress = `${address}, ${city} - ${pincode}`;
    let msg = `🛍️ *NEW ORDER - KNB CLOTHING*\n`;
    msg += `Order ID: #${orderId.slice(0, 8)}\n`;
    msg += `--------------------------------\n`;
    msg += `👤 *Customer Details:*\n`;
    msg += `• Name: ${name}\n`;
    msg += `• Phone: ${phone}\n`;
    msg += `• Address: ${fullAddress}\n`;
    if (orderNotes) msg += `• Instructions: ${orderNotes}\n`;
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

    window.open(`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ORDER SUCCESS SCREEN
  if (orderSuccess) {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=KNB%20Clothing&am=${orderSuccess.total}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;

    return (
      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "24px", textAlign: "center", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: "50px", marginBottom: "10px" }}>🎉</div>
        <h1 style={{ fontSize: "24px", fontWeight: "900", margin: "0 0 8px" }}>Order Confirmed!</h1>
        <p style={{ color: "#555", fontSize: "14px", margin: "0 0 20px" }}>
          Thank you for shopping with <strong>KNB Clothing</strong>!
        </p>

        <div style={{ background: "#f8f9fa", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "18px", textAlign: "left", marginBottom: "24px" }}>
          <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Order ID:</strong> #{orderSuccess.id.slice(0, 8).toUpperCase()}</p>
          <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Total Payable:</strong> ₹{orderSuccess.total}</p>
          <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Payment Mode:</strong> {orderSuccess.paymentMethod}</p>
          <p style={{ margin: "4px 0", fontSize: "13px" }}><strong>Phone:</strong> {orderSuccess.phone}</p>
        </div>

        {orderSuccess.paymentMethod === "UPI" && (
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "20px", marginBottom: "24px" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "16px", color: "#1e3a8a" }}>📲 Complete Your UPI Payment</h3>
            <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 14px" }}>
              Scan this QR using Google Pay, PhonePe, Paytm, or BHIM:
            </p>
            <img src={qrUrl} alt="UPI QR Code" style={{ borderRadius: "8px", border: "2px solid #fff", margin: "0 auto", display: "block" }} />
            <p style={{ marginTop: "12px", fontSize: "13px", fontWeight: "bold" }}>
              UPI ID: <span style={{ color: "#000", background: "#fff", padding: "2px 8px", borderRadius: "4px" }}>{UPI_ID}</span>
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link
            href="/profile"
            style={{ padding: "12px 20px", background: "#000", color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "600" }}
          >
            View in Profile →
          </Link>
          <Link
            href="/"
            style={{ padding: "12px 20px", background: "#fff", border: "1px solid #ccc", color: "#000", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: "600" }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

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
    <div style={{ maxWidth: "760px", margin: "30px auto", padding: "0 20px 80px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Checkout - KNB Clothing</h1>

      {savedAddressFound && (
        <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", padding: "10px 14px", borderRadius: "6px", marginBottom: "16px", fontSize: "13px" }}>
          ✓ We've auto-filled your saved delivery address. Feel free to edit it if shipping somewhere else!
        </div>
      )}

      {/* Address Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>1. Delivery Address</h3>
        <input placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        <input placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        <input placeholder="Street Address, House / Flat No. *" value={address} onChange={(e) => setAddress(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        <div style={{ display: "flex", gap: "10px" }}>
          <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
          <input placeholder="6-digit Pincode *" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        </div>
        <input placeholder="Delivery notes or landmarks (optional)" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
      </div>

      {/* Payment Options */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>2. Payment Mode</h3>
        <div style={{ display: "flex", gap: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <input type="radio" name="pay" checked={paymentMethod === "UPI"} onChange={() => setPaymentMethod("UPI")} /> UPI / Online Payment
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <input type="radio" name="pay" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} /> Cash on Delivery (COD)
          </label>
        </div>
      </div>

      {/* Coupon */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>3. Discount Code</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input placeholder="WELCOME10, FLAT100" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }} />
          <button onClick={applyCoupon} style={{ padding: "8px 16px", background: "#000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>Apply</button>
        </div>
        {couponMsg && <p style={{ fontSize: "12px", color: discount > 0 ? "green" : "red", margin: "6px 0 0" }}>{couponMsg}</p>}
      </div>

      {/* Pricing Summary */}
      <div style={{ borderTop: "2px solid #eee", paddingTop: "15px", marginBottom: "24px" }}>
        <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}><span>Subtotal:</span> <span>₹{subtotal}</span></p>
        {discount > 0 && <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", color: "green" }}><span>Discount:</span> <span>-₹{discount}</span></p>}
        <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}><span>Shipping:</span> <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span></p>
        <h2 style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}><span>Grand Total:</span> <span>₹{finalTotal}</span></h2>
      </div>

      {/* TWO DISTINCT ORDER OPTIONS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* OPTION 1: DIRECT WEBSITE ORDER */}
        <button
          type="button"
          onClick={handleDirectWebOrder}
          disabled={placingOrder}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
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
          {placingOrder ? "Placing Order..." : "⚡ Place Order on Website"}
        </button>

        {/* OPTION 2: WHATSAPP ORDER */}
        <button
          type="button"
          onClick={handleWhatsAppCheckout}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: "#25D366",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          💬 Order via WhatsApp
        </button>
      </div>
    </div>
  );
}
