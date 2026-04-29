import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  title: "Premium POS - Point of Sale",
  description: "Aplikasi kasir & manajemen keuangan untuk bisnis modern",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PremiumPOS",
  },
  icons: {
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-TileImage": "/icons/icon-192x192.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* PWA Service Worker Registration */}
        <script src="/sw-register.js" defer></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <AuthProvider>
          <ThemeProvider>
            {/*
              Layout Strategy:
              - Mobile (< md): full-width content, fixed bottom tab + mini top bar
              - Desktop (>= md): fixed left sidebar (256px) + content takes remaining space
            */}
            <div className="min-h-screen flex">
              {/* Navbar handles both sidebar (md+) and mobile top/bottom bars */}
              <Navbar />

              {/* Spacer that reserves room for the sidebar on desktop only */}
              <div className="hidden md:block shrink-0 w-60" />

              {/* Main scrollable content */}
              <main className="flex-1 min-h-screen flex flex-col">
                <div className="flex-1 p-4 md:p-6 lg:p-8 pb-28 md:pb-8">
                  <div className="max-w-[1400px] mx-auto flex flex-col h-full">
                    {children}
                  </div>
                </div>
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
