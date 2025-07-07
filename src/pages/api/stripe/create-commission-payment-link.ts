import { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { invoiceId, amount, currency, description, providerEmail } = req.body

      if (!invoiceId || !amount || !currency || !description) {
        return res.status(400).json({ error: "Missing required parameters" })
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: description,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/commission/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/commission`,
        customer_email: providerEmail,
        payment_intent_data: {
          metadata: {
            invoice_id: invoiceId,
          },
        },
        metadata: {
          invoice_id: invoiceId,
        }
      })

      if (!session.url) {
        return res.status(500).json({ error: "Could not create checkout session" })
      }

      return res.status(200).json({ paymentUrl: session.url })
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : "Internal server error"
      res.status(500).json({ error: errorMessage })
    }
  } else {
    res.setHeader("Allow", "POST")
    res.status(405).end("Method Not Allowed")
  }
}
