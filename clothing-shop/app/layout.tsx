import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "THREADLY Clothing" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Header />
          <main style={{ minHeight: "80vh" }}>{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}

