import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, ArrowRight, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Formation & Filings",
  description:
    "LLC and corporate formation, EIN coordination, operating agreements, and state filing support from Hutchrok Solutions Group.",
};

const inclusions = [
  {
    title: "LLC & Corporation Formation",
    desc: "We coordinate the formation of your entity — whether an LLC, corporation, or other structure — ensuring proper documentation and state compliance.",
  },
  {
    title: "EIN Readiness",
    desc: "We guide you through the EIN application process and ensure your entity is properly set up to receive its Employer Identification Number.",
  },
  {
    title: "Operating Agreement Coordination",
    desc: "We coordinate the preparation of operating agreements so your entity has a clear governance structure from day one.",
  },
  {
    title: "State Filing Support",
    desc: "From Articles of Organization to annual reports, we manage and track state-level filings so nothing falls through the cracks.",
  },
  {
    title: "Registered Agent Coordination",
    desc: "We help you set up and maintain a registered agent, ensuring your business has a designated point of contact for legal and state correspondence.",
  },
  {
    title: "Compliance Documentation",
    desc: "Every formation includes a compliance checklist and calendar so you know exactly what needs to be filed and when.",
  },
];

const faqs = [
  {
    q: "What types of entities can you help me form?",
    a: "We support the formation of LLCs, corporations (S-Corp and C-Corp election guidance), and multi-entity holding company structures. During intake, we assess your goals and recommend the structure that best fits your business.",
  },
  {
    q: "How long does the formation process typically take?",
    a: "Formation timelines vary by state, but most entities are filed within 5–10 business days after all documentation is prepared. Some states offer expedited processing, which we can coordinate on your behalf.",
  },
  {
    q: "Do you provide legal or tax advice?",
    a: "No. Hutchrok Solutions Group is not a law firm or CPA. We provide business formation coordination, compliance support, and operational structuring. We recommend consulting with licensed legal and tax professionals for specific legal or tax advice.",
  },
  {
    q: "What is included in the operating agreement coordination?",
    a: "We coordinate the preparation of your operating agreement, ensuring it covers governance, member roles, profit distribution, and management structure. We work with your legal counsel if you have one, or recommend vetted partners.",
  },
  {
    q: "Can you help me form a business in a state I don't live in?",
    a: "Yes. We support entity formation in all 50 states and can coordinate registered agent services in any state where your business operates or is registered.",
  },
  {
    q: "What happens after my entity is formed?",
    a: "After formation, we provide a compliance calendar, document your filing records, and offer ongoing managed services to keep your business in good standing. You'll have all the documentation you need organized and accessible.",
  },
  {
    q: "Do I need a registered agent?",
    a: "Yes. Every state requires a registered agent for your business entity. We coordinate registered agent setup as part of our formation services and can maintain it through our managed services package.",
  },
];

export default function FormationFilingsPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
            Formation & Filings
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Business Formation Done Right
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Properly structured, compliantly filed, and built for long-term
            operations. Every formation starts with the right foundation.
          </p>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 sm:py-24 bg-white bg-grid-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              What&apos;s Included
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every formation engagement covers the core elements your business
              needs to be properly established and operationally ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inclusions.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl bg-cream border border-border/40 hover:border-gold/40 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                  <h3 className="font-semibold text-navy">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-white rounded-lg border border-border/60 px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-navy hover:text-gold py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-navy py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Form Your Business?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Start with a quick intake and we&apos;ll build a formation plan
            tailored to your goals.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-navy font-bold px-10"
            >
              Start Intake
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
