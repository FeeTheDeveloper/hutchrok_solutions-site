import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hutchrok Solutions Group | Veteran-Owned Business Enablement",
    template: "%s | Hutchrok Solutions Group",
  },
  description:
    "Hutchrok Solutions Group is a veteran-owned solutions firm delivering compliant business formation, operational structuring, and execution support for entrepreneurs, startups, and mission-driven organizations.",
  keywords: [
    "business formation",
    "LLC formation",
    "veteran-owned",
    "compliance",
    "operational structuring",
    "Dallas TX",
    "business services",
  ],
  authors: [{ name: "Hutchrok Solutions Group LLC" }],
  openGraph: {
    title: "Hutchrok Solutions Group | Veteran-Owned Business Enablement",
    description:
      "Compliant business formation, operational structuring, and execution support.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
