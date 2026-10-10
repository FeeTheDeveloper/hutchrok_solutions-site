/**
 * 3D brand illustrations (navy / gold / green on cream).
 * Source files live in /public/images/3d — one registry so dimensions and
 * alt text stay consistent wherever an illustration is used.
 */
export const ILLUSTRATIONS = {
  heroTexasLaunch: {
    src: "/images/3d/hero-texas-launch.webp",
    width: 1680,
    height: 944,
    alt: "3D illustration of a small storefront on a Texas-shaped base, with a briefcase, military dog tags, a gold star, and a rising growth chart",
  },
  freeFilingFormation: {
    src: "/images/3d/free-filing-formation.webp",
    width: 1456,
    height: 1088,
    alt: "3D illustration of a formation certificate with a gold seal, fountain pen, navy folder, and approval checkmark",
  },
  governmentContracting: {
    src: "/images/3d/government-contracting.webp",
    width: 1456,
    height: 1088,
    alt: "3D illustration of a government building with a contract scroll, gold seal, star shield with laurel, coins, and a growth chart",
  },
  veteranBenefitsResources: {
    src: "/images/3d/veteran-benefits-resources.webp",
    width: 1456,
    height: 1088,
    alt: "3D illustration of a star shield connected to education, home, health, guide, and business resources",
  },
  registeredAgentCompliance: {
    src: "/images/3d/registered-agent-compliance.webp",
    width: 1456,
    height: 1088,
    alt: "3D illustration of a mailbox with letters, a compliance calendar with checkmarks, a check shield, and a padlock",
  },
  launchServices: {
    src: "/images/3d/launch-services.webp",
    width: 1456,
    height: 1088,
    alt: "3D illustration of a laptop showing a website, a launching rocket, brand color swatches, a business card, an envelope, and a globe",
  },
} as const;

export type IllustrationKey = keyof typeof ILLUSTRATIONS;
