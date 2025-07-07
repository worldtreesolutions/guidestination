
import { NextApiRequest, NextApiResponse } from "next";
import type { Stripe } from "stripe";
import stripeService from "@/services/stripeService";
import supabase from "@/integrations/supabase/admin";
import commissionService from "@/services/commissionService";

// Disable body parser for raw body access
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  
  return new Promise((resolve, reject) => {
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    
    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("Processing checkout session completed:", session.id);

  try {
    // Get booking details from metadata
    const bookingId = session.metadata?.booking_id;
    const activityId = session.metadata?.activity_id;
    const providerId = session.metadata?.provider_id;
    const establishmentId = session.metadata?.establishment_id;
    const isQrBooking = session.metadata?.is_qr_booking === "true";

    if (!bookingId || !activityId || !providerId) {
      console.error("Missing required metadata in checkout session");
      return;
    }

    // Update booking status
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        stripe_payment_intent_id: session.payment_intent as string,
        is_qr_booking: isQrBooking,
        qr_establishment_id: establishmentId || null,
      })
      .eq("id", parseInt(bookingId));

    if (bookingError) {
      console.error("Failed to update booking:", bookingError);
      return;
    }

    // Create commission invoice automatically
    await commissionService.createCommissionInvoice({
      bookingId: parseInt(bookingId),
      providerId,
      totalAmount: (session.amount_total || 0) / 100, // Convert from cents
      isQrBooking,
      establishmentId,
    });

    // Mark booking as having commission invoice generated
    await commissionService.markBookingCommissionGenerated(parseInt(bookingId));

    console.log(`Commission invoice created for booking ${bookingId}`);
  } catch (error) {
    console.error("Error processing checkout session:", error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ 
        error: "Stripe webhook is not configured. Please add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to your environment variables." 
      });
    }

    // Import Stripe dynamically
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });

    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      const body = await getRawBody(req);
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return res.status(400).json({ error: "Webhook signature verification failed" });
    }

    console.log(`Received webhook event: ${event.type}`);

    // Check if event was already processed
    const isProcessed = await stripeService.isEventProcessed(event.id);
    if (isProcessed) {
      console.log(`Event ${event.id} already processed, skipping`);
      return res.status(200).json({ received: true, message: "Event already processed" });
    }

    // Record the webhook event
    await stripeService.recordWebhookEvent(event.id, event.type, event.data.object);

    try {
      // Process different event types
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          console.log("Processing checkout.session.completed:", session.id);
          await stripeService.handleCheckoutCompleted(session);
          await handleCheckoutSessionCompleted(session);
          break;

        case "payment_intent.payment_failed":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log("Processing payment_intent.payment_failed:", paymentIntent.id);
          await stripeService.handlePaymentFailed(paymentIntent);
          break;

        case "transfer.failed":
          const transfer = event.data.object as Stripe.Transfer;
          console.log("Processing transfer.failed:", transfer.id);
          await stripeService.handleTransferFailed(transfer);
          break;

        case "account.updated":
          const account = event.data.object as Stripe.Account;
          console.log("Processing account.updated:", account.id);
          await stripeService.handleAccountUpdated(account);
          break;

        case "payout.paid":
          const paidPayout = event.data.object as Stripe.Payout;
          console.log("Processing payout.paid:", paidPayout.id);
          await stripeService.handlePayoutPaid(paidPayout);
          break;

        case "payout.failed":
          const failedPayout = event.data.object as Stripe.Payout;
          console.log("Processing payout.failed:", failedPayout.id);
          await stripeService.handlePayoutFailed(failedPayout);
          break;

        case "charge.refunded":
          const charge = event.data.object as Stripe.Charge;
          console.log("Processing charge.refunded:", charge.id);
          await stripeService.handleRefund(charge);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Mark event as processed
      await stripeService.markEventProcessed(event.id);

    } catch (processingError) {
      const errorMessage = processingError instanceof Error ? processingError.message : "Unknown processing error";
      console.error(`Error processing event ${event.id}:`, errorMessage);
      
      // Record the error
      await stripeService.recordWebhookError(event.id, errorMessage);
      
      return res.status(500).json({ 
        error: "Event processing failed",
        eventId: event.id 
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error processing webhook:`, errorMessage);
    res.status(500).json({ 
      error: "Webhook processing failed"
    });
  }
}
