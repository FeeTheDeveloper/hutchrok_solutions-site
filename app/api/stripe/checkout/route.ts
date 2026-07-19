import { NextRequest } from "next/server";
import Stripe from "stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { validateCheckoutCreate } from "@/lib/validation";
import { SERVICE_REQUEST_BY_SLUG } from "@/lib/paid-services";
import { getSupabaseServer } from "@/lib/supabase/server";

function toPriceEnvName(serviceSlug: string): string {
  return `STRIPE_PRICE_${serviceSlug.toUpperCase().replace(/-/g, "_")}`;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return apiError(ErrorCode.UNAUTHORIZED, "Sign in to start checkout.", 401);
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return apiError(ErrorCode.INTERNAL_ERROR, "Missing STRIPE_SECRET_KEY.", 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const validation = validateCheckoutCreate(body);
  if (!validation.success) {
    return apiError(
      ErrorCode.VALIDATION_ERROR,
      "Please select a service before checkout.",
      400,
      validation.fieldErrors,
    );
  }

  const serviceSlug = validation.data!.serviceSlug;
  const service = SERVICE_REQUEST_BY_SLUG[serviceSlug];
  if (!service) {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid service selected.", 400);
  }

  const priceEnv = toPriceEnvName(serviceSlug);
  const priceId = process.env[priceEnv];
  if (!priceId) {
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      `Missing price configuration for ${service.title}. Set ${priceEnv}.`,
      500,
    );
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || null;
  if (!email) {
    return apiError(ErrorCode.BAD_REQUEST, "Your account is missing an email address.", 400);
  }

  const stripe = new Stripe(stripeSecret);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: userId,
      customer_email: email || undefined,
      customer_creation: "always",
      success_url: `${request.nextUrl.origin}/dashboard?checkout=success`,
      cancel_url: `${request.nextUrl.origin}/dashboard?checkout=cancel`,
      metadata: {
        clerk_user_id: userId,
        service_slug: serviceSlug,
        account_email: email,
      },
    });

    if (!session.url) {
      return apiError(ErrorCode.INTERNAL_ERROR, "Failed to create checkout URL.", 500);
    }

    if (session.customer && typeof session.customer === "string") {
      const supabase = getSupabaseServer();
      const { error } = await supabase
        .from("client_profiles")
        .upsert(
          {
            clerk_user_id: userId,
            email,
            stripe_customer_id: session.customer,
            stripe_last_checkout_at: new Date().toISOString(),
          },
          { onConflict: "clerk_user_id" },
        );

      if (error) {
        console.error("[api/stripe/checkout] profile update failed:", error.message);
      }
    }

    return apiSuccess({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[api/stripe/checkout] create failed:", message);
    return apiError(ErrorCode.INTERNAL_ERROR, "Failed to create secure checkout session.", 500);
  }
}
