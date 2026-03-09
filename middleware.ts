import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin", "/admin(.*)"]);

/**
 * Unified auth middleware:
 * - Clerk session protection for `/dashboard` and all nested dashboard routes.
 * - Existing admin token protection for `/admin` routes.
 */
export default clerkMiddleware(async (auth, request) => {
  if (isDashboardRoute(request)) {
    await auth.protect();
  }

  if (isAdminRoute(request)) {
    // Keep current admin token flow intact until Clerk RBAC migration is complete.
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.nextUrl.searchParams.get("token");

    const expected = process.env.ADMIN_TOKEN;

    if (!token || !expected || token !== expected) {
      return new NextResponse(
        `<!DOCTYPE html>
<html><head><title>Unauthorized</title></head>
<body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0A1628;color:#FAF8F5">
<div style="text-align:center">
<h1 style="color:#C8A951">Unauthorized</h1>
<p>A valid admin token is required to access this page.</p>
</div></body></html>`,
        {
          status: 401,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        },
      );
    }

    // TODO(auth-rbac): Replace token-only admin gate with Clerk role check (`admin`) while preserving API hardening.
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*"],
};
