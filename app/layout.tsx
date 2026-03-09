import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { ConciergeFloating } from "@/components/concierge/hutchrok-concierge";
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
    default: "Hutchrok Solutions Group | Free Texas LLC Filing for Veterans",
    template: "%s | Hutchrok Solutions Group",
  },
  description:
    "Free Texas LLC formation for qualified U.S. military veterans. Veteran-owned, veteran-operated. We handle your Certificate of Formation with the Texas Secretary of State at no cost.",
  keywords: [
    "free LLC filing",
    "veteran LLC",
    "Texas LLC formation",
    "veteran-owned",
    "TVC verification",
    "free business formation",
    "Dallas TX",
    "Texas veterans",
  ],
  authors: [{ name: "Hutchrok Solutions Group LLC" }],
  openGraph: {
    title: "Hutchrok Solutions Group | Free Texas LLC Filing for Veterans",
    description:
      "Free Texas LLC formation for qualified veterans. No filing fees, no service fees.",
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
        <ClerkProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ConciergeFloating />
        </ClerkProvider>
      </body>
    </html>
  );
}
