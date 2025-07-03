import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import stripeService from "@/services/stripeService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    const body = JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  // Check if event has already been processed
  const isProcessed = await stripeService.isEventProcessed(event.id);
  if (isProcessed) {
    console.log(`Event ${event.id} already processed, skipping`);
    return res.status(200).json({ received: true, message: "Event already processed" });
  }

  // Record the webhook event
  await stripeService.recordWebhookEvent(event.id, event.type);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Processing checkout.session.completed:", session.id);
        await stripeService.handleCheckoutCompleted(session);
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

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook event ${event.id}:`, error);
    
    // Record error in webhook event
    await stripeService.recordWebhookEvent(
      event.id, 
      event.type, 
      false, 
      error instanceof Error ? error.message : "Unknown error"
    );

    res.status(500).json({ 
      error: "Webhook processing failed",
      eventId: event.id 
    });
  }
}