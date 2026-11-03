import type { Metadata } from "next";
import { FileText, Mail, ShieldCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsletterSignup from "@/components/newsletter-signup";
import { TVC_CONTACT, TVC_GENERAL } from "@/lib/tvc-contact";

export const metadata: Metadata = {
  title: "Texas Veterans Commission Connect",
  description:
    "Connect with a Texas Veterans Commission Veteran Service Officer for free VA claims and benefits help, and get the Veteran Verification Letter for your free Texas LLC filing.",
};

const steps = [
  {
    icon: UserCheck,
    title: "Reach a TVC service officer",
    body: "TVC claims counselors help Texas veterans file and appeal VA disability claims at no cost.",
  },
  {
    icon: FileText,
    title: "Request your Veteran Verification Letter",
    body: "The VVL proves eligibility for the $300 Texas SOS filing fee waiver used in your free Hutchrok filing.",
  },
  {
    icon: ShieldCheck,
    title: "Unlock your free filing",
    body: "Upload the VVL to your Hutchrok account. Once verified, your one free Texas LLC filing is ready to claim.",
  },
];

export default function TvcConnectPage() {
  const subject = encodeURIComponent("Veteran benefits / claims assistance — referred by Hutchrok");

  return (
    <main className="bg-white">
      <section className="bg-navy py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">TVC Connect</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-5xl">
            Benefits help from the Texas Veterans Commission.
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Free claims and benefits help from an accredited Texas Veterans Commission service officer, and the
            Veteran Verification Letter behind your free Texas LLC filing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-[3fr_2fr]">
        <ol className="space-y-6">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <s.icon className="h-6 w-6 shrink-0 text-gold" />
              <div>
                <p className="font-bold text-navy">{i + 1}. {s.title}</p>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="rounded-xl border border-gold/40 p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-gold">Benefits &amp; claims inquiries</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Email a Texas Veterans Commission service officer directly for VA disability claims, appeals, and
            benefits questions. TVC assistance is free.
          </p>
          <a href={`mailto:${TVC_CONTACT.email}?subject=${subject}`} className="mt-4 inline-block">
            <Button className="bg-gold text-navy hover:bg-gold-dark">
              <Mail className="mr-2 h-4 w-4" /> Email TVC benefits &amp; claims
            </Button>
          </a>
          <p className="mt-2 break-all text-sm font-medium text-navy">{TVC_CONTACT.email}</p>
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-semibold text-navy">When you email, include:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Your full name, phone number, and Texas county</li>
              <li>What you need: a new claim, appeal, increase, or general benefits question</li>
              <li>That you were referred by Hutchrok Solutions Group</li>
            </ul>
            <p className="mt-2 text-xs">Do not email your Social Security number, DD-214, or medical records. The service officer will tell you how to share documents securely.</p>
          </div>
          <div className="mt-6 border-t pt-4 text-sm text-muted-foreground space-y-1">
            <p>
              <a href={TVC_GENERAL.website} target="_blank" rel="noopener noreferrer" className="underline">tvc.texas.gov</a>
            </p>
            <p>{TVC_GENERAL.hq}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-6 sm:px-6 lg:px-8">
        <p className="text-xs text-muted-foreground">
          The Texas Veterans Commission is a Texas state agency. TVC services are free; Hutchrok Solutions Group
          is an independent, SBA-certified SDVOSB and is not part of TVC. Hutchrok does not file VA claims.
        </p>
      </section>

      <section className="bg-navy py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white">Stay current on your benefits</h2>
          <p className="mt-1 mb-6 text-white/70">VA and veteran-organization updates, Texas resources, and member specials.</p>
          <NewsletterSignup source="tvc-connect" dark />
        </div>
      </section>
    </main>
  );
}
