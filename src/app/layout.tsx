import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Storefy — AI-Powered E-Commerce Platform for Egyptian Brands",
  description:
    "Launch your online store in minutes. Storefy gives Egyptian brands a complete e-commerce platform with AI product descriptions, Paymob payments, and multi-tenant storefronts — no coding required.",
  keywords: [
    "e-commerce",
    "Egypt",
    "SaaS",
    "AI",
    "online store",
    "Paymob",
    "multi-tenant",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
