// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useStore } from "@/components/StoreProvider";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [under599, setUnder599] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);
  const [time, setTime] = useState({ h: 4, m: 28, s: 45 });

  const { wishlist, toggleWishlist, isWishlisted, addToCart } = useStore();

  useEffect(() => {
    getDocs(collection(db, "products"))
      .then((s) => setProducts(s.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoading(false));

    const timer = setInterval(() => {
      setTime((t) => {
        if (t.s > 0) return { ...t, s: t.s - 1 };
        if (t.m > 0) return { ...t, m: t.m - 1, s: 59 };
        if (t.h > 0) return { h: t.h - 1, m: 59, s: 59 };
        return { h: 4, m: 30, s: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filtered = products.filter((p) => {
    const mGen = selectedGender === "all" || p.gender?.toLowerCase() === selectedGender.toLowerCase();
    const mCat = selectedCategory === "all" || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const mSearch = !searchQuery.trim() || p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const mWish = !showOnlyWishlist || (isWishlisted && isWishlisted(p.id));
    const mUnder = !under599 || Number(p.price) <= 599;
    return mGen && mCat && mSearch && mWish && mUnder;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-low") return Number(a.price) - Number(b.price);
    if (sortBy === "price-high") return Number(b.price) - Number(a.price);
    return 0;
  });

  const quickAdd = (e, p) => {
    e.preventDefault();
    addToCart({ ...p, size: p.sizes?.[0] || "Standard", color: p.colors?.[0] || "Standard", quantity: 1 });
    alert(`Added ${p.name} to Bag!`);
  };

  return (
    <div style={{ fontFamily: "sans-serif", backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {/* 1. Ticker */}
      <div style={{ background: "#000", color: "#fff", padding: "8px 14px", textAlign: "center", fontSize: "12px", fontWeight: "600", display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        <span>🚚 Free Delivery over ₹999</span>
        <span>•</span>
        <span>⚡ Code: <strong>WELCOME10</strong></span>
        <span>•</span>
        <a href="https://wa.me/917075596910" target="_blank" rel="noreferrer" style={{ color: "#25D366", textDecoration: "none" }}>💬 WhatsApp</a>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
        {/* 2. Hero */}
        <div style={{ margin: "16px 0", background: "linear-gradient(135deg, #111827 0%, #000 100%)", color: "#fff", borderRadius: "14px", padding: "36px 20px", textAlign: "center" }}>
          <span style={{ fontSize: "11px", letterSpacing: "2px", color: "#9ca3af", textTransform: "uppercase" }}>Everyday Essentials</span>
          <h1 style={{ fontSize: "clamp(24px, 5vw, 38px)", margin: "10px 0 12px", fontWeight: "900" }}>Upgrade Your Wardrobe</h1>
          <p style={{ color: "#d1d5db", fontSize: "14px", maxWidth: "480px", margin: "0 auto 20px" }}>Breathable cottons, oversized fits & streetwear comfort.</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={() => setSelectedGender("men")} style={{ background: "#fff", color: "#000", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>Shop Men 🧔</button>
            <button onClick={() => setSelectedGender("women")} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid #fff", padding: "10px 20px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>Shop Women 👩</button>
          </div>
        </div>

        {/* 3. Story Bubbles */}
        <div style={{ display: "flex", gap: "14px", overflowX: "auto", padding: "6px 2px 14px", scrollbarWidth: "none" }}>
          {[
            { label: "All Items", icon: "✨", act: () => { setSelectedGender("all"); setSelectedCategory("all"); setUnder599(false); } },
            { label: "Men", icon: "🧔", act: () => { setSelectedGender("men"); setUnder599(false); } },
            { label: "Women", icon: "👩", act: () => { setSelectedGender("women"); setUnder599(false); } },
            { label: "Topwear", icon: "👕", act: () => { setSelectedCategory("topwear"); setUnder599(false); } },
            { label: "Bottomwear", icon: "👖", act: () => { setSelectedCategory("bottomwear"); setUnder599(false); } },
            { label: "Under ₹599", icon: "🔥", act: () => setUnder599(true) },
          ].map((b, i) => (
            <button key={i} onClick={b.act} style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", background: "none", border: "none", cursor: "pointer" }}>
              <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#fff", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "4px" }}>{b.icon}</div>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#111" }}>{b.label}</span>
            </button>
          ))}
        </div>

        {/* 4. Flash Sale */}
        <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b" }}>⚡ FLASH DEAL</span>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#7f1d1d" }}>Extra 10% Off with code WELCOME10</div>
          </div>
          <div style={{ display: "flex", gap: "4px", alignItems: "center", fontSize: "12px", fontWeight: "bold", color: "#991b1b" }}>
            <span>Ends In:</span>
            {[time.h, time.m, time.s].map((val, i) => (
              <span key={i} style={{ background: "#b91c1c", color: "#fff", padding: "3px 6px", borderRadius: "4px" }}>{String(val).padStart(2, "0")}</span>
            ))}
          </div>
        </div>

        {/* 5. Search & Filters */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            <input placeholder="🔍 Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: "1 1 180px", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff" }} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", background: "#fff", fontWeight: 600, fontSize: "12px" }}>
              <option value="default">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <button onClick={() => setShowOnlyWishlist(!showOnlyWishlist)} style={{ padding: "10px 14px", borderRadius: "6px", border: "1px solid #ccc", background: showOnlyWishlist ? "#fee2e2" : "#fff", color: showOnlyWishlist ? "#dc2626" : "#000", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
              ❤️ ({wishlist ? wishlist.length : 0})
            </button>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {["all", "men", "women"].map((g) => (
              <button key={g} onClick={() => setSelectedGender(g)} style={{ padding: "5px 12px", borderRadius: "16px", border: selectedGender === g ? "1px solid #000" : "1px solid #ddd", background: selectedGender === g ? "#000" : "#fff", color: selectedGender === g ? "#fff" : "#333", fontSize: "11px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{g === "all" ? "All Genders" : g}</button>
            ))}
            {["all", "topwear", "bottomwear"].map((c) => (
              <button key={c} onClick={() => setSelectedCategory(c)} style={{ padding: "5px 12px", borderRadius: "16px", border: selectedCategory === c ? "1px solid #000" : "1px solid #ddd", background: selectedCategory === c ? "#000" : "#fff", color: selectedCategory === c ? "#fff" : "#333", fontSize: "11px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{c === "all" ? "All Categories" : c}</button>
            ))}
            {under599 && <button onClick={() => setUnder599(false)} style={{ padding: "5px 10px", borderRadius: "16px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>✕ Under ₹599</button>}
          </div>
        </div>

        {/* 6. Product Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>Loading...</div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#777" }}>No products found.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "48px" }}>
            {sorted.map((p, idx) => {
              const isFav = isWishlisted ? isWishlisted(p.id) : false;
              const orig = Math.round(Number(p.price) * 1.6);
              const off = Math.round(((orig - Number(p.price)) / orig) * 100);
              return (
                <div key={p.id} style={{ background: "#fff", borderRadius: "10px", overflow: "hidden", border: "1px solid #eee", display: "flex", flexDirection: "column", position: "relative" }}>
                  <span style={{ position: "absolute", top: "8px", left: "8px", background: idx % 2 === 0 ? "#000" : "#dc2626", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: "700", zIndex: 2 }}>
                    {idx % 2 === 0 ? "BESTSELLER" : "NEW"}
                  </span>
                  <button onClick={() => toggleWishlist && toggleWishlist(p)} style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontSize: "14px", zIndex: 2 }}>
                    {isFav ? "❤️" : "🤍"}
                  </button>
                  <Link href={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <img src={p.images?.[0] || p.imageUrl || p.image || "https://placehold.co/400x500?text=KNB"} alt={p.name} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }} />
                    <div style={{ padding: "10px 10px 4px" }}>
                      <h3 style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</h3>
                      <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
                        <span style={{ fontSize: "15px", fontWeight: "800" }}>₹{p.price}</span>
                        <span style={{ fontSize: "11px", color: "#888", textDecoration: "line-through" }}>₹{orig}</span>
                        <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700" }}>{off}% OFF</span>
                      </div>
                    </div>
                  </Link>
                  <div style={{ padding: "8px 10px 10px", marginTop: "auto" }}>
                    <button onClick={(e) => quickAdd(e, p)} style={{ width: "100%", padding: "7px", background: "#f3f4f6", border: "1px solid #ddd", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                      ⚡ Quick Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 7. Trust Signals */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", background: "#fff", borderRadius: "10px", padding: "18px", marginBottom: "36px", border: "1px solid #eee" }}>
          <div style={{ textAlign: "center" }}><span style={{ fontSize: "22px" }}>🚚</span><h4 style={{ margin: "4px 0", fontSize: "13px" }}>Fast Dispatch</h4><p style={{ margin: 0, fontSize: "11px", color: "#666" }}>24-48 hr dispatch across India</p></div>
          <div style={{ textAlign: "center" }}><span style={{ fontSize: "22px" }}>🔄</span><h4 style={{ margin: "4px 0", fontSize: "13px" }}>7-Day Exchange</h4><p style={{ margin: 0, fontSize: "11px", color: "#666" }}>Easy WhatsApp size swap</p></div>
          <div style={{ textAlign: "center" }}><span style={{ fontSize: "22px" }}>🛡️</span><h4 style={{ margin: "4px 0", fontSize: "13px" }}>COD & UPI</h4><p style={{ margin: 0, fontSize: "11px", color: "#666" }}>Pay with GPay or on delivery</p></div>
          <div style={{ textAlign: "center" }}><span style={{ fontSize: "22px" }}>💬</span><h4 style={{ margin: "4px 0", fontSize: "13px" }}>WhatsApp Help</h4><p style={{ margin: 0, fontSize: "11px", color: "#666" }}>Dedicated human support</p></div>
        </div>

        {/* 8. Testimonials */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 14px" }}>Customer Love</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            {[
              { name: "Rahul S.", text: "Incredible oversized t-shirt fabric for ₹499. No shrinking!", r: 5 },
              { name: "Pooja M.", text: "Quick WhatsApp order, arrived in 3 days. Loved the fit!", r: 5 },
              { name: "Kiran K.", text: "Heavy, premium quality fabric. Highly recommended.", r: 5 },
            ].map((t, i) => (
              <div key={i} style={{ background: "#fff", padding: "14px", borderRadius: "8px", border: "1px solid #eee", textAlign: "left" }}>
                <div style={{ color: "#eab308", marginBottom: "4px", fontSize: "12px" }}>{"★".repeat(t.r)}</div>
                <p style={{ fontSize: "12px", color: "#444", margin: "0 0 8px" }}>"{t.text}"</p>
                <span style={{ fontSize: "11px", fontWeight: "700" }}>— {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
