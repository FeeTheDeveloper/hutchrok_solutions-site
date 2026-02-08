import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const quickLinks = [
  { href: "/services", label: "Services" },
  { href: "/formation-filings", label: "Formation & Filings" },
  { href: "/credit-enablement", label: "Credit Enablement" },
  { href: "/veteran-owned", label: "Veteran-Owned" },
  { href: "/mission", label: "Mission" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-gold mb-3">
              Hutchrok Solutions Group LLC
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Veteran-owned solutions firm delivering compliant business formation,
              operational structuring, and execution support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gold mb-3 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-gold mb-3 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="h-4 w-4 text-gold" />
                <span>info@hutchroksolutions.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="h-4 w-4 text-gold" />
                <span>Dallas, TX</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} Hutchrok Solutions Group LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
