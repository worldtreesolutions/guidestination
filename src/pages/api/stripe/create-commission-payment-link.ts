
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { invoiceId, amount, currency = "usd", description, metadata } = req.body;

    if (!invoiceId || !amount || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create Stripe Payment Link for commission payment
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: "Platform Commission Payment",
              description: description,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        metadata: {
          type: "commission_payment",
          invoice_id: invoiceId,
          ...metadata,
        },
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/commission/payment-success?invoice_id=${invoiceId}`,
        },
      },
    });

    res.status(200).json({
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: paymentLink.url,
    });
  } catch (error) {
    console.error("Error creating commission payment link:", error);
    res.status(500).json({ 
      error: "Failed to create payment link",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
