import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FloatingCart from "@/components/FloatingCart";
import SyncOrders from "@/components/SyncOrders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Titik Ngunyah - Self Order Kiosk",
  description: "Modern self-order kiosk for Titik Ngunyah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-background text-gray-900 antialiased h-screen overflow-hidden flex flex-col`}>
        <SyncOrders />
        {children}
        <FloatingCart />
      </body>
    </html>
  );
}
