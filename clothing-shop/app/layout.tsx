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
          <a
            href="https://wa.me/917075596910?text=Hi!%20I%20have%20a%20question%20about%20KNB%20Clothing."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              backgroundColor: "#25D366",
              color: "#fff",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              textDecoration: "none",
              zIndex: 999,
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            }}
          >
            💬
          </a>
        </StoreProvider>
      </body>
    </html>
  );
}
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
            title="Chat with KNB Clothing Support on WhatsApp"
          >
            💬
          </a>
        </StoreProvider>
      </body>
    </html>
  );
}
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
