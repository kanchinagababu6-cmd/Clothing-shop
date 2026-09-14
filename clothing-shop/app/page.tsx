"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/lib/types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { getDocs(collection(db, "products")).then(s => setProducts(s.docs.map(d => ({id:d.id,...d.data()} as Product)))); }, []);

  return <>
    <section className="hero">
      <h1>Everyday clothes, simply.</h1>
      <p>Discover your next favorite look.</p>
    </section>
    <main className="container">
      <h2>Shop Collection</h2>
      {products.length === 0 ? <p className="muted">No products yet. Add products from the Firebase console or Admin panel.</p> :
      <div className="grid">{products.map(p => <Link href={`/products/${p.id}`} key={p.id} className="card">
        <img src={p.image} alt={p.name}/>
        <div className="cardBody"><h3>{p.name}</h3><p className="price">₹{p.price.toLocaleString("en-IN")}</p><p className="muted">{p.stock} in stock</p></div>
      </Link>)}</div>}
    </main>
  </>;
}
