import "./globals.css";
import { StoreProvider } from "@/components/StoreProvider";
import Header from "@/components/Header";

export const metadata = { title: "THREADLY Clothing", description: "Simple clothing store" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <StoreProvider><Header />{children}</StoreProvider>;
}
