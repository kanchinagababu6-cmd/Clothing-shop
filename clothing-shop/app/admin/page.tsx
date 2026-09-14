"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import type { Product } from "@/lib/types";

const ADMIN_EMAIL = "kanchinagababu6@gmail.com";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [gender, setGender] = useState("Men");
  const [category, setCategory] = useState("Topwear");
  const [sizes, setSizes] = useState("S, M, L, XL");
  const [colors, setColors] = useState("Black, White");
  const [stock, setStock] = useState("10");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
  };

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      loadProducts();
    }
  }, [user]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !image) return alert("Please fill required fields (name, price, image link).");

    try {
      await addDoc(collection(db, "products"), {
        name,
        description,
        price: Number(price),
        image,
        gender,
        category,
        sizes: sizes.split(",").map((s) => s.trim()),
        colors: colors.split(",").map((c) => c.trim()),
        stock: Number(stock),
        createdAt: new Date(),
      });

      alert("Product added successfully!");
      setName("");
      setDescription("");
      setPrice("");
      setImage("");
      loadProducts();
    } catch (err: any) {
      alert("Error adding product: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      loadProducts();
    }
  };

  if (loading) return <p style={{ padding: "40px", textAlign: "center" }}>Loading admin panel...</p>;

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <main style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
        <h2>Access Denied</h2>
        <p>You must be signed in as the administrator ({ADMIN_EMAIL}) to view this page.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "700px", margin: "30px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Admin Dashboard</h1>

      <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#f8f9fa", padding: "20px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
        <h3>Add New Product</h3>

        <div>
          <label style={{ fontSize: "14px", fontWeight: 600 }}>Product Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div>
          <label style={{ fontSize: "14px", fontWeight: 600 }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "14px", fontWeight: 600 }}>Price (₹) *</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "14px", fontWeight: 600 }}>Stock Quantity</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
        </div>

        {/* Category Pickers */}
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "14px", fontWeight: 600 }}>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "14px", fontWeight: 600 }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            >
              <option value="Topwear">Topwear (Shirts, Tees, Hoodies)</option>
              <option value="Bottomwear">Bottomwear (Jeans, Trousers)</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "14px", fontWeight: 600 }}>Image Direct URL *</label>
          <input
            type="url"
            required
            placeholder="https://i.ibb.co/... or https://images.unsplash.com/..."
            value={image}
            onChange={(e) => setImage(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "14px", fontWeight: 600 }}>Sizes (comma separated)</label>
            <input
              type="text"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: "14px", fontWeight: 600 }}>Colors (comma separated)</label>
            <input
              type="text"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{ background: "#000", color: "#fff", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", marginTop: "8px" }}
        >
          Add Product
        </button>
      </form>

      <h3 style={{ marginTop: "30px", marginBottom: "12px" }}>Current Catalog</h3>
      {products.length === 0 ? (
        <p style={{ color: "#777" }}>No products in database.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {products.map((p) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #eee", padding: "10px", borderRadius: "6px" }}>
              <div>
                <strong>{p.name}</strong> — ₹{p.price}
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {(p as any).gender || "All"} | {(p as any).category || "General"} | {p.stock} in stock
                </div>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                style={{ background: "#dc3545", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
                                        }

