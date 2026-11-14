import type { Metadata } from "next";
import { Suspense } from "react";
import { Archivo } from "next/font/google";
import { Band, Footer, Nav } from "@/components/chrome";
import { FollowProvider } from "@/components/follow";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rally",
  description: "Women's sports, all in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        <FollowProvider>
          <Band />
          <Suspense
            fallback={
              <nav className="nav" aria-label="Main">
                <div className="wrap" style={{ minHeight: 64 }} />
              </nav>
            }
          >
            <Nav />
          </Suspense>
          <main className="wrap">{children}</main>
          <Footer />
        </FollowProvider>
      </body>
    </html>
  );
}
