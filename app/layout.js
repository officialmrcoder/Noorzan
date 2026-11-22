import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

export const metadata = {
  title: "New Mughal Collections | Watches, Bags, Clothing & Lifestyle Store",
  description: "Explore exclusive collections of premium watches, handcrafted bags, designer clothing, and lifestyle accessories at New Mughal Collections. Nationwide delivery in Pakistan.",
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: "New Mughal Collections | Watches, Bags, Clothing & Lifestyle Store",
    description: "Shop high-quality watches, bags, apparel, and lifestyle accessories across Pakistan.",
    images: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200'],
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black font-sans flex flex-col antialiased selection:bg-black selection:text-white">
        <Providers>
          <AnnouncementBar />
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
