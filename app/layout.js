import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Noorzan | Premium Bags & Backpacks Online Store",
  description: "Discover premium handbags curated for the modern Pakistani woman. Shop now at Noorzan.",
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: "BagHaven | Premium Bags & Backpacks Online Store",
    description: "Shop high-quality backpacks, laptop bags, and duffles.",
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'],
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-50 flex flex-col`}>
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
