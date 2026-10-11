/**
 * 3D brand illustrations (navy / gold / green on cream).
 * Source files live in /public/images/3d — one registry so dimensions and
 * alt text stay consistent wherever an illustration is used.
 *
 * `motion` names the illustration's motion signature. Each one is a distinct
 * idle choreography defined in globals.css under `[data-motion="…"]`, so no
 * two illustrations on the site move the same way.
 */
export type MotionSignature =
  | "lift"
  | "seal"
  | "rise"
  | "orbit"
  | "sway"
  | "launch";

export const ILLUSTRATIONS = {
  heroTexasLaunch: {
    src: "/images/3d/hero-texas-launch.webp",
    width: 1680,
    height: 944,
    alt: "3D illustration of a small storefront on a Texas-shaped base, with a briefcase, military dog tags, a gold star, and a rising growth chart",
    motion: "lift",
  },
  freeFilingFormation: {
    src: "/images/3d/free-filing-formation.webp",
    width: 1456,
    height: 1088,
    alt: "3D illustration of a formation certificate with a gold seal, fountain pen, navy folder, and approval checkmark",
    motion: "seal",
  },
  governmentContracting: {
    src: "/images/3d/government-contracting.webp",
    width: 1456,
    height: 1088,
    alt: "3D illustration of a government building with a contract scroll, gold seal, star shield with laurel, coins, and a growth chart",
    motion: "rise",
  },
  veteranBenefitsResources: {
    src: "/images/3d/veteran-benefits-resources.webp",
    width: 1456,
    height: 1088,
    alt: "3D illustration of a star shield connected to education, home, health, guide, and business resources",
    motion: "orbit",
  },
  registeredAgentCompliance: {
    src: "/images/3d/registered-agent-compliance.webp",
    width: 1456,
    height: 1088,
    alt: "3D illustration of a mailbox with letters, a compliance calendar with checkmarks, a check shield, and a padlock",
    motion: "sway",
  },
  launchServices: {
    src: "/images/3d/launch-services.webp",
    width: 1456,
    height: 1088,
    alt: "3D illustration of a laptop showing a website, a launching rocket, brand color swatches, a business card, an envelope, and a globe",
    motion: "launch",
  },
} as const satisfies Record<
  string,
  {
    src: string;
    width: number;
    height: number;
    alt: string;
    motion: MotionSignature;
  }
>;

export type IllustrationKey = keyof typeof ILLUSTRATIONS;
