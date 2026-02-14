import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#022c22",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://iftarvaktipro.systemconf.online"),
  title: {
    default: "İftar Vakti Pro | Ramazan İmsakiyesi ve Namaz Vakitleri",
    template: "%s | İftar Vakti Pro",
  },
  description:
    "2026 Ramazan İmsakiyesi. Şehre göre iftar, sahur ve namaz vakitlerini anlık takip edin. systemconf tarafından geliştirilen premium Ramazan deneyimi.",
  keywords: ["iftar vakti", "sahur vakti", "namaz vakitleri", "ramazan imsakiyesi 2026", "iftar sayacı", "islami uygulama"],
  authors: [{ name: "systemconf", url: "http://systemconf.online" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "İftar Vakti Pro | Ramazan İmsakiyesi",
    description: "Şehre göre iftar ve sahur vakitlerini anlık takip edin.",
    url: "https://iftarvaktipro.systemconf.online",
    siteName: "İftar Vakti Pro",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "İftar Vakti Pro",
    description: "Modern ve Şık Ramazan İmsakiyesi",
    creator: "@systemconf",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
