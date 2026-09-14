// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStore } from "@/components/StoreProvider";
import type { Product } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";

const WHATSAPP_PHONE_NUMBER = "917075596910";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(true);

  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState("");

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!params?.id) return;

    const fetchProductAndReviews = async () => {
      try {
        const snap = await getDoc(doc(db, "products", params.id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Product;
          setProduct(data);
          if (data.sizes && data.sizes.length > 0) setSize(data.sizes[0]);
          if (data.colors && data.colors.length > 0) setColor(data.colors[0]);
        }

        const q = query(collection(db, "reviews"), where("productId", "==", params.id));
        const revSnap = await getDocs(q);
        const revList = revSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReviews(revList);
      } catch (e) {
        console.error("Error loading product:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [params?.id]);

  const handleWhatsAppBuy = () => {
    if (!product) return;
    const text = `Hi! I would like to order:
*Brand:* KNB Clothing
*Product:* ${product.name}
*Price:* ₹${product.price}
*Size:* ${size || "Standard"}
*Color:* ${color || "Standard"}
*Link:* ${window.location.href}`;

    const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} at ₹${product?.price} on KNB Clothing!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Product link copied to clipboard!");
    }
  };

  const checkDelivery = () => {
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeStatus("✓ Delivery available in 3-5 business days. Cash on Delivery available!");
    } else {
      setPincodeStatus("Please enter a valid 6-digit Indian PIN code.");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) return;

    setSubmittingReview(true);
    try {
      const newRev = {
        productId: params.id,
        name: reviewerName.trim(),
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "reviews"), newRev);
      setReviews([{ id: docRef.id, ...newRev }, ...reviews]);
      setReviewerName("");
      setComment("");
      setRating(5);
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return <div style={{ textAlign: "center", padding: "80px 20px" }}>Loading product...</div>;
  }

  if (!product) {
    return <div style={{ textAlign: "center", padding: "80px 20px" }}>Product not found.</div>;
  }

  const isFav = isWishlisted ? isWishlisted(product.id) : false;

  return (
    <div style={{ maxWidth: "960px", margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "40px", marginBottom: "50px" }}>
        <div style={{ position: "relative" }}>
          <img
            src={product.image || product.imageUrl || "https://placehold.co/500x600?text=No+Image"}
            alt={product.name}
            style={{ width: "100%", borderRadius: "10px", objectFit: "cover", aspectRatio: "3/4" }}
          />
          <button
            onClick={() => toggleWishlist && toggleWishlist(product)}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              background: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            {isFav ? "❤️" : "🤍"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px 0" }}>{product.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px", fontWeight: 700 }}>₹{product.price}</span>
              {avgRating && (
                <span style={{ fontSize: "14px", backgroundColor: "#fef08a", padding: "2px 8px", borderRadius: "12px", fontWeight: 600 }}>
                  ★ {avgRating} ({reviews.length})
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <p style={{ color: "#555", lineHeight: 1.6, margin: 0 }}>{product.description}</p>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label style={{ fontWeight: 600, display: "block", marginBottom: "6px", fontSize: "14px" }}>Select Size:</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "6px",
                      border: size === s ? "2px solid #000" : "1px solid #ccc",
                      backgroundColor: size === s ? "#000" : "#fff",
                      color: size === s ? "#fff" : "#000",
                      cursor: "pointer",
                      fontWeight: 600,
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
              <label style={{ fontWeight: 600, display: "block", marginBottom: "6px", fontSize: "14px" }}>Select Color:</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "6px",
                      border: color === c ? "2px solid #000" : "1px solid #ccc",
                      backgroundColor: color === c ? "#f0f0f0" : "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: "14px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Check Delivery:</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
              />
              <button
                type="button"
                onClick={checkDelivery}
                style={{ padding: "8px 14px", borderRadius: "6px", border: "none", backgroundColor: "#000", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
              >
                Check
              </button>
            </div>
            {pincodeStatus && (
              <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: pincodeStatus.startsWith("✓") ? "#16a34a" : "#dc2626", fontWeight: 500 }}>
                {pincodeStatus}
              </p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={handleWhatsAppBuy}
              style={{
                backgroundColor: "#25D366",
                color: "#fff",
                border: "none",
                padding: "14px 20px",
                borderRadius: "8px",
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

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  addToCart({ ...product, size, color, quantity: 1 });
                  router.push("/checkout");
                }}
                style={{
                  flex: 3,
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                  padding: "14px 20px",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Add to Bag
              </button>

              <button
                type="button"
                onClick={handleShare}
                style={{
                  flex: 1,
                  backgroundColor: "#fff",
                  color: "#333",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🔗 Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #eee", paddingTop: "30px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>Customer Reviews</h2>

        <form onSubmit={handleReviewSubmit} style={{ backgroundColor: "#f9f9f9", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 10px" }}>Leave a Review</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              required
              placeholder="Your name"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", backgroundColor: "#fff" }}
            >
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
          </div>
          <textarea
            required
            rows={3}
            placeholder="Share your thoughts on fit, fabric, quality..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginBottom: "10px", boxSizing: "border-box" }}
          />
          <button
            type="submit"
            disabled={submittingReview}
            style={{ backgroundColor: "#000", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {reviews.length === 0 ? (
          <p style={{ color: "#777", fontSize: "14px" }}>No reviews yet. Be the first to leave one!</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <strong style={{ fontSize: "14px" }}>{rev.name}</strong>
                  <span style={{ color: "#eab308", fontSize: "13px" }}>{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#444" }}>{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
