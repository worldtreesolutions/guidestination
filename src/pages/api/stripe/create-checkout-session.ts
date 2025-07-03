import { NextApiRequest, NextApiResponse } from "next";
import stripeService from "@/services/stripeService";
import { CheckoutSessionData } from "@/types/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      activityId,
      providerId,
      establishmentId,
      customerId,
      amount,
      participants,
      commissionPercent,
      successUrl,
      cancelUrl,
    }: CheckoutSessionData = req.body;

    // Validate required fields
    if (!activityId || !providerId || !amount || !participants || !successUrl || !cancelUrl) {
      return res.status(400).json({ 
        error: "Missing required fields: activityId, providerId, amount, participants, successUrl, cancelUrl" 
      });
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession({
      activityId,
      providerId,
      establishmentId,
      customerId,
      amount,
      participants,
      commissionPercent,
      successUrl,
      cancelUrl,
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