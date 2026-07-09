import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// Needs the Node runtime + must never be statically cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Lightweight ops diagnostic. Reports whether required env vars are present
 * and whether the database is reachable — WITHOUT ever returning secret
 * values. Use it to confirm a deployment is wired to a live database.
 *
 *   { ok, env: { SUPABASE_URL: true, ... }, missingEnv: [...], db: {...} }
 */
export async function GET() {
  const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "ADMIN_TOKEN"] as const;

  const env: Record<string, boolean> = {};
  for (const key of required) env[key] = Boolean(process.env[key]);
  const missingEnv = required.filter((key) => !process.env[key]);

  let db: { reachable: boolean; error?: string } = { reachable: false };

  if (missingEnv.length === 0) {
    try {
      const supabase = getSupabaseServer();
      // HEAD count — cheapest possible round-trip that proves connectivity.
      const { error } = await supabase
        .from("intake_submissions")
        .select("id", { count: "exact", head: true });
      db = error ? { reachable: false, error: error.message } : { reachable: true };
    } catch (e) {
      db = { reachable: false, error: e instanceof Error ? e.message : "unknown error" };
    }
  }

  const ok = missingEnv.length === 0 && db.reachable;

  return NextResponse.json(
    { ok, env, missingEnv, db, checkedAt: new Date().toISOString() },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
