// Hutchrok Operating System — motion feature manifest
// Source: Google Flow project "Hutchrok Solutions Group" (Veo 3.1 Fast, 720p, 8s, 16:9)
// Export each clip from Flow as MP4 and place under /public/media/os/.
// Export the matching 3D still too — it is the clip's own first frame, so it
// doubles as the <video poster> and as the reduced-motion fallback.

export type OsStage = {
  id: string;
  /** Lifecycle stage. Mirrors File -> Launch -> Operate -> Automate -> Grow -> Contract -> Scale. */
  stage: string;
  heading: string;
  body: string;
  /** Flow clip title, so an asset can be traced back to the generation that made it. */
  flowClip: string;
  video: string;
  poster: string;
  href: string;
};

export const OS_STAGES: OsStage[] = [
  {
    id: "verification",
    stage: "Verify",
    heading: "Veteran business verification",
    body: "We establish and document your veteran status and business eligibility so every certification after it has something solid to sit on.",
    flowClip: "Shield turns with gold star",
    video: "/media/os/verification.mp4",
    poster: "/media/os/verification.jpg",
    href: "/services/veteran-verification",
  },
  {
    id: "formation",
    stage: "File",
    heading: "Formation and operating agreements",
    body: "Entity structure, filings and agreements built to hold up under a lender, a prime contractor or an audit.",
    flowClip: "Gold seal stamping documents",
    video: "/media/os/formation.mp4",
    poster: "/media/os/formation.jpg",
    href: "/services/formation",
  },
  {
    id: "contracting",
    stage: "Contract",
    heading: "Government contracting readiness",
    body: "SAM.gov, SDVOSB positioning and the proposal posture that makes your company bid-ready rather than merely registered.",
    flowClip: "Green bars grow upward",
    video: "/media/os/contracting.mp4",
    poster: "/media/os/contracting.jpg",
    href: "/services/government-contracting",
  },
  {
    id: "credit",
    stage: "Grow",
    heading: "Business credit and capital readiness",
    body: "A credit profile built deliberately, in the order lenders actually read it, until the answer stops being no.",
    flowClip: "Green line graph rising",
    video: "/media/os/credit.mp4",
    poster: "/media/os/credit.jpg",
    href: "/services/business-credit",
  },
  {
    id: "compliance",
    stage: "Operate",
    heading: "Compliance and renewals",
    body: "Franchise tax, registrations and certifications tracked against their real deadlines, so nothing lapses quietly.",
    flowClip: "Gold check marks and padlock",
    video: "/media/os/compliance.mp4",
    poster: "/media/os/compliance.jpg",
    href: "/services/compliance",
  },
  {
    id: "platform",
    stage: "Automate",
    heading: "Systems and automation",
    body: "The website, dashboard and integrations that let the business run without a person retyping the same record twice.",
    flowClip: "Laptop and rocket launch",
    video: "/media/os/platform.mp4",
    poster: "/media/os/platform.jpg",
    href: "/services/software-automation",
  },
  {
    id: "footprint",
    stage: "Launch",
    heading: "Texas footprint",
    body: "Registered agent, local presence and the state-level groundwork a Texas operating business is expected to have.",
    flowClip: "Texas storefront render",
    video: "/media/os/footprint.mp4",
    poster: "/media/os/footprint.jpg",
    href: "/services/texas-filings",
  },
  {
    id: "network",
    stage: "Scale",
    heading: "The Hutchrok network",
    body: "Holding structure and shared infrastructure across companies, with each entity kept legally and operationally separate.",
    flowClip: "Gold star on navy shield",
    video: "/media/os/network.mp4",
    poster: "/media/os/network.jpg",
    href: "/network",
  },
];
