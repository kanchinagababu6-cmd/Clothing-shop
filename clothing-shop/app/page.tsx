// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const list: Product[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(list);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by gender, category, and search query
  const filteredProducts = products.filter((p) => {
    const matchesGender =
      selectedGender === "all" ||
      (p.gender && p.gender.toLowerCase() === selectedGender.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch =
      searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesGender && matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      {/* Hero Banner */}
      <div style={{ textAlign: "center", padding: "60px 20px 40px", backgroundColor: "#f8f9fa", borderRadius: "12px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "800", margin: "0 0 12px" }}>Everyday clothes, simply.</h1>
        <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>Timeless quality essentials designed for everyday living.</p>
      </div>

      {/* Search & Sort Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: "1 1 240px",
            padding: "10px 14px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "14px",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="default">Sort by: Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Filter Chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "30px" }}>
        {["all", "men", "women"].map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGender(g)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: selectedGender === g ? "1px solid #000" : "1px solid #ddd",
              backgroundColor: selectedGender === g ? "#000" : "#fff",
              color: selectedGender === g ? "#fff" : "#333",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {g === "all" ? "All Genders" : g}
          </button>
        ))}

        <span style={{ borderLeft: "1px solid #ddd", margin: "0 6px" }} />

        {["all", "topwear", "bottomwear"].map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: selectedCategory === c ? "1px solid #000" : "1px solid #ddd",
              backgroundColor: selectedCategory === c ? "#000" : "#fff",
              color: selectedCategory === c ? "#fff" : "#333",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {c === "all" ? "All Categories" : c}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>Loading products...</div>
      ) : sortedProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#666" }}>
          No products found matching your filters.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "24px",
          }}
        >
          {sortedProducts.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: "transform 0.15s ease",
                  backgroundColor: "#fff",
                }}
              >
                <img
                  src={p.image || p.imageUrl || "https://placehold.co/400x500?text=No+Image"}
                  alt={p.name}
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }}
                />
                <div style={{ padding: "12px" }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: "600" }}>{p.name}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "700", fontSize: "16px" }}>₹{p.price}</span>
                    {p.gender && (
                      <span style={{ fontSize: "11px", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {p.gender}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
  return (
    <>
      <section className="hero">
        <h1>Everyday clothes, simply.</h1>
        <p>Discover your next favorite look.</p>
      </section>

      <main className="container" style={{ padding: "20px 16px" }}>
        {/* Gender Selection Tabs */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "12px", flexWrap: "wrap" }}>
          {["All", "Men", "Women"].map((gender) => (
            <button
              key={gender}
              onClick={() => setSelectedGender(gender)}
              style={buttonStyle(selectedGender === gender)}
            >
              {gender === "All" ? "All Genders" : gender}
            </button>
          ))}
        </div>

        {/* Category Selection Tabs */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "28px", flexWrap: "wrap" }}>
          {["All", "Topwear", "Bottomwear"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={buttonStyle(selectedCategory === cat)}
            >
              {cat === "All" ? "All Clothing" : cat}
            </button>
          ))}
        </div>

        <h2>Shop Collection</h2>

        {filteredProducts.length === 0 ? (
          <p className="muted" style={{ textAlign: "center", margin: "40px 0" }}>
            No products found in this category.
          </p>
        ) : (
          <div className="grid">
            {filteredProducts.map((p) => (
              <Link href={`/products/${p.id}`} key={p.id} className="card">
                <img
                  src={p.imageUrl || p.image}
                  alt={p.name}
                  style={{ width: "100%", height: "260px", objectFit: "cover" }}
                />
                <div className="cardBody">
                  <h3>{p.name}</h3>
                  <p className="price">₹{p.price}</p>
                  <p className="stock">{p.stock} in stock</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
        }
