// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStore } from "@/components/StoreProvider";
import type { Product } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";

// REPLACE THIS WITH YOUR WHATSAPP NUMBER (include country code, e.g. 919876543210)
const WHATSAPP_PHONE_NUMBER = "917075596910";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", params.id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Product;
          setProduct(data);
          if (data.sizes && data.sizes.length > 0) setSize(data.sizes[0]);
          if (data.colors && data.colors.length > 0) setColor(data.colors[0]);
        }
      } catch (e) {
        console.error("Error fetching product:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [params?.id]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "60px 20px" }}>Loading product...</div>;
  }

  if (!product) {
    return <div style={{ textAlign: "center", padding: "60px 20px" }}>Product not found.</div>;
  }

  const handleWhatsAppBuy = () => {
    const text = `Hi! I would like to order:
*Product:* ${product.name}
*Price:* ₹${product.price}
*Size:* ${size || "N/A"}
*Color:* ${color || "N/A"}
*Link:* ${window.location.href}`;

    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", fontFamily: "sans-serif" }}>
      <div>
        <img
          src={product.image || product.imageUrl || "https://placehold.co/500x600?text=No+Image"}
          alt={product.name}
          style={{ width: "100%", borderRadius: "8px", objectFit: "cover", aspectRatio: "3/4" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>{product.name}</h1>
        <p style={{ fontSize: "22px", fontWeight: 600, color: "#111", margin: 0 }}>₹{product.price}</p>
        
        {product.description && (
          <p style={{ color: "#555", lineHeight: 1.6 }}>{product.description}</p>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Select Size:</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "4px",
                    border: size === s ? "2px solid #000" : "1px solid #ccc",
                    backgroundColor: size === s ? "#000" : "#fff",
                    color: size === s ? "#fff" : "#000",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors && product.colors.length > 0 && (
          <div>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "6px" }}>Select Color:</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "4px",
                    border: color === c ? "2px solid #000" : "1px solid #ccc",
                    backgroundColor: color === c ? "#f0f0f0" : "#fff",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
          {/* WhatsApp Direct Order Button */}
          <button
            onClick={handleWhatsAppBuy}
            style={{
              backgroundColor: "#25D366",
              color: "#fff",
              border: "none",
              padding: "14px 20px",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            💬 Buy via WhatsApp
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={() => {
              addToCart({ ...product, size, color, quantity: 1 });
              router.push("/cart");
            }}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              padding: "14px 20px",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
