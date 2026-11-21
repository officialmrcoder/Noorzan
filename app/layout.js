import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";

export const metadata = {
  title: "Noorzan | Premium Bags & Backpacks Online Store",
  description: "Discover premium handbags curated for the modern Pakistani woman. Shop now at Noorzan.",
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: "Noorzan | Premium Bags & Backpacks Online Store",
    description: "Shop high-quality backpacks, laptop bags, and handbags.",
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'],
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