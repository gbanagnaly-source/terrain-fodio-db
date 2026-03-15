import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SettingsProvider } from "@/contexts/SettingsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FODIO TERRAIN - Application de Gestion de Terrains",
  description: "Application de gestion de terrains pour FODIO. Gérez vos terrains, suivez les statistiques et gérez vos lots.",
  keywords: ["FODIO", "Terrain", "Gestion", "Immobilier", "Côte d'Ivoire"],
  authors: [{ name: "FODIO" }],
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <LanguageProvider>
          <SettingsProvider>
            {children}
            <Toaster />
          </SettingsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
