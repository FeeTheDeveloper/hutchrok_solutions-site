import type { Metadata } from "next";
import Link from "next/link";
import { GuideLayout, GuideCTA } from "@/components/guide-layout";

export const metadata: Metadata = {
  title:
    "Texas Veteran Verification Letter (VVL) — How to Get Yours in 2026",
  description:
    "Step-by-step guide to obtaining your Veteran Verification Letter from the Texas Veterans Commission. Required for the free LLC filing fee waiver under Texas Business Organizations Code §3.005(b).",
  keywords: [
    "Texas veteran verification letter",
    "VVL Texas",
    "Texas Veterans Commission verification",
    "veteran verification letter LLC",
    "TVC veteran letter",
    "free LLC filing veteran Texas",
  ],
  openGraph: {
    title: "Texas Veteran Verification Letter (2026)",
    description:
      "How to get your Veteran Verification Letter from the Texas Veterans Commission for free LLC filing.",
    type: "article",
    locale: "en_US",
  },
};

const relatedGuides = [
  {
    href: "/guides/texas-veteran-llc-filing-fee-waiver",
    title: "Texas Veteran LLC Filing Fee Waiver",
  },
  {
    href: "/guides/how-to-start-an-llc-in-texas",
    title: "How to Start an LLC in Texas",
  },
  {
    href: "/guides/start-a-business-in-texas-as-a-veteran",
    title: "How to Start a Business in Texas as a Veteran",
  },
  {
    href: "/guides/texas-veteran-owned-business-certification",
    title: "Texas Veteran-Owned Business Certification",
  },
];

export default function VeteranVerificationLetterGuide() {
  return (
    <GuideLayout
      badge="VVL Guide"
      title="How to Get Your Texas Veteran Verification Letter"
      subtitle="The Veteran Verification Letter is your key to free LLC filing. Here's exactly how to get one."
      publishedDate="2026-03-01"
      readingTime="6 min read"
      relatedGuides={relatedGuides}
    >
      <p>
        The <strong>Veteran Verification Letter (VVL)</strong> is a document
        issued by the Texas Veterans Commission (TVC) that confirms your
        military veteran status. It&apos;s required to{" "}
        <Link href="/guides/texas-veteran-llc-filing-fee-waiver">
          waive the $300 LLC filing fee
        </Link>{" "}
        when forming a business entity with the Texas Secretary of State.
      </p>
      <p>
        This guide covers what the VVL is, who qualifies, and the step-by-step
        process to obtain yours.
      </p>

      <h2>What Is the Veteran Verification Letter?</h2>
      <p>
        The VVL is an official letter from the Texas Veterans Commission sent
        directly to the Texas Secretary of State. It verifies that you are a
        qualifying veteran under{" "}
        <strong>Texas Business Organizations Code §3.005(b)</strong>, which
        authorizes the SOS to waive formation filing fees for veterans.
      </p>
      <p>Key facts about the VVL:</p>
      <ul>
        <li>
          Issued by the <strong>Texas Veterans Commission (TVC)</strong>
        </li>
        <li>
          Sent directly to the <strong>Texas Secretary of State</strong> — you
          don&apos;t receive a physical copy to submit yourself
        </li>
        <li>
          Required before you file your Certificate of Formation to receive the
          fee waiver
        </li>
        <li>Available at no cost to qualifying veterans</li>
      </ul>

      <h2>Who Qualifies for a VVL?</h2>
      <p>You are eligible for a Veteran Verification Letter if you:</p>
      <ul>
        <li>
          Served in the <strong>U.S. Armed Forces</strong> (Army, Navy, Air
          Force, Marines, Coast Guard, or Space Force)
        </li>
        <li>
          Received an <strong>honorable discharge</strong> or general discharge
          under honorable conditions
        </li>
        <li>
          Can provide a <strong>DD-214</strong> (Certificate of Release or
          Discharge from Active Duty) as proof of service
        </li>
      </ul>

      <GuideCTA
        text="Check if you qualify for the free filing fee waiver."
        href="/eligibility"
        label="Check My Eligibility"
      />

      <h2>Step-by-Step: How to Get Your VVL</h2>

      <h3>Step 1: Locate Your DD-214</h3>
      <p>
        Your DD-214 is the foundational document for the VVL request. If you
        don&apos;t have a copy:
      </p>
      <ul>
        <li>
          Request one from the <strong>National Personnel Records Center
          (NPRC)</strong> through the National Archives website
        </li>
        <li>
          Use <strong>eBenefits</strong> or <strong>VA.gov</strong> to access
          your military records online
        </li>
        <li>
          Contact your county&apos;s Veterans County Service Officer for
          assistance
        </li>
      </ul>
      <p>
        Processing a DD-214 replacement can take several weeks, so start early
        if you don&apos;t have yours.
      </p>

      <h3>Step 2: Contact the Texas Veterans Commission</h3>
      <p>You can reach the TVC through several channels:</p>
      <ul>
        <li>
          <strong>Online</strong> — visit the TVC website to find the
          appropriate form or contact email
        </li>
        <li>
          <strong>Phone</strong> — call the TVC headquarters in Austin for
          guidance
        </li>
        <li>
          <strong>In person</strong> — visit a TVC regional office or your local
          Veterans County Service Officer
        </li>
      </ul>

      <h3>Step 3: Submit Your Request</h3>
      <p>When you contact the TVC, you&apos;ll need to provide:</p>
      <ul>
        <li>Your full legal name</li>
        <li>A copy of your DD-214</li>
        <li>The type of business entity you plan to form (e.g., LLC)</li>
        <li>Your contact information</li>
      </ul>
      <p>
        The TVC reviews your documentation and, once verified, sends the VVL
        directly to the Texas Secretary of State.
      </p>

      <h3>Step 4: Wait for Confirmation</h3>
      <p>
        Processing times vary. In some cases, the VVL is processed in a few
        days. In busier periods, it may take several weeks. The TVC may contact
        you if additional documentation is needed.
      </p>
      <p>
        <strong>Important:</strong> Do not file your Certificate of Formation
        until you have confirmation that the VVL has been received by the SOS.
        Filing before the VVL arrives means you&apos;ll be charged the $300 fee.
      </p>

      <h3>Step 5: File Your LLC</h3>
      <p>
        Once the VVL is on file with the Secretary of State, you can submit your
        Certificate of Formation (Form 205) and the $300 filing fee will be
        waived. See our{" "}
        <Link href="/guides/how-to-start-an-llc-in-texas">
          complete guide to forming a Texas LLC
        </Link>{" "}
        for detailed filing instructions.
      </p>

      <GuideCTA
        text="Veterans: Hutchrok handles your formation at no cost."
        href="/free-filing"
        label="Learn About Free Filing"
      />

      <h2>Common Mistakes to Avoid</h2>
      <ul>
        <li>
          <strong>Filing before VVL confirmation</strong> — the most common
          mistake. If the SOS doesn&apos;t have your VVL when you file, you pay
          the full $300.
        </li>
        <li>
          <strong>Submitting an incomplete DD-214</strong> — the TVC needs your
          Member 4 copy (the long form), not the Member 1 copy. The long form
          includes discharge characterization.
        </li>
        <li>
          <strong>Not following up</strong> — if you haven&apos;t heard back in
          2–3 weeks, follow up with the TVC. Requests occasionally need
          additional documentation.
        </li>
        <li>
          <strong>Assuming the VVL covers renewals</strong> — the VVL covers
          the initial formation filing only, not annual reports or amendments.
        </li>
      </ul>

      <h2>How Hutchrok Helps</h2>
      <p>
        The VVL process is straightforward, but timing and coordination matter.
        Hutchrok helps by:
      </p>
      <ul>
        <li>
          <strong>Verifying your eligibility</strong> —{" "}
          <Link href="/eligibility">
            our eligibility check
          </Link>{" "}
          confirms you qualify before you start
        </li>
        <li>
          <strong>Guiding the VVL request</strong> — we walk you through exactly
          what to submit to the TVC
        </li>
        <li>
          <strong>Coordinating timing</strong> — we prepare your Form 205 in
          parallel so it&apos;s ready to file as soon as the VVL is confirmed
        </li>
        <li>
          <strong>Filing and tracking</strong> — we submit your formation
          documents and monitor status through approval
        </li>
      </ul>

      <GuideCTA
        text="Start your veteran business with Hutchrok."
        href="/free-filing"
        label="Start My Free Filing"
      />
    </GuideLayout>
  );
}
