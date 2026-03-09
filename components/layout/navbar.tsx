"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/free-filing", label: "Free Filing" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/verification-help", label: "Verification Help" },
  { href: "/services", label: "Services" },
  { href: "/guides", label: "Guides" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-border/60 shadow-sm"
          : "bg-white/90 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Home">
          <Image
            src="/brand/logo.png"
            alt="Hutchrok Solutions Group"
            width={160}
            height={40}
            className="h-9 w-auto sm:h-10"
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${
                    isActive
                      ? "text-gold bg-gold/5"
                      : "text-navy hover:text-gold hover:bg-cream"
                  }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gold rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <SignedIn>
            <Link href="/dashboard" className="hidden md:block">
              <Button variant="outline" className="border-navy/20 text-navy hover:bg-cream">
                Dashboard
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className="hidden sm:inline-flex border-navy/20 text-navy hover:bg-cream">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <Link href="/free-filing" className="hidden sm:block">
            <Button className="bg-gold hover:bg-gold-dark text-navy font-semibold shadow-sm hover:shadow-md transition-shadow">
              Start My Free Filing
            </Button>
          </Link>
          <button
            className="lg:hidden p-2.5 -mr-1 text-navy rounded-lg hover:bg-cream transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          mobileOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="border-t border-border/40 bg-white px-4 py-3 space-y-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 text-[15px] font-medium rounded-lg transition-colors
                  ${
                    isActive
                      ? "text-gold bg-gold/5 border-l-2 border-gold"
                      : "text-navy hover:text-gold hover:bg-cream"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
          <SignedIn>
            <Link href="/dashboard" className="block pt-2" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full border-navy/20 text-navy h-11">
                Dashboard
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <div className="pt-2">
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full border-navy/20 text-navy h-11">
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </SignedOut>
          <div className="pt-2 pb-1">
            <Link href="/free-filing" onClick={() => setMobileOpen(false)}>
              <Button className="w-full bg-gold hover:bg-gold-dark text-navy font-semibold h-12 text-[15px]">
                Start My Free Filing
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
