import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemedToaster, ThemeSync } from "@/components/layout/Theme";
import { THEME_SCRIPT } from "@/lib/theme";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b2447" },
    { media: "(prefers-color-scheme: dark)", color: "#070f1c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The inline script sets data-theme before first paint, so React must accept the DOM value.
    <html lang="en" data-theme="light" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        {children}
        <StoreHydrator />
        <ThemeSync />
        <ThemedToaster />
      </body>
    </html>
  );
}
