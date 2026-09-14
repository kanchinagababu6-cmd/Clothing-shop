// @ts-nocheck
import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "KNB Clothing - Everyday Clothes, Simply",
  description: "Official KNB Clothing Store with instant WhatsApp ordering",
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
        </StoreProvider>
      </body>
    </html>
  );
}
