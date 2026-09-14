// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/components/StoreProvider";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

const WHATSAPP_PHONE_NUMBER = "917075596910";
const UPI_ID = "7075596910@ybl";

export default function CheckoutPage() {
  const { cart, clearCart, addToCart, removeFromCart } = useStore();

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
  const [orderSuccess, setOrderSuccess] = useState(null);

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
    } else {
      setCouponMsg("Invalid coupon code.");
    }
  };

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
      createdAt: new Date().toISOString(),
    });

    return orderRef.id;
  };

  const handleDirectWebOrder = async () => {
    if (!name || !phone || !address || !pincode) {
      alert("Please enter Name, Phone, Delivery Address, and Pincode.");
      return;
    }

    setPlacingOrder(true);
    try {
      const orderId = await createFirestoreOrder();
      setOrderSuccess({ id: orderId, total: finalTotal, paymentMethod, phone });
      if (clearCart) clearCart();
    } catch (e) {
      alert("Order failed: " + e.message);
    } finally {
      setPlacingOrder(false);
    }
  };

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
      console.log(e);
    }

    const fullAddress = `${address}, ${city} - ${pincode}`;
    let msg = `🛍️ *NEW ORDER - KNB CLOTHING*\nOrder ID: #${orderId.slice(0, 8)}\n--------------------------------\n`;
    msg += `👤 *Customer Details:*\n• Name: ${name}\n• Phone: ${phone}\n• Address: ${fullAddress}\n• Payment: ${paymentMethod}\n--------------------------------\n📦 *Items:*\n`;
    cart.forEach((i, idx) => {
      msg += `${idx + 1}. ${i.name} (${i.size || "Free"} / ${i.color || "Std"}) x ${i.quantity || 1} = ₹${i.price * (i.quantity || 1)}\n`;
    });
    msg += `--------------------------------\nSubtotal: ₹${subtotal}\nShipping: ${shippingFee === 0 ? "FREE" : `₹${shippingFee}`}\n💰 *Total: ₹${finalTotal}*`;

    window.open(`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (orderSuccess) {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=KNB%20Clothing&am=${orderSuccess.total}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;

    return (
      <div style={{ maxWidth: "560px", margin: "40px auto", padding: "24px", textAlign: "center", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: "50px" }}>🎉</div>
        <h1 style={{ fontSize: "24px", fontWeight: "900", margin: "10px 0" }}>Order Confirmed!</h1>
        <div style={{ background: "#f8f9fa", borderRadius: "10px", padding: "16px", textAlign: "left", marginBottom: "20px", border: "1px solid #eee" }}>
          <p style={{ margin: "4px 0" }}><strong>Order ID:</strong> #{orderSuccess.id.slice(0, 8).toUpperCase()}</p>
          <p style={{ margin: "4px 0" }}><strong>Total:</strong> ₹{orderSuccess.total}</p>
          <p style={{ margin: "4px 0" }}><strong>Payment:</strong> {orderSuccess.paymentMethod}</p>
        </div>
        {orderSuccess.paymentMethod === "UPI" && (
          <div style={{ background: "#eff6ff", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: "15px" }}>📲 Scan UPI QR to Complete Payment</h3>
            <img src={qrUrl} alt="UPI QR" style={{ borderRadius: "8px", margin: "0 auto", display: "block" }} />
            <p style={{ margin: "10px 0 0", fontSize: "13px" }}>UPI ID: <strong>{UPI_ID}</strong></p>
          </div>
        )}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link href="/profile" style={{ padding: "10px 18px", background: "#000", color: "#fff", borderRadius: "6px", textDecoration: "none", fontSize: "13px" }}>View Order</Link>
          <Link href="/" style={{ padding: "10px 18px", border: "1px solid #ccc", color: "#000", borderRadius: "6px", textDecoration: "none", fontSize: "13px" }}>Shop More</Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "sans-serif" }}>
        <h2>Your bag is empty</h2>
        <Link href="/" style={{ display: "inline-block", marginTop: "16px", padding: "10px 20px", background: "#000", color: "#fff", textDecoration: "none", borderRadius: "6px" }}>Start Shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "760px", margin: "30px auto", padding: "0 16px 80px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>Checkout</h1>

      {/* ORDER SUMMARY (ITEMS IN BAG) */}
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: "10px", padding: "16px", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: "700" }}>🛍️ Order Summary ({cart.length} items)</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {cart.map((item, idx) => (
            <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center", borderBottom: "1px solid #f3f4f6", paddingBottom: "10px" }}>
              <img
                src={item.images?.[0] || item.imageUrl || item.image || "https://placehold.co/100x120?text=Item"}
                alt={item.name}
                style={{ width: "55px", height: "65px", objectFit: "cover", borderRadius: "6px" }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "600" }}>{item.name}</h4>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Size: <strong>{item.size || "Free"}</strong> | Color: <strong>{item.color || "Std"}</strong>
                </div>
                <div style={{ fontSize: "13px", fontWeight: "bold", marginTop: "2px" }}>
                  ₹{item.price} × {item.quantity || 1} = ₹{item.price * (item.quantity || 1)}
                </div>
              </div>
              {removeFromCart && (
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{ background: "none", border: "none", color: "#dc2626", fontSize: "18px", cursor: "pointer", padding: "4px" }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {savedAddressFound && (
        <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", padding: "10px", borderRadius: "6px", marginBottom: "16px", fontSize: "12px" }}>
          ✓ Auto-filled your saved delivery address.
        </div>
      )}

      {/* Address Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: "16px" }}>1. Delivery Address</h3>
        <input placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        <input placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        <input placeholder="Street Address, Flat / House No. *" value={address} onChange={(e) => setAddress(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        <div style={{ display: "flex", gap: "10px" }}>
          <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
          <input placeholder="6-digit Pincode *" value={pincode} onChange={(e) => setPincode(e.target.value)} style={{ flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        </div>
        <input placeholder="Landmarks (optional)" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
      </div>

      {/* Payment Options */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 10px", fontSize: "16px" }}>2. Payment Mode</h3>
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
        <h3 style={{ margin: "0 0 10px", fontSize: "16px" }}>3. Discount Code</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input placeholder="WELCOME10, FLAT100" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }} />
          <button onClick={applyCoupon} style={{ padding: "8px 16px", background: "#000", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>Apply</button>
        </div>
        {couponMsg && <p style={{ fontSize: "12px", color: discount > 0 ? "green" : "red", margin: "6px 0 0" }}>{couponMsg}</p>}
      </div>

      {/* Bill Breakdown */}
      <div style={{ borderTop: "2px solid #eee", paddingTop: "14px", marginBottom: "24px" }}>
        <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}><span>Subtotal:</span> <span>₹{subtotal}</span></p>
        {discount > 0 && <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", color: "green" }}><span>Discount:</span> <span>-₹{discount}</span></p>}
        <p style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}><span>Shipping:</span> <span>{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span></p>
        <h2 style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}><span>Grand Total:</span> <span>₹{finalTotal}</span></h2>
      </div>

      {/* Checkout Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          type="button"
          onClick={handleDirectWebOrder}
          disabled={placingOrder}
          style={{ width: "100%", padding: "14px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}
        >
          {placingOrder ? "Placing Order..." : "⚡ Place Order on Website"}
        </button>

        <button
          type="button"
          onClick={handleWhatsAppCheckout}
          style={{ width: "100%", padding: "14px", backgroundColor: "#25D366", color: "#fff", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}
        >
          💬 Complete Order via WhatsApp
        </button>
      </div>
    </div>
  );
}
