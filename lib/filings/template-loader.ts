/**
 * Loads a filing template PDF from `public/filings/`.
 *
 * Templates are fetched same-origin (rather than read via node:fs) so this
 * works identically on Cloudflare Workers — which have no real filesystem —
 * and in local/Node environments.
 */
export async function readFilingTemplate(
  filename: string,
  origin: string,
): Promise<Uint8Array> {
  const res = await fetch(new URL(`/filings/${filename}`, origin));
  if (!res.ok) {
    throw new Error(`Failed to load filing template "${filename}" (${res.status})`);
  }
  return new Uint8Array(await res.arrayBuffer());
}
