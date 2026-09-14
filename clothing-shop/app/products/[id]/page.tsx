"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStore } from "@/components/StoreProvider";
import type { Product } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";

export default function ProductPage() {
  const params = useParams<{id:string}>();
  const router = useRouter();
  const { addToCart } = useStore();
  const [product,setProduct] = useState<Product|null>(null);
  const [size,setSize] = useState("");
  const [color,setColor] = useState("");

  useEffect(()=>{ getDoc(doc(db,"products",params.id)).then(s=>{ if(s.exists()) {const p={id:s.id,...s.data()} as Product; setProduct(p); setSize(p.sizes?.[0]||""); setColor(p.colors?.[0]||"");} }); },[params.id]);

  if (!product) return <main className="container"><p>Loading...</p></main>;
  return <main className="container"><div className="row">
    <div><img src={product.image} alt={product.name} style={{width:"100%",maxHeight:600,objectFit:"cover"}}/></div>
    <div><h1>{product.name}</h1><h2>₹{product.price.toLocaleString("en-IN")}</h2><p>{product.description}</p>
      <label>Size</label><select value={size} onChange={e=>setSize(e.target.value)}>{product.sizes.map(s=><option key={s}>{s}</option>)}</select>
      <label>Color</label><select value={color} onChange={e=>setColor(e.target.value)}>{product.colors.map(c=><option key={c}>{c}</option>)}</select>
      <button className="btn" disabled={!product.stock} onClick={()=>{addToCart(product,size,color);router.push("/checkout")}}>Add to Cart</button>
    </div>
  </div></main>;
}
