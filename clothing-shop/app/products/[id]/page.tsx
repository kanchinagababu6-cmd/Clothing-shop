// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStore } from "@/components/StoreProvider";
import { useParams, useRouter } from "next/navigation";

const WHATSAPP_PHONE_NUMBER = "917075596910";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const [product, setProduct] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [unit, setUnit] = useState<"in" | "cm">("in");

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
          const data = { id: snap.id, ...snap.data() };
          setProduct(data);
          const initialImg = data.images?.[0] || data.imageUrl || data.image || "https://placehold.co/500x600?text=KNB+Clothing";
          setSelectedImg(initialImg);
          if (data.sizes?.length) setSize(data.sizes[0]);
          if (data.colors?.length) setColor(data.colors[0]);
        }

        const q = query(collection(db, "reviews"), where("productId", "==", params.id));
        const revSnap = await getDocs(q);
        setReviews(revSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
    const text = `Hi KNB Clothing! I would like to order:
*Product:* ${product.name}
*Price:* ₹${product.price}
*Size:* ${size || "Standard"}
*Color:* ${color || "Standard"}
*Link:* ${window.location.href}`;

    window.open(`https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
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
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "80px 20px" }}>Loading product...</div>;
  if (!product) return <div style={{ textAlign: "center", padding: "80px 20px" }}>Product not found.</div>;

  const isFav = isWishlisted ? isWishlisted(product.id) : false;
  const imageList = product.images && product.images.length > 0
    ? product.images
    : [product.imageUrl || product.image || "https://placehold.co/500x600?text=KNB+Clothing"];

  const sizeChartData = [
    { size: "S", chestIn: "38", lengthIn: "27", waistIn: "30", chestCm: "96", lengthCm: "68", waistCm: "76" },
    { size: "M", chestIn: "40", lengthIn: "28", waistIn: "32", chestCm: "101", lengthCm: "71", waistCm: "81" },
    { size: "L", chestIn: "42", lengthIn: "29", waistIn: "34", chestCm: "106", lengthCm: "73", waistCm: "86" },
    { size: "XL", chestIn: "44", lengthIn: "30", waistIn: "36", chestCm: "111", lengthCm: "76", waistCm: "91" },
    { size: "XXL", chestIn: "46", lengthIn: "31", waistIn: "38", chestCm: "116", lengthCm: "78", waistCm: "96" },
  ];

  return (
    <div style={{ maxWidth: "1050px", margin: "30px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "36px", marginBottom: "50px" }}>
        
        {/* Gallery Section */}
        <div>
          <div style={{ position: "relative", cursor: "zoom-in" }} onClick={() => setZoomOpen(true)}>
            <img
              src={selectedImg}
              alt={product.name}
              style={{ width: "100%", borderRadius: "10px", objectFit: "cover", aspectRatio: "3/4", border: "1px solid #eee" }}
            />
            <span style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.65)", color: "#fff", padding: "4px 8px", borderRadius: "4px", fontSize: "11px" }}>
              🔍 Tap to Zoom
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist && toggleWishlist(product);
              }}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "rgba(255,255,255,0.9)",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              {isFav ? "❤️" : "🤍"}
            </button>
          </div>

          {/* Thumbnails */}
          {imageList.length > 1 && (
            <div style={{ display: "flex", gap: "10px", marginTop: "12px", overflowX: "auto" }}>
              {imageList.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt={`view-${idx}`}
                  onClick={() => setSelectedImg(img)}
                  style={{
                    width: "60px",
                    height: "75px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    cursor: "pointer",
                    border: selectedImg === img ? "2px solid #000" : "1px solid #ddd",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: "800", margin: "0 0 8px 0" }}>{product.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "22px", fontWeight: 800 }}>₹{product.price}</span>
              {product.stock && Number(product.stock) <= 3 && (
                <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: "12px", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>
                  Only {product.stock} left!
                </span>
              )}
            </div>
          </div>

          {product.description && <p style={{ color: "#555", lineHeight: 1.6, margin: 0 }}>{product.description}</p>}

          {/* Size Selection with Size Guide Link */}
          {product.sizes?.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontWeight: 600, fontSize: "14px" }}>Select Size:</label>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  style={{ background: "none", border: "none", color: "#000", textDecoration: "underline", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  📏 Size Guide
                </button>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {product.sizes.map((s: string) => (
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

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div>
              <label style={{ fontWeight: 600, display: "block", marginBottom: "6px", fontSize: "14px" }}>Select Color:</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {product.colors.map((c: string) => (
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

          {/* Delivery Check */}
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
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: pincodeStatus.startsWith("✓") ? "#16a34a" : "#dc2626", fontWeight: 500 }}>
                {pincodeStatus}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={handleWhatsAppBuy}
              style={{
                backgroundColor: "#25D366",
                color: "#fff",
                border: "none",
                padding: "13px 20px",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              💬 Buy via WhatsApp
            </button>
            <button
              type="button"
              onClick={() => {
                addToCart({ ...product, size, color, quantity: 1 });
                router.push("/checkout");
              }}
              style={{
                backgroundColor: "#000",
                color: "#fff",
                border: "none",
                padding: "13px 20px",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>

      {/* SIZE CHART MODAL */}
      {sizeChartOpen && (
        <div
          onClick={() => setSizeChartOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: "10px", padding: "24px", maxWidth: "460px", width: "100%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px" }}>📏 Size Measurement Chart</h3>
              <button onClick={() => setSizeChartOpen(false)} style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            {/* Toggle in / cm */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
              <button
                onClick={() => setUnit("in")}
                style={{ padding: "4px 12px", borderRadius: "4px", border: "1px solid #000", background: unit === "in" ? "#000" : "#fff", color: unit === "in" ? "#fff" : "#000", fontSize: "12px", cursor: "pointer" }}
              >
                Inches
              </button>
              <button
                onClick={() => setUnit("cm")}
                style={{ padding: "4px 12px", borderRadius: "4px", border: "1px solid #000", background: unit === "cm" ? "#000" : "#fff", color: unit === "cm" ? "#fff" : "#000", fontSize: "12px", cursor: "pointer" }}
              >
                Centimeters
              </button>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Size</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Chest</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Length</th>
                  <th style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>Waist</th>
                </tr>
              </thead>
              <tbody>
                {sizeChartData.map((row) => (
                  <tr key={row.size} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px", fontWeight: "bold" }}>{row.size}</td>
                    <td style={{ padding: "8px" }}>{unit === "in" ? `${row.chestIn}"` : `${row.chestCm} cm`}</td>
                    <td style={{ padding: "8px" }}>{unit === "in" ? `${row.lengthIn}"` : `${row.lengthCm} cm`}</td>
                    <td style={{ padding: "8px" }}>{unit === "in" ? `${row.waistIn}"` : `${row.waistCm} cm`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL-SCREEN IMAGE ZOOM MODAL */}
      {zoomOpen && (
        <div
          onClick={() => setZoomOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "10px", cursor: "zoom-out" }}
        >
          <img src={selectedImg} alt="Zoomed view" style={{ maxWidth: "95%", maxHeight: "95%", objectFit: "contain", borderRadius: "8px" }} />
          <button
            onClick={() => setZoomOpen(false)}
            style={{ position: "absolute", top: "20px", right: "20px", color: "#fff", background: "none", border: "none", fontSize: "32px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Reviews Form */}
      <div style={{ borderTop: "1px solid #eee", paddingTop: "28px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>Customer Reviews</h2>
        <form onSubmit={handleReviewSubmit} style={{ backgroundColor: "#f9f9f9", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              required
              placeholder="Your name"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }}>
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
          </div>
          <textarea
            required
            rows={2}
            placeholder="Share your review..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc", marginBottom: "10px", boxSizing: "border-box" }}
          />
          <button type="submit" disabled={submittingReview} style={{ backgroundColor: "#000", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}>
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {reviews.map((rev) => (
            <div key={rev.id} style={{ borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{rev.name}</strong>
                <span style={{ color: "#eab308" }}>{"★".repeat(rev.rating)}</span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#444" }}>{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
              }
