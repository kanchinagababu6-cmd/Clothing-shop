// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";

const ADMIN_EMAIL = "kanchinagababu6@gmail.com";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // New product form
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [category, setCategory] = useState("topwear");
  const [gender, setGender] = useState("men");
  const [image, setImage] = useState("");
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        fetchData();
      }
    });
    return () => unsub();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const orderSnap = await getDocs(collection(db, "orders"));
      setOrders(orderSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const prodSnap = await getDocs(collection(db, "products"));
      setProducts(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const notifyWhatsApp = (order) => {
    if (!order.phone) return alert("Phone missing!");
    const clean = order.phone.replace(/[^0-9]/g, "");
    const phone = clean.startsWith("91") ? clean : `91${clean}`;
    const text = `Hi ${order.customerName || "Customer"}! Your KNB Clothing order (#${order.id.slice(0, 8)}) is now: *${order.status || "Confirmed"}*. Total: ₹${order.total}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price) return alert("Name and price required");
    setSaving(true);
    try {
      const prod = {
        name: name.trim(),
        price: Number(price),
        stock: Number(stock || 0),
        category,
        gender,
        imageUrl: image.trim() || "https://placehold.co/400x500?text=KNB+Clothing",
        sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
        description: desc.trim(),
        createdAt: new Date().toISOString(),
      };
      const ref = await addDoc(collection(db, "products"), prod);
      setProducts([{ id: ref.id, ...prod }, ...products]);
      setName("");
      setPrice("");
      setImage("");
      setDesc("");
      alert("Product added!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (authChecking) {
    return <div style={{ textAlign: "center", padding: "60px 20px" }}>Checking access...</div>;
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "sans-serif" }}>
        <h2 style={{ color: "#dc2626" }}>Access Denied</h2>
        <p>Sign in as <strong>{ADMIN_EMAIL}</strong>.</p>
        <Link href="/login" style={{ display: "inline-block", marginTop: "12px", padding: "8px 16px", background: "#000", color: "#fff", textDecoration: "none", borderRadius: "4px" }}>
          Go to Login
        </Link>
      </div>
    );
  }

  const revenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  return (
    <div style={{ maxWidth: "1000px", margin: "20px auto", padding: "0 16px 60px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #000", paddingBottom: "12px", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900" }}>KNB Admin</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={fetchData} style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>🔄 Refresh</button>
          <Link href="/" style={{ padding: "6px 12px", borderRadius: "4px", background: "#000", color: "#fff", textDecoration: "none", fontSize: "13px" }}>Shop ↗</Link>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        <div style={{ padding: "12px", background: "#f8f9fa", borderRadius: "6px", border: "1px solid #eee" }}>
          <span style={{ fontSize: "12px", color: "#666" }}>Revenue</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px" }}>₹{revenue}</h3>
        </div>
        <div style={{ padding: "12px", background: "#f8f9fa", borderRadius: "6px", border: "1px solid #eee" }}>
          <span style={{ fontSize: "12px", color: "#666" }}>Orders</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px" }}>{orders.length}</h3>
        </div>
        <div style={{ padding: "12px", background: "#f8f9fa", borderRadius: "6px", border: "1px solid #eee" }}>
          <span style={{ fontSize: "12px", color: "#666" }}>Catalog</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px" }}>{products.length}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #ddd", marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("orders")} style={{ padding: "8px 16px", border: "none", borderBottom: activeTab === "orders" ? "2px solid #000" : "none", background: "transparent", fontWeight: activeTab === "orders" ? "bold" : "normal", cursor: "pointer" }}>
          📦 Orders ({orders.length})
        </button>
        <button onClick={() => setActiveTab("products")} style={{ padding: "8px 16px", border: "none", borderBottom: activeTab === "products" ? "2px solid #000" : "none", background: "transparent", fontWeight: activeTab === "products" ? "bold" : "normal", cursor: "pointer" }}>
          👕 Products ({products.length})
        </button>
      </div>

      {/* TAB: ORDERS */}
      {activeTab === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {loadingData ? <p>Loading orders...</p> : orders.length === 0 ? <p>No orders placed yet.</p> : orders.map((ord) => (
            <div key={ord.id} style={{ border: "1px solid #eee", borderRadius: "8px", padding: "14px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                <div>
                  <strong>{ord.customerName || "Customer"}</strong> ({ord.phone || "No phone"})
                  <div style={{ fontSize: "12px", color: "#666" }}>📍 {ord.address}</div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <select value={ord.status || "Processing"} onChange={(e) => updateStatus(ord.id, e.target.value)} style={{ padding: "4px 8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "12px" }}>
                    <option value="Processing">Processing</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                  <button onClick={() => notifyWhatsApp(ord)} style={{ padding: "4px 8px", background: "#25D366", color: "#fff", border: "none", borderRadius: "4px", fontSize: "12px", cursor: "pointer" }}>💬 Notify</button>
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#444" }}>
                Items: {ord.items?.map((i) => `${i.name} (x${i.quantity || 1})`).join(", ")}
              </div>
              <div style={{ marginTop: "6px", fontWeight: "bold", fontSize: "14px" }}>Total: ₹{ord.total} ({ord.paymentMethod || "UPI"})</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: PRODUCTS */}
      {activeTab === "products" && (
        <div>
          <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "8px", border: "1px solid #eee", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 4px" }}>Add Product</h3>
            <input placeholder="Title *" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <input type="number" placeholder="Price (₹) *" value={price} onChange={(e) => setPrice(e.target.value)} required style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
              <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}>
                <option value="topwear">Topwear</option>
                <option value="bottomwear">Bottomwear</option>
              </select>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <input placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
            <input placeholder="Sizes (e.g. S, M, L, XL)" value={sizes} onChange={(e) => setSizes(e.target.value)} style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
            <textarea placeholder="Description" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} />
            <button type="submit" disabled={saving} style={{ padding: "10px", background: "#000", color: "#fff", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer" }}>
              {saving ? "Saving..." : "Add Product"}
            </button>
          </form>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
            {products.map((p) => (
              <div key={p.id} style={{ border: "1px solid #eee", borderRadius: "6px", padding: "10px", background: "#fff" }}>
                <img src={p.imageUrl || p.image || "https://placehold.co/180x200?text=No+Img"} alt={p.name} style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "4px" }} />
                <div style={{ fontWeight: "600", fontSize: "13px", marginTop: "6px" }}>{p.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", margin: "4px 0" }}>
                  <span>₹{p.price}</span>
                  <span style={{ color: p.stock < 5 ? "red" : "green" }}>Stock: {p.stock ?? 0}</span>
                </div>
                <button onClick={() => handleDelete(p.id)} style={{ width: "100%", padding: "4px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
