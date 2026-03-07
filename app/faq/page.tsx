"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";

const faqs = [
  {
    category: "Eligibility",
    items: [
      {
        q: "Who qualifies for a free Texas LLC filing?",
        a: "U.S. military veterans who have been honorably discharged and can obtain a Veteran Verification Letter (VVL) from the Texas Veterans Commission. The program covers new Texas LLC formations — one free filing per veteran.",
      },
      {
        q: "Do I need to live in Texas?",
        a: "You don't need to be a Texas resident, but the LLC must be formed in Texas with a Texas registered agent address. The TVC verification and SOS filing are Texas-specific processes.",
      },
      {
        q: "What if I was dishonorably discharged?",
        a: "The TVC veteran verification process requires an honorable discharge (or general under honorable conditions, depending on TVC policy). If you're unsure about your eligibility, contact TVC directly — they can review your specific situation.",
      },
      {
        q: "Can I file a corporation or nonprofit instead of an LLC?",
        a: "This program is currently LLC-only. The TVC fee waiver applies to other entity types under Texas law, but Hutchrok's free filing service is focused on Texas LLCs in this phase.",
      },
      {
        q: "Is there a deadline to use this program?",
        a: "There's no published deadline. However, availability may change. We recommend starting the process as soon as you're ready.",
      },
    ],
  },
  {
    category: "TVC Verification",
    items: [
      {
        q: "What is the Veteran Verification Letter (VVL)?",
        a: "The VVL is a letter from the Texas Veterans Commission that confirms your veteran status. It's sent directly to the Texas Secretary of State and authorizes the $300 filing fee waiver under Texas Business Organizations Code §3.005(b).",
      },
      {
        q: "How long does it take to get a VVL?",
        a: "Processing times vary depending on TVC's workload. It can take days to several weeks. We recommend starting the VVL process before or alongside your intake — Hutchrok can begin preparing your filing while you wait.",
      },
      {
        q: "Does the VVL cost anything?",
        a: "No. Requesting a Veteran Verification Letter from TVC is free.",
      },
      {
        q: "What documents do I need to request a VVL?",
        a: "You'll typically need your DD-214 (Certificate of Release or Discharge from Active Duty) or equivalent discharge documentation showing honorable discharge status.",
      },
      {
        q: "Can Hutchrok get the VVL for me?",
        a: "No. The VVL must come directly from the Texas Veterans Commission. Hutchrok can guide you through the process, explain what's needed, and help you understand the timeline — but TVC handles the actual verification.",
      },
    ],
  },
  {
    category: "The Filing Process",
    items: [
      {
        q: "What does Hutchrok actually file?",
        a: "We prepare and submit your Certificate of Formation (Texas Form 205) to the Texas Secretary of State. This is the document that legally creates your LLC in Texas.",
      },
      {
        q: "Is the filing automated?",
        a: "No. Every filing is reviewed and submitted by our operations team. We do not auto-submit to the Texas SOS. A real person manages your case from intake to approval.",
      },
      {
        q: "How long does the SOS take to process a filing?",
        a: "Processing times depend on the Texas Secretary of State's current workload. Standard processing can take several business days to a few weeks. Expedited options are available through the SOS at an additional cost (not covered by the free program).",
      },
      {
        q: "What information do I need to provide?",
        a: "Your desired LLC name, registered agent (with a Texas address), management structure choice (member-managed or manager-managed), and your personal details as the organizer. We walk you through everything during intake.",
      },
      {
        q: "What if my LLC name is already taken?",
        a: "We'll check name availability with the Texas SOS before submitting. If your preferred name is taken, we'll work with you to find an available alternative.",
      },
    ],
  },
  {
    category: "Cost & Services",
    items: [
      {
        q: "What exactly is free?",
        a: "The $300 Texas SOS filing fee (waived via TVC verification) and Hutchrok's filing preparation service. You pay $0 for a qualified veteran LLC formation through this program.",
      },
      {
        q: "What's NOT included in the free filing?",
        a: "EIN application, operating agreements, registered agent service, compliance setup, and other post-formation services are not included. These are available as optional paid services.",
      },
      {
        q: "Is there any catch or hidden fee?",
        a: "No. The free filing is genuinely free. Post-filing services like website development, branding, and compliance setup are offered separately — but they're completely optional. Your free filing has zero obligations attached.",
      },
      {
        q: "What paid services does Hutchrok offer after filing?",
        a: "Website development, brand identity packages, logo design, business email setup, domain and hosting, EIN coordination, operating agreements, registered agent support, and compliance calendar setup. All optional.",
      },
    ],
  },
  {
    category: "About Hutchrok",
    items: [
      {
        q: "Is Hutchrok a law firm?",
        a: "No. Hutchrok Solutions Group is not a law firm and does not provide legal advice. We prepare and submit formation documents on your behalf based on information you provide. If you need legal counsel, we recommend consulting a licensed attorney.",
      },
      {
        q: "Is Hutchrok veteran-owned?",
        a: "Yes. Hutchrok Solutions Group is a veteran-owned and veteran-operated business based in Dallas, TX.",
      },
      {
        q: "How do I contact Hutchrok?",
        a: "You can reach us through our contact page, or email contact@hutchrok.com. We're based in Dallas, TX.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge
            variant="secondary"
            className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase"
          >
            FAQ
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-white/65 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            Everything you need to know about the free veteran LLC filing
            program, TVC verification, and what Hutchrok handles for you.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <div className="space-y-12">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-xl sm:text-2xl font-bold text-navy mb-4">
                  {section.category}
                </h2>
                <div className="bg-cream/50 rounded-2xl border border-border/40 px-6">
                  <Accordion type="single" collapsible>
                    {section.items.map((item, i) => (
                      <AccordionItem
                        key={i}
                        value={`${section.category}-${i}`}
                      >
                        <AccordionTrigger className="text-navy text-left text-[15px]">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
            Still Have Questions?
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Reach out directly — we&apos;re happy to help you understand the
            process and your eligibility.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12 shadow-lg shadow-gold/10"
              >
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/free-filing">
              <Button
                size="lg"
                variant="outline"
                className="border-gold/40 text-gold hover:bg-gold/10 font-semibold text-base px-8 h-12"
              >
                Start My Free Filing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
