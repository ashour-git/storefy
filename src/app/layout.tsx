import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { AppProvider } from "../components/AppProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  display: "swap",
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
    "storefy",
    "متجر إلكتروني",
    "مصر",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${ibmPlexArabic.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Inline script to prevent theme flash — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('sf-theme');
                  var l = localStorage.getItem('sf-locale');
                  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
                  else document.documentElement.setAttribute('data-theme', 'dark');
                  if (l === 'ar') { 
                    document.documentElement.setAttribute('dir', 'rtl'); 
                    document.documentElement.setAttribute('lang', 'ar'); 
                    document.documentElement.classList.add('font-arabic');
                  } else {
                    document.documentElement.classList.add('font-sans');
                  }
                } catch(e){}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col transition-colors duration-300" suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
