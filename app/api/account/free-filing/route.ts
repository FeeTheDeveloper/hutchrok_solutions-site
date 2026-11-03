import { auth, currentUser } from "@clerk/nextjs/server";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import {
  FreeFilingError,
  getOrCreateEntitlement,
  redeemEntitlement,
} from "@/lib/free-filing";
import { emitSiteSignal } from "@/lib/os/bridge";

async function identity() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const primary = user?.primaryEmailAddress;
  // Only a Clerk-verified email can hold the benefit.
  if (!primary || primary.verification?.status !== "verified") return null;
  return { userId, email: primary.emailAddress, name: user?.fullName ?? "" };
}

/** GET: return (creating on first visit) this account's free-filing entitlement. */
export async function GET() {
  const id = await identity();
  if (!id) {
    return apiError(ErrorCode.UNAUTHORIZED, "Sign in with a verified email to view your free filing.", 401);
  }
  try {
    const entitlement = await getOrCreateEntitlement({ clerkUserId: id.userId, email: id.email });
    if (entitlement.status === "PENDING_VERIFICATION") {
      await emitSiteSignal({
        type: "free_filing.requested",
        signalId: `free_filing.requested:${id.userId}`,
        contact: { name: id.name, email: id.email },
        entity: { type: "free_filing_entitlement", id: entitlement.id },
      }).catch(() => undefined);
    }
    return apiSuccess({ entitlement });
  } catch (e) {
    if (e instanceof FreeFilingError) return apiError(ErrorCode.VALIDATION_ERROR, e.message, 409);
    console.error("[api/account/free-filing] GET failed:", e instanceof Error ? e.message : e);
    return apiError(ErrorCode.INTERNAL_ERROR, "Could not load your free filing.", 500);
  }
}

/** POST: redeem the verified free filing (single use per account). */
export async function POST() {
  const id = await identity();
  if (!id) {
    return apiError(ErrorCode.UNAUTHORIZED, "Sign in with a verified email to claim your free filing.", 401);
  }
  try {
    const entitlement = await redeemEntitlement(id.userId);
    await emitSiteSignal({
      type: "free_filing.redeemed",
      signalId: `free_filing.redeemed:${id.userId}`,
      contact: { name: id.name, email: id.email },
      entity: { type: "free_filing_entitlement", id: entitlement.id },
    }).catch(() => undefined);
    return apiSuccess({ entitlement, next: "/free-filing#intake" });
  } catch (e) {
    if (e instanceof FreeFilingError) return apiError(ErrorCode.VALIDATION_ERROR, e.message, 409);
    console.error("[api/account/free-filing] POST failed:", e instanceof Error ? e.message : e);
    return apiError(ErrorCode.INTERNAL_ERROR, "Could not claim your free filing.", 500);
  }
}
