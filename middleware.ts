import { NextRequest, NextResponse } from "next/server";

/**
 * Edge middleware — runs before page/route handlers.
 *
 * Protects /admin/* pages from loading without a valid token.
 * The actual token validation still happens in API routes (defense-in-depth),
 * but this prevents the admin UI from rendering at all without credentials.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect admin UI routes (not API routes — those have their own guards)
  if (pathname.startsWith("/admin")) {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.nextUrl.searchParams.get("token");

    const expected = process.env.ADMIN_TOKEN;

    if (!token || !expected || token !== expected) {
      // Return a minimal 401 page instead of loading the admin UI
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
  }

  return NextResponse.next();
}

export const config = {
  // Only run on admin UI pages, never on API routes or static files
  matcher: ["/admin", "/admin/:path*"],
};
