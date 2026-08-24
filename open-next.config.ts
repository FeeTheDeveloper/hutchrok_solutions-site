import type { OpenNextConfig } from "@opennextjs/aws/types/open-next.js";

const config: OpenNextConfig = {
  // Cloudflare Workers Builds always runs `npm run build`, and our "build"
  // script is `opennextjs-cloudflare build` (so a plain `npm run build`
  // produces the `.open-next/worker.js` entry point wrangler needs). This
  // adapter build step in turn needs to run the underlying Next.js build —
  // point it at `next build` directly instead of the default `npm run
  // build`, which would recurse back into this same adapter build.
  buildCommand: "npx next build",
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "direct",
    },
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "direct",
    },
  },
};

export default config;
