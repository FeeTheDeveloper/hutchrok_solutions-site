import "server-only";

/**
 * Veteran benefits and business-resource feeds.
 *
 * Only machine-readable feeds verified to return RSS are polled. Partner
 * organizations without a usable public feed (or that block automated
 * access, like tvc.texas.gov) are listed as link-outs instead of scraped.
 */

export interface FeedSource {
  id: string;
  org: string;
  url: string;
  site: string;
}

export interface FeedItem {
  title: string;
  link: string;
  published: string | null;
  org: string;
}

export const FEED_SOURCES: FeedSource[] = [
  { id: "va-news", org: "U.S. Department of Veterans Affairs", url: "https://news.va.gov/feed/", site: "https://news.va.gov" },
  { id: "vfw", org: "VFW", url: "https://www.vfw.org/rss/press-releases", site: "https://www.vfw.org" },
];

export const RESOURCE_LINKS = [
  { org: "Texas Veterans Commission", desc: "Claims help, Veteran Entrepreneur Program, and the Veteran Verification Letter used for the $300 SOS fee waiver.", href: "https://tvc.texas.gov" },
  { org: "VA Benefits", desc: "Disability compensation, education, home loans, and health care.", href: "https://www.va.gov" },
  { org: "SBA Office of Veterans Business Development", desc: "Boots to Business, VBOCs, and SBA VetCert for VOSB/SDVOSB.", href: "https://www.sba.gov/business-guide/grow-your-business/veteran-owned-businesses" },
  { org: "DAV", desc: "Free benefits representation from national service officers.", href: "https://www.dav.org" },
  { org: "The American Legion", desc: "Accredited service officers and veteran employment resources.", href: "https://www.legion.org" },
  { org: "VFW", desc: "Accredited service officers and veterans advocacy.", href: "https://www.vfw.org" },
];

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&#039;|&apos;/g, "'")
    .replace(/&#822[01];|&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
    .trim();

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : null;
}

export function parseRss(xml: string, org: string, limit = 6): FeedItem[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  return items.slice(0, limit).flatMap((block) => {
    const title = tag(block, "title");
    const link = tag(block, "link");
    if (!title || !link || !/^https:\/\//.test(link)) return [];
    const date = tag(block, "pubDate") ?? tag(block, "a10:updated");
    const parsed = date ? new Date(date) : null;
    return [{
      title,
      link,
      org,
      published: parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : null,
    }];
  });
}

/** Fetch every feed; a failing source is skipped, never fatal. Cached 1h. */
export async function getVeteranFeed(): Promise<{ items: FeedItem[]; failed: string[] }> {
  const failed: string[] = [];
  const results = await Promise.all(
    FEED_SOURCES.map(async (src) => {
      try {
        const res = await fetch(src.url, {
          next: { revalidate: 3600 },
          headers: { Accept: "application/rss+xml, application/xml" },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error(String(res.status));
        return parseRss(await res.text(), src.org);
      } catch {
        failed.push(src.org);
        return [];
      }
    }),
  );
  const items = results
    .flat()
    .sort((a, b) => (b.published ?? "").localeCompare(a.published ?? ""));
  return { items, failed };
}
