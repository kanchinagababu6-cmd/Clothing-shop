import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #eee",
        padding: "40px 20px",
        backgroundColor: "#fafafa",
        textAlign: "center",
        fontFamily: "sans-serif",
        marginTop: "60px",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", fontWeight: "800", letterSpacing: "1px" }}>
        KNB CLOTHING
      </h3>
      <p style={{ margin: "0 0 16px 0", color: "#666", fontSize: "14px" }}>
        Quality everyday clothing. Simple, affordable, and direct to your door.
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
        <Link href="/" style={{ color: "#333", textDecoration: "none", fontSize: "13px" }}>
          Home
        </Link>
        <Link href="/checkout" style={{ color: "#333", textDecoration: "none", fontSize: "13px" }}>
          Checkout
        </Link>
        <a
          href="https://wa.me/917075596910"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#25D366", textDecoration: "none", fontSize: "13px", fontWeight: "bold" }}
        >
          WhatsApp Us
        </a>
      </div>

      <p style={{ margin: 0, color: "#999", fontSize: "12px" }}>
        © {new Date().getFullYear()} KNB Clothing. All rights reserved.
      </p>
    </footer>
  );
}
