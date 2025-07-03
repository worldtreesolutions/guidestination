import { NextApiRequest, NextApiResponse } from "next";

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

    // Import Stripe dynamically
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    });

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

    // Process different event types
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log("Processing checkout.session.completed:", session.id);
        console.log("Session metadata:", session.metadata);
        break;

      case "payment_intent.payment_failed":
        const paymentIntent = event.data.object;
        console.log("Processing payment_intent.payment_failed:", paymentIntent.id);
        break;

      case "charge.refunded":
        const charge = event.data.object;
        console.log("Processing charge.refunded:", charge.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook:`, error);
    res.status(500).json({ 
      error: "Webhook processing failed"
    });
  }
}
