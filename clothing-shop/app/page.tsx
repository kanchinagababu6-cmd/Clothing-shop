"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    getDocs(collection(db, "products")).then((snapshot) =>
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product)))
    );
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchGender = selectedGender === "All" || p.gender === selectedGender;
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchGender && matchCategory;
  });

  const buttonStyle = (active: boolean) => ({
    padding: "8px 16px",
    borderRadius: "20px",
    border: active ? "2px solid #000" : "1px solid #ddd",
    backgroundColor: active ? "#000" : "#fff",
    color: active ? "#fff" : "#000",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: active ? "600" : "400",
  });

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
