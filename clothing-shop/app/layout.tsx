// @ts-nocheck
import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "THREADLY Clothing Shop",
  description: "Modern clothing store with instant WhatsApp ordering",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <StoreProvider>
          <Header />
          <main style={{ minHeight: "80vh" }}>{children}</main>
          <Footer />

          {/* Floating WhatsApp Customer Help Bubble */}
          <a
            href="https://wa.me/917075596910?text=Hi!%20I%20have%20a%20question%20about%20my%20order%20or%20products."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              backgroundColor: "#25D366",
              color: "#fff",
              borderRadius: "50%",
              width: "56px",
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              fontSize: "28px",
              textDecoration: "none",
              zIndex: 999,
            }}
            title="Chat with Customer Support on WhatsApp"
          >
            💬
          </a>
        </StoreProvider>
      </body>
    </html>
  );
}
