// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStore } from "@/components/StoreProvider";
import type { Product } from "@/lib/types";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);

  const { wishlist, toggleWishlist, isWishlisted } = useStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
        setProducts(list);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchGender = selectedGender === "all" || (p.gender && p.gender.toLowerCase() === selectedGender.toLowerCase());
    const matchCat = selectedCategory === "all" || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchSearch = !searchQuery.trim() || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchWish = !showOnlyWishlist || (isWishlisted && isWishlisted(p.id));
    return matchGender && matchCat && matchSearch && matchWish;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", padding: "40px 20px", backgroundColor: "#f8f9fa", borderRadius: "10px", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "0 0 8px" }}>KNB Clothing</h1>
        <p style={{ color: "#666", fontSize: "15px", margin: 0 }}>Everyday clothes, simply.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Search clothes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: "1 1 200px", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }}
          >
            <option value="default">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          <button
            onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
            style={{
              padding: "10px 14px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: showOnlyWishlist ? "#fee2e2" : "#fff",
              color: showOnlyWishlist ? "#dc2626" : "#000",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ❤️ Wishlist ({wishlist ? wishlist.length : 0})
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
        {["all", "men", "women"].map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGender(g)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: selectedGender === g ? "1px solid #000" : "1px solid #ddd",
              background: selectedGender === g ? "#000" : "#fff",
              color: selectedGender === g ? "#fff" : "#333",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {g === "all" ? "All Genders" : g}
          </button>
        ))}

        {["all", "topwear", "bottomwear"].map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: selectedCategory === c ? "1px solid #000" : "1px solid #ddd",
              background: selectedCategory === c ? "#000" : "#fff",
              color: selectedCategory === c ? "#fff" : "#333",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {c === "all" ? "All Types" : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>Loading products...</div>
      ) : sortedProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: "#777" }}>No products found.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
          {sortedProducts.map((p) => {
            const isFav = isWishlisted ? isWishlisted(p.id) : false;
            return (
              <div
                key={p.id}
                style={{
                  position: "relative",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <button
                  onClick={() => toggleWishlist && toggleWishlist(p)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "rgba(255,255,255,0.85)",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                    fontSize: "15px",
                    zIndex: 2,
                  }}
                >
                  {isFav ? "❤️" : "🤍"}
                </button>

                <Link href={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <img
                    src={p.image || p.imageUrl || "https://placehold.co/400x500?text=No+Image"}
                    alt={p.name}
                    style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }}
                  />
                  <div style={{ padding: "12px" }}>
                    <h3 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 600 }}>{p.name}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "15px" }}>₹{p.price}</span>
                      {p.gender && <span style={{ fontSize: "11px", color: "#888", textTransform: "uppercase" }}>{p.gender}</span>}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
