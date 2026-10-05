import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/authContext";

export const metadata: Metadata = {
  title: "SPANDANA — AI-Powered Exercise Form Correction",
  description: "Premium fitness form correction platform.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 relative">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
