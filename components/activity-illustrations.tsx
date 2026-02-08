/** Cohesive inline SVG illustrations for homepage activity cards.
 *  Style: clean line art, navy outlines (#0A1628), gold accent (#C8A951). */

export function FormationIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Building base */}
      <rect x="30" y="38" width="60" height="52" rx="3" stroke="#0A1628" strokeWidth="2" fill="none" />
      {/* Roof / pediment */}
      <path d="M24 40 L60 18 L96 40" stroke="#C8A951" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Columns */}
      <line x1="44" y1="54" x2="44" y2="82" stroke="#0A1628" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="54" x2="60" y2="82" stroke="#0A1628" strokeWidth="2" strokeLinecap="round" />
      <line x1="76" y1="54" x2="76" y2="82" stroke="#0A1628" strokeWidth="2" strokeLinecap="round" />
      {/* Door */}
      <rect x="52" y="72" width="16" height="18" rx="2" stroke="#C8A951" strokeWidth="1.5" fill="none" />
      {/* Steps */}
      <line x1="36" y1="90" x2="84" y2="90" stroke="#0A1628" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="95" x2="88" y2="95" stroke="#0A1628" strokeWidth="1.5" strokeLinecap="round" />
      {/* Document / filing badge */}
      <rect x="78" y="24" width="22" height="28" rx="3" stroke="#C8A951" strokeWidth="1.5" fill="#FAF8F5" />
      <line x1="84" y1="32" x2="94" y2="32" stroke="#0A1628" strokeWidth="1" strokeLinecap="round" />
      <line x1="84" y1="37" x2="94" y2="37" stroke="#0A1628" strokeWidth="1" strokeLinecap="round" />
      <line x1="84" y1="42" x2="90" y2="42" stroke="#0A1628" strokeWidth="1" strokeLinecap="round" />
      {/* Check */}
      <path d="M86 46 L89 49 L96 42" stroke="#C8A951" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function ComplianceIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Shield */}
      <path
        d="M60 16 L92 32 V62 C92 82 60 102 60 102 C60 102 28 82 28 62 V32 L60 16Z"
        stroke="#0A1628"
        strokeWidth="2"
        fill="none"
      />
      {/* Inner shield accent */}
      <path
        d="M60 26 L84 38 V60 C84 76 60 92 60 92 C60 92 36 76 36 60 V38 L60 26Z"
        stroke="#C8A951"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      {/* Checkmark */}
      <path
        d="M46 58 L56 68 L76 48"
        stroke="#C8A951"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Gear small top-right */}
      <circle cx="96" cy="28" r="10" stroke="#0A1628" strokeWidth="1.5" fill="#FAF8F5" />
      <circle cx="96" cy="28" r="4" stroke="#C8A951" strokeWidth="1.5" fill="none" />
      {/* Gear teeth */}
      <line x1="96" y1="16" x2="96" y2="20" stroke="#0A1628" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="96" y1="36" x2="96" y2="40" stroke="#0A1628" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="84" y1="28" x2="88" y2="28" stroke="#0A1628" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="104" y1="28" x2="108" y2="28" stroke="#0A1628" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function AdvisoryIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Chart / growth line */}
      <rect x="18" y="30" width="84" height="64" rx="4" stroke="#0A1628" strokeWidth="2" fill="none" />
      {/* Grid lines */}
      <line x1="18" y1="52" x2="102" y2="52" stroke="#E2E8F0" strokeWidth="0.75" />
      <line x1="18" y1="72" x2="102" y2="72" stroke="#E2E8F0" strokeWidth="0.75" />
      {/* Growth path */}
      <path
        d="M30 82 L48 68 L62 74 L78 50 L94 38"
        stroke="#C8A951"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Data points */}
      <circle cx="30" cy="82" r="3" fill="#C8A951" />
      <circle cx="48" cy="68" r="3" fill="#C8A951" />
      <circle cx="62" cy="74" r="3" fill="#C8A951" />
      <circle cx="78" cy="50" r="3" fill="#C8A951" />
      <circle cx="94" cy="38" r="3" fill="#C8A951" />
      {/* Arrow pointing up-right */}
      <path d="M86 32 L96 28 L92 38" stroke="#0A1628" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Lightbulb accent top-left */}
      <circle cx="24" cy="18" r="8" stroke="#C8A951" strokeWidth="1.5" fill="none" />
      <line x1="22" y1="26" x2="26" y2="26" stroke="#C8A951" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="10" x2="24" y2="13" stroke="#C8A951" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
