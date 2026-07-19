import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin", "/admin(.*)"]);

const UNAUTHORIZED_HTML = `<!DOCTYPE html>
<html><head><title>Unauthorized</title></head>
<body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0A1628;color:#FAF8F5">
<div style="text-align:center">
<h1 style="color:#C8A951">Unauthorized</h1>
<p>A valid admin token is required to access this page.</p>
</div></body></html>`;

function adminTokenGuard(request: NextRequest): NextResponse | null {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.nextUrl.searchParams.get("token");

  const expected = process.env.ADMIN_TOKEN;

  if (!token || !expected || token !== expected) {
    return new NextResponse(UNAUTHORIZED_HTML, {
      status: 401,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return null;
}

/**
 * Unified auth middleware:
 * - Clerk session protection for `/dashboard` and all nested dashboard routes.
 * - Existing admin token protection for `/admin` routes.
 */
const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (isDashboardRoute(request)) {
    await auth.protect();
  }

  if (isAdminRoute(request)) {
    const deny = adminTokenGuard(request);
    if (deny) return deny;
  }

  return NextResponse.next();
});

function fallbackHandler(request: NextRequest) {
  if (isDashboardRoute(request)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdminRoute(request)) {
    const deny = adminTokenGuard(request);
    if (deny) return deny;
  }

  return NextResponse.next();
}

const CLERK_AVAILABLE = !!process.env.CLERK_SECRET_KEY;

export default CLERK_AVAILABLE ? clerkHandler : fallbackHandler;

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*"],
};
