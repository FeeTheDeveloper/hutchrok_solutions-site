import { NextRequest } from "next/server";
import Stripe from "stripe";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Stripe webhook is not configured. Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.",
      500,
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return apiError(ErrorCode.BAD_REQUEST, "Missing Stripe signature header.", 400);
  }

  const payload = await request.text();
  const stripe = new Stripe(stripeSecretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid Stripe webhook signature.";
    console.error("[api/stripe/webhook] Signature verification failed:", message);
    return apiError(ErrorCode.BAD_REQUEST, "Invalid Stripe webhook signature.", 400);
  }

  console.log("[api/stripe/webhook] Event received:", event.id, event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkUserId = session.metadata?.clerk_user_id ?? "";
    const customerId =
      typeof session.customer === "string" ? session.customer : null;
    const customerEmail =
      session.customer_details?.email || session.metadata?.account_email || "";

    if (clerkUserId && customerId && customerEmail) {
      const supabase = getSupabaseServer();
      const { error } = await supabase
        .from("client_profiles")
        .upsert(
          {
            clerk_user_id: clerkUserId,
            email: customerEmail,
            stripe_customer_id: customerId,
            stripe_last_checkout_at: new Date().toISOString(),
          },
          { onConflict: "clerk_user_id" },
        );

      if (error) {
        console.error("[api/stripe/webhook] Profile sync failed:", error.message);
      }
    }
  }

  return apiSuccess({ received: true }, 200);
}
