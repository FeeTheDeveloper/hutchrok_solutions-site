/**
 * Texas Veterans Commission direct contact for the TVC Connect page.
 *
 * Publishing a named state employee's contact must be confirmed with that
 * person (and TVC) first. Until `listingConfirmed` is true the page shows the
 * TVC general channels and routes the named-contact request through Hutchrok.
 */
export const TVC_CONTACT = {
  name: "Victoria Spitler",
  role: "Veteran Service Officer & Claims Specialist",
  agency: "Texas Veterans Commission",
  email: "victoria.spitler@tvc.texas.gov",
  listingConfirmed: process.env.NEXT_PUBLIC_TVC_CONTACT_CONFIRMED === "true",
} as const;

export const TVC_GENERAL = {
  website: "https://tvc.texas.gov",
  hq: "1700 N Congress Ave, Suite 800, Austin, TX 78701",
} as const;
