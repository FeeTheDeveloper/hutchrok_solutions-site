import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { apiError, ErrorCode } from "@/lib/api-response";

/**
 * Agent administration requires a bearer token. The legacy admin query-string
 * token remains available elsewhere in the application, but agent prompts,
 * outputs, and approvals must not be accessed through URLs containing secrets.
 */
export function requireAgentAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return apiError(
      ErrorCode.UNAUTHORIZED,
      "Agent administration requires an Authorization: Bearer header.",
      401,
    );
  }

  return requireAdmin(request);
}
