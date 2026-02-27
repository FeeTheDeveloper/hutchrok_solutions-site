import { NextRequest } from "next/server";

/**
 * Validate the OPS_TOKEN header on inbound ops integration requests.
 * Power Automate (or any external caller) must send:
 *   X-Ops-Token: <value of OPS_TOKEN env var>
 */
export function isOpsAuthorized(request: NextRequest): boolean {
  const header = request.headers.get("x-ops-token");
  const expected = process.env.OPS_TOKEN;
  return !!header && !!expected && header === expected;
}
