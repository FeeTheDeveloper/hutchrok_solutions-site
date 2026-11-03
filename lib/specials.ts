import { PAID_SERVICES, type PaidServiceSlug } from "@/lib/paid-services";

/**
 * Date-windowed add-on specials. Each special switches on and off by itself,
 * so seasonal campaigns (Veterans Day, Small Business Saturday, year-end)
 * need no deploy to expire. Dates are inclusive, America/Chicago.
 */
export interface AddOnSpecial {
  id: string;
  title: string;
  blurb: string;
  services: PaidServiceSlug[];
  percentOff: number;
  code: string;
  startsOn: string; // YYYY-MM-DD
  endsOn: string; // YYYY-MM-DD
  /** Only shown/applied to accounts with a verified free filing. */
  veteransOnly?: boolean;
}

export const ADD_ON_SPECIALS: AddOnSpecial[] = [
  {
    id: "veterans-day-2026",
    title: "Veterans Day Launch Special",
    blurb:
      "Verified veterans get 20% off website, brand, and email setup added to their free filing.",
    services: ["business-website", "brand-identity-package", "logo-design", "business-email-setup"],
    percentOff: 20,
    code: "SALUTE20",
    startsOn: "2026-11-04",
    endsOn: "2026-11-15",
    veteransOnly: true,
  },
];

function todayInChicago(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function activeSpecials(now = new Date()): AddOnSpecial[] {
  const today = todayInChicago(now);
  return ADD_ON_SPECIALS.filter((s) => s.startsOn <= today && today <= s.endsOn);
}

export function specialServiceNames(special: AddOnSpecial): string[] {
  return special.services
    .map((slug) => PAID_SERVICES.find((p) => p.slug === slug)?.title)
    .filter((t): t is string => Boolean(t));
}
