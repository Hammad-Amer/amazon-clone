import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { StoreHydrator } from "@/store/StoreHydrator";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "amazon.clone — Spend less. Smile more.",
    template: "%s | amazon.clone",
  },
  description:
    "An Amazon-style shopping experience built with Next.js and Tailwind CSS: search, filters, product pages, cart, checkout and orders.",
};

export const viewport: Viewport = {
  themeColor: "#0b2447",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="flex min-h-screen flex-col font-sans">
        {children}
        <StoreHydrator />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
