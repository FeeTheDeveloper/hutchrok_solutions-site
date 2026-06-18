import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure the fillable SOS form templates are bundled with the serverless
  // functions that read them at runtime (e.g. /api/filings/document).
  outputFileTracingIncludes: {
    "/api/filings/**": ["./docs/filings/**"],
  },
};

export default nextConfig;
