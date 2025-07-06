import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripeService } from "@/services/stripeService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

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

    const sig = req.headers["stripe-signature"] as string;
    let event: any;

    try {
      const body = await getRawBody(req);
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
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
    await stripeService.recordWebhookEvent(event.id, event.type);

    try {
      // Process different event types
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object;
          console.log("Processing checkout.session.completed:", session.id);
          await stripeService.handleCheckoutCompleted(session);
          break;

        case "payment_intent.payment_failed":
          const paymentIntent = event.data.object;
          console.log("Processing payment_intent.payment_failed:", paymentIntent.id);
          await stripeService.handlePaymentFailed(paymentIntent);
          break;

        case "transfer.failed":
          const transfer = event.data.object;
          console.log("Processing transfer.failed:", transfer.id);
          await stripeService.handleTransferFailed(transfer);
          break;

        case "account.updated":
          const account = event.data.object;
          console.log("Processing account.updated:", account.id);
          await stripeService.handleAccountUpdated(account);
          break;

        case "payout.paid":
          const paidPayout = event.data.object;
          console.log("Processing payout.paid:", paidPayout.id);
          await stripeService.handlePayoutPaid(paidPayout);
          break;

        case "payout.failed":
          const failedPayout = event.data.object;
          console.log("Processing payout.failed:", failedPayout.id);
          await stripeService.handlePayoutFailed(failedPayout);
          break;

        case "charge.refunded":
          const charge = event.data.object;
          console.log("Processing charge.refunded:", charge.id);
          await stripeService.handleRefund(charge);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Mark event as processed
      await stripeService.markEventProcessed(event.id);

    } catch (processingError) {
      console.error(`Error processing event ${event.id}:`, processingError);
      
      // Record the error
      await stripeService.recordWebhookEvent(
        event.id, 
        event.type, 
        false, 
        processingError instanceof Error ? processingError.message : "Unknown processing error"
      );
      
      return res.status(500).json({ 
        error: "Event processing failed",
        eventId: event.id 
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook:`, error);
    res.status(500).json({ 
      error: "Webhook processing failed"
    });
  }
}
