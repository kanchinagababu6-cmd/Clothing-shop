// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";

const ADMIN_EMAIL = "kanchinagababu6@gmail.com";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("orders"); // 'overview', 'orders', 'products'

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // New Product Form state
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("10");
  const [newProdCategory, setNewProdCategory] = useState("topwear");
  const [newProdGender, setNewProdGender] = useState("men");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdSizes, setNewProdSizes] = useState("S, M, L, XL");
  const [newProdColors, setNewProdColors] = useState("Black, White, Navy");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        fetchAllData();
      }
    });
    return () => unsub();
  }, []);

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      // Fetch Orders
      const orderSnap = await getDocs(collection(db, "orders"));
      const orderList = orderSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(orderList);

      // Fetch Products
      const prodSnap = await getDocs(collection(db, "products"));
      const prodList = prodSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(prodList);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Order status update
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // WhatsApp Order Notification to Customer
  const sendWhatsAppUpdate = (order) => {
    if (!order.phone) {
      alert("Customer phone number is missing!");
      return;
    }
    const cleanPhone = order.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

    const text = `Hello ${order.customerName || "Valued Customer"}! 👋\n\n` +
      `Your order from *KNB Clothing* (Order ID: #${order.id.slice(0, 8)}) status has been updated to: *${order.status || "Confirmed"}* 📦\n\n` +
      `• Total Amount: ₹${order.total}\n` +
      `• Items: ${order.items?.map((i) => i.name).join(", ") || "Clothing order"}\n\n` +
      `Thank you for shopping with KNB Clothing! If you have any questions, reply directly to this message.`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Add Product Handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      alert("Please enter product name and price");
      return;
    }

    setAddingProduct(true);
    try {
      const prodData = {
        name: newProdName.trim(),
        price: Number(newProdPrice),
        stock: Number(newProdStock || 0),
        category: newProdCategory,
        gender: newProdGender,
        imageUrl: newProdImage.trim() || "https://placehold.co/400x500?text=KNB+Clothing",
        sizes: newProdSizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: newProdColors.split(",").map((c) => c.trim()).filter(Boolean),
        description: newProdDesc.trim(),
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "products"), prodData);
      setProducts([{ id: docRef.id, ...prodData }, ...products]);

      // Reset form
      setNewProdName("");
      setNewProdPrice("");
      setNewProdStock("10");
      setNewProdImage("");
      setNewProdDesc("");
      alert("Product added successfully!");
    } catch (err) {
      alert("Error adding product: " + err.message);
    } finally {
      setAddingProduct(false);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product: " + err.message);
    }
  };

  // Security Gate
  if (authChecking) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontFamily: "sans-serif" }}>
        Verifying administrator access...
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ maxWidth: "500px", margin: "80px auto", padding: "30px 20px", textAlign: "center", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: "24px", color: "#dc2626", marginBottom: "12px" }}>Access Denied</h1>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          You must be signed in as the administrator (<strong>{ADMIN_EMAIL}</strong>) to access this dashboard.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#000",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: 600,
          }}
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Analytics Metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const pendingOrders = orders.filter((o) => !o.status || o.status === "Processing" || o.status === "Pending");
  const lowStockProducts = products.filter((p) => p.stock !== undefined && Number(p.stock) < 5);

  return (
    <div style={{ maxWidth: "1100px", margin: "20px auto", padding: "0 20px 80px", fontFamily: "sans-serif" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          borderBottom: "2px solid #000",
          paddingBottom: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 4px 0", fontSize: "24px", fontWeight: "900" }}>KNB Clothing Admin Hub</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Logged in as: {user.email}</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={fetchAllData}
            style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", cursor: "pointer", fontWeight: 600 }}
          >
            🔄 Refresh
          </button>
          <Link
            href="/"
            style={{ padding: "8px 14px", borderRadius: "6px", background: "#000", color: "#fff", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}
          >
            Visit Shop ↗
          </Link>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#f8f9fa", border: "1px solid #eee" }}>
          <span style={{ fontSize: "13px", color: "#666", fontWeight: 600 }}>Total Revenue</span>
          <h3 style={{ margin: "6px 0 0", fontSize: "24px", fontWeight: "bold" }}>₹{totalRevenue}</h3>
        </div>
        <div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#f8f9fa", border: "1px solid #eee" }}>
          <span style={{ fontSize: "13px", color: "#666", fontWeight: 600 }}>Total Orders</span>
          <h3 style={{ margin: "6px 0 0", fontSize: "24px", fontWeight: "bold" }}>{orders.length}</h3>
        </div>
        <div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
          <span style={{ fontSize: "13px", color: "#991b1b", fontWeight: 600 }}>Pending Action</span>
          <h3 style={{ margin: "6px 0 0", fontSize: "24px", fontWeight: "bold", color: "#b91c1c" }}>{pendingOrders.length}</h3>
        </div>
        <div style={{ padding: "16px", borderRadius: "8px", backgroundColor: "#f8f9fa", border: "1px solid #eee" }}>
          <span style={{ fontSize: "13px", color: "#666", fontWeight: 600 }}>Total Catalog</span>
          <h3 style={{ margin: "6px 0 0", fontSize: "24px", fontWeight: "bold" }}>{products.length} Items</h3>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #ddd", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("orders")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === "orders" ? "3px solid #000" : "none",
            backgroundColor: "transparent",
            fontWeight: activeTab === "orders" ? "bold" : "normal",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          📦 Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === "products" ? "3px solid #000" : "none",
            backgroundColor: "transparent",
            fontWeight: activeTab === "products" ? "bold" : "normal",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          👕 Products & Inventory ({products.length})
        </button>
      </div>

      {/* TAB 1: ORDERS MANAGEMENT */}
      {activeTab === "orders" && (
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Customer Orders</h2>

          {loadingData ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#fafafa", borderRadius: "8px", border: "1px dashed #ccc" }}>
              <p style={{ margin: 0, color: "#666" }}>No orders placed yet. Orders made via checkout will appear here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "18px",
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                    <div>
                      <span style={{ fontSize: "12px", color: "#888", fontWeight: 600 }}>ORDER #{ord.id.slice(0, 8).toUpperCase()}</span>
                      <h3 style={{ margin: "2px 0", fontSize: "16px", fontWeight: "bold" }}>{ord.customerName || "Guest"} ({ord.phone || "No phone"})</h3>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#555" }}>📍 {ord.address || "Address not provided"}</p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Status Dropdown */}
                      <select
                        value={ord.status || "Processing"}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          fontSize: "13px",
                          fontWeight: "600",
                          backgroundColor: ord.status === "Delivered" ? "#dcfce7" : "#fef9c3",
                        }}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {/* WhatsApp Notify Button */}
                      <button
                        onClick={() => sendWhatsAppUpdate(ord)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#25D366",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        💬 Notify
                      </button>
                    </div>
                  </div>

                  {/* Order items table */}
                  <div style={{ backgroundColor: "#f9fafb", padding: "10px 14px", borderRadius: "6px", marginBottom: "10px" }}>
                    <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: 600, color: "#666" }}>ITEMS ORDERED:</p>
                    {ord.items && ord.items.length > 0 ? (
                      ord.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", margin: "2px 0" }}>
                          <span>• {item.name} ({item.size || "Free"} / {item.color || "Std"}) × {item.quantity || 1}</span>
                          <span style={{ fontWeight: 600 }}>₹{item.price * (item.quantity || 1)}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ margin: 0, fontSize: "13px" }}>Order details logged without individual items list.</p>
                    )}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                    <span style={{ color: "#666" }}>Payment: <strong>{ord.paymentMethod || "UPI"}</strong></span>
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>Total: ₹{ord.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS & INVENTORY */}
      {activeTab === "products" && (
        <div>
          {/* Add Product Section */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px", backgroundColor: "#fff", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 16px" }}>➕ Add New Clothing Item</h2>
            <form onSubmit={handleAddProduct} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Oversized Tee"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 599"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Stock Quantity</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", backgroundColor: "#fff" }}
                >
                  <option value="topwear">Topwear</option>
                  <option value="bottomwear">Bottomwear</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Target Gender</label>
                <select
                  value={newProdGender}
                  onChange={(e) => setNewProdGender(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", backgroundColor: "#fff" }}
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>Sizes (comma separated)</label>
                <input
                  type="text"
                  placeholder="S, M, L, XL, XXL"
        
