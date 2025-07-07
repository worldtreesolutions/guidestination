
import { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import { supabase } from "@/integrations/supabase/client";
import commissionService from "@/services/commissionService";
import invoiceService from "@/services/invoiceService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const endpointSecret = process.env.STRIPE_COMMISSION_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"]!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_link.payment_succeeded":
        await handlePaymentLinkPaymentSucceeded(event.data.object as Stripe.PaymentLink);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Log the webhook event
    await supabase.from("stripe_webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed: true,
      metadata: event.data.object,
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    // Log the failed webhook event
    await supabase.from("stripe_webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed: false,
      error_message: error instanceof Error ? error.message : "Unknown error",
      metadata: event.data.object,
    });

    res.status(500).json({ error: "Webhook processing failed" });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("Processing checkout session completed:", session.id);

  // Check if this is a booking payment (not commission payment)
  if (session.metadata?.type === "booking_payment") {
    const bookingId = parseInt(session.metadata.booking_id);
    const providerId = session.metadata.provider_id;
    const establishmentId = session.metadata.establishment_id;
    const isQrBooking = session.metadata.is_qr_booking === "true";

    // Update booking with payment details
    await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        stripe_payment_intent_id: session.payment_intent as string,
        is_qr_booking: isQrBooking,
        qr_establishment_id: establishmentId || null,
      })
      .eq("id", bookingId);

    // Create commission invoice
    await commissionService.createCommissionInvoice({
      bookingId,
      providerId,
      totalAmount: (session.amount_total || 0) / 100, // Convert from cents
      isQrBooking,
      establishmentId,
    });

    // Mark booking as having commission invoice generated
    await commissionService.markBookingCommissionGenerated(bookingId);
  }
}

async function handlePaymentLinkPaymentSucceeded(paymentLink: Stripe.PaymentLink) {
  console.log("Processing payment link payment succeeded:", paymentLink.id);

  // This handles commission payments via payment links
  if (paymentLink.metadata?.type === "commission_payment") {
    const invoiceId = paymentLink.metadata.invoice_id;
    
    // Get the latest payment intent for this payment link
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 1,
      metadata: { payment_link_id: paymentLink.id },
    });

    if (paymentIntents.data.length > 0) {
      const paymentIntent = paymentIntents.data[0];
      
      await invoiceService.processCommissionPayment({
        invoiceId,
        paymentAmount: paymentIntent.amount / 100, // Convert from cents
        paymentMethod: "stripe_payment_link",
        stripePaymentIntentId: paymentIntent.id,
        paymentReference: paymentIntent.id,
      });
    }
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Processing payment intent succeeded:", paymentIntent.id);

  // Handle commission payments
  if (paymentIntent.metadata?.type === "commission_payment") {
    const invoiceId = paymentIntent.metadata.invoice_id;

    await invoiceService.processCommissionPayment({
      invoiceId,
      paymentAmount: paymentIntent.amount / 100, // Convert from cents
      paymentMethod: "stripe_payment_link",
      stripePaymentIntentId: paymentIntent.id,
      paymentReference: paymentIntent.id,
    });
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log("Processing payment intent failed:", paymentIntent.id);

  // Handle failed commission payments
  if (paymentIntent.metadata?.type === "commission_payment") {
    const invoiceId = paymentIntent.metadata.invoice_id;

    // Log the failed payment attempt
    await supabase.from("commission_payments").insert({
      invoice_id: invoiceId,
      payment_amount: paymentIntent.amount / 100,
      payment_method: "stripe_payment_link",
      stripe_payment_intent_id: paymentIntent.id,
      payment_status: "failed",
    });
  }
}
