import { Badge } from "@/components/ui/badge";
import GovHousingIntakeForm from "@/components/gov-housing-intake-form";
import { Building2, ClipboardCheck, Route, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Government Housing Consulting Intake",
  description:
    "Tell us about your property and goals. Hutchrok helps landlords and owners get placement-ready for Section 8 / voucher programs, portfolio conversion, and federal housing opportunities.",
};

const highlights = [
  { icon: ClipboardCheck, title: "Readiness assessment", desc: "We map the gap between your property and voucher-program requirements." },
  { icon: Route, title: "Right-sized pathway", desc: "Single placement, portfolio conversion, or federal development — routed to fit." },
  { icon: ShieldCheck, title: "Veteran-owned", desc: "Operator-reviewed guidance from a team that has done the work." },
];

export default function GovHousingConsultingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-navy py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge variant="secondary" className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase">
            <Building2 className="h-3 w-3 mr-1" />
            Gov-Housing Consulting
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Get Your Property Placement-Ready
          </h1>
          <p className="text-white/65 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            Whether you&apos;re leasing a single unit to a voucher tenant or converting a
            portfolio toward federal housing programs, tell us where you are — we&apos;ll
            route you to the right engagement and next steps.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-cream border-b border-border/30 py-10">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {highlights.map((h) => (
            <div key={h.title} className="flex flex-col items-center text-center gap-2">
              <div className="h-11 w-11 rounded-xl bg-gold/10 flex items-center justify-center">
                <h.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="font-semibold text-navy text-[15px]">{h.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Consulting Intake</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Takes about 5 minutes. Required fields are marked with an asterisk.
            </p>
          </div>
          <GovHousingIntakeForm />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white border-t border-border/30 py-8">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Hutchrok Solutions Group is not a law firm and does not provide legal advice.
            Consulting engagements are scoped after review of your intake. Program eligibility
            and requirements are determined by the relevant public housing authority and
            federal agencies.
          </p>
        </div>
      </section>
    </>
  );
}
