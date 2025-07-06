import { NextApiRequest, NextApiResponse } from "next";
import { CheckoutSessionData } from "@/types/stripe";
import { stripeService } from "@/services/stripeService";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2024-06-20",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." 
      });
    }

    const {
      activityId,
      providerId,
      establishmentId,
      customerId,
      amount,
      participants,
      commissionPercent = 20,
      successUrl,
      cancelUrl,
    }: CheckoutSessionData = req.body;

    // Validate required fields
    if (!activityId || !providerId || !amount || !participants || !successUrl || !cancelUrl) {
      return res.status(400).json({ 
        error: "Missing required fields: activityId, providerId, amount, participants, successUrl, cancelUrl" 
      });
    }

    // Calculate Stripe fees: 2.9% + $0.30 for US cards
    const stripeFeePercent = 0.029; // 2.9%
    const stripeFeeFixed = 0.30; // $0.30
    const stripeFee = (amount * stripeFeePercent) + stripeFeeFixed;
    const totalAmount = amount + stripeFee;

    // Convert to cents for Stripe
    const totalAmountCents = Math.round(totalAmount * 100);

    // Create metadata object with proper typing
    const metadata: Record<string, string> = {
      activity_id: activityId.toString(),
      provider_id: providerId,
      commission_percent: commissionPercent.toString(),
      participants: participants.toString(),
      base_amount: amount.toString(),
      stripe_fee: stripeFee.toString(),
    };

    if (establishmentId) {
      metadata.establishment_id = establishmentId;
    }

    if (customerId) {
      metadata.customer_id = customerId;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Activity Booking - ${participants} participant(s)`,
              description: `Base amount: $${amount.toFixed(2)} + Processing fee: $${stripeFee.toFixed(2)}`,
            },
            unit_amount: totalAmountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to create checkout session" 
    });
  }
}
