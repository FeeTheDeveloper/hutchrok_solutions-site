import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/app/providers";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { ConciergeFloating } from "@/components/concierge/hutchrok-concierge";
import { SbaPromoBanner } from "@/components/SbaPromoBanner";
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
    default: "Hutchrok Solutions Group | SBA-Certified SDVOSB & VOSB | Free Texas Veteran LLC Filing",
    template: "%s | Hutchrok Solutions Group",
  },
  description:
    "SBA-certified SDVOSB and VOSB helping veterans launch and grow businesses. Free Texas LLC filing for qualified veterans, plus compliance, consulting, software, branding, and government contracting support.",
  keywords: [
    "SBA certified SDVOSB",
    "SBA certified VOSB",
    "service disabled veteran owned small business",
    "veteran owned small business",
    "free LLC filing",
    "veteran LLC",
    "Texas LLC formation",
    "veteran-owned",
    "TVC verification",
    "free business formation",
    "government contracting",
    "Dallas TX",
    "Texas veterans",
  ],
  authors: [{ name: "Hutchrok Solutions Group LLC" }],
  openGraph: {
    title: "Hutchrok Solutions Group | SBA-Certified SDVOSB & VOSB",
    description:
      "Veteran-owned business infrastructure, free Texas LLC filing for qualified veterans, and government-ready consulting and technology services.",
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
        <Providers>
          <SbaPromoBanner />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ConciergeFloating />
        </Providers>
      </body>
    </html>
  );
}
