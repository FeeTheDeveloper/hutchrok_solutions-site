import { NextRequest } from "next/server";
import Stripe from "stripe";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { getSupabaseServer } from "@/lib/supabase/server";
import { emitSiteSignal, isOsBridgeEnabled } from "@/lib/os/bridge";

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

  const isCheckoutPaidEvent = event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded";

  if (isCheckoutPaidEvent) {
    const session = event.data.object as Stripe.Checkout.Session;
    // A completed Checkout can still be awaiting a delayed payment method.
    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return apiSuccess({ received: true }, 200);
    }
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
            stripe_last_checkout_at: new Date(event.created * 1000).toISOString(),
          },
          { onConflict: "clerk_user_id" },
        );

      if (error) {
        console.error("[api/stripe/webhook] Profile sync failed:", error.message);
        return apiError(ErrorCode.INTERNAL_ERROR, "Payment recording is temporarily unavailable.", 503);
      }
    }
  }

  if (isCheckoutPaidEvent && isOsBridgeEnabled()) {
    const session = event.data.object as Stripe.Checkout.Session;
    const delivered = await emitSiteSignal({
      // A single checkout does not establish ongoing subscription entitlement.
      type: "payment.completed",
      signalId: `stripe:checkout:${session.id}:paid`,
      contact: {
        ...(session.customer_details?.email ? { email: session.customer_details.email } : {}),
        ...(session.customer_details?.name ? { name: session.customer_details.name } : {}),
      },
      entity: { type: "stripe_checkout_session", id: session.id },
      data: { mode: session.mode, service: session.metadata?.service_slug ?? null },
    });
    if (!delivered) return apiError(ErrorCode.INTERNAL_ERROR, "Payment delivery will be retried.", 503);
  } else if (isOsBridgeEnabled() && (event.type === "invoice.payment_failed" || event.type === "checkout.session.async_payment_failed")) {
    const delivered = await emitSiteSignal({
      type: "payment.failed",
      signalId: `stripe:${event.id}`,
      entity: { type: "stripe_event", id: event.id },
      data: { stripe_event_type: event.type },
    });
    if (!delivered) return apiError(ErrorCode.INTERNAL_ERROR, "Payment delivery will be retried.", 503);
  }

  return apiSuccess({ received: true }, 200);
}
