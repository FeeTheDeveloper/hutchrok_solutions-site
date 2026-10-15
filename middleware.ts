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

/**
 * Apex → www redirect. On Vercel this was a project-level domain redirect
 * (hutchrok.com → www.hutchrok.com, 308). Cloudflare Workers has no equivalent
 * project setting, so both hostnames hit this Worker and the redirect happens here.
 */
function apexRedirect(request: NextRequest): NextResponse | null {
  const host = (request.headers.get("host") ?? request.nextUrl.host)
    .split(":")[0]
    .toLowerCase();
  if (host !== "hutchrok.com") return null;

  const url = new URL(request.url);
  url.host = "www.hutchrok.com";
  url.protocol = "https:";
  url.port = "";
  return NextResponse.redirect(url, 308);
}

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
  const apex = apexRedirect(request);
  if (apex) return apex;

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
  const apex = apexRedirect(request);
  if (apex) return apex;

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
  // Must run on (almost) every request, including API routes — `auth()` and
  // `currentUser()` in route handlers throw unless clerkMiddleware() has
  // processed the request first. The isDashboardRoute/isAdminRoute checks
  // above still gate which routes actually get protected/redirected; this
  // matcher only controls where Clerk's auth context gets attached.
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
