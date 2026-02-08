"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/formation-filings", label: "Formation & Filings" },
  { href: "/credit-enablement", label: "Credit Enablement" },
  { href: "/veteran-owned", label: "Veteran-Owned" },
  { href: "/mission", label: "Mission" },
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-border/60 shadow-sm"
          : "bg-white/90 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — left */}
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

        {/* Desktop Nav — center */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive
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

        {/* CTA + Mobile Toggle — right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/contact" className="hidden sm:block">
            <Button className="bg-gold hover:bg-gold-dark text-navy font-semibold shadow-sm hover:shadow-md transition-shadow">
              Start Intake
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

      {/* Mobile Nav — slide-down */}
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
                className={`block px-4 py-3 text-[15px] font-medium rounded-lg transition-colors
                  ${isActive
                    ? "text-gold bg-gold/5 border-l-2 border-gold"
                    : "text-navy hover:text-gold hover:bg-cream"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 pb-1">
            <Link href="/contact">
              <Button className="w-full bg-gold hover:bg-gold-dark text-navy font-semibold h-12 text-[15px]">
                Start Intake
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
