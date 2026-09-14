"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getDocs(collection(db, "products")).then((snapshot) =>
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product)))
    );
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Everyday clothes, simply.</h1>
        <p>Discover your next favorite look.</p>
      </section>

      <main className="container">
        <h2>Shop Collection</h2>
        {products.length === 0 ? (
          <p className="muted">No products yet.</p>
        ) : (
          <div className="grid">
            {products.map((p) => (
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

