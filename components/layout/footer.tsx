import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const quickLinks = [
  { href: "/free-filing", label: "Free Filing" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/verification-help", label: "Verification Help" },
  { href: "/services", label: "Services" },
  { href: "/guides", label: "Guides" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-gold mb-3">
              Hutchrok Solutions Group LLC
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Free Texas LLC formation for qualified veterans. We handle the
              paperwork — you launch your business.
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
              Veteran Guides
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/guides/start-a-business-in-texas-as-a-veteran"
                  className="text-sm text-white/70 hover:text-gold transition-colors"
                >
                  Start a Business as a Veteran
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/how-to-start-an-llc-in-texas"
                  className="text-sm text-white/70 hover:text-gold transition-colors"
                >
                  How to Start a Texas LLC
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/texas-veteran-owned-business-certification"
                  className="text-sm text-white/70 hover:text-gold transition-colors"
                >
                  Veteran Business Certification
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/texas-veteran-business-benefits"
                  className="text-sm text-white/70 hover:text-gold transition-colors"
                >
                  Veteran Business Benefits
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gold mb-3 uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-white/70">
                <Mail className="h-4 w-4 text-gold" />
                <span>contact@hutchrok.com</span>
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
