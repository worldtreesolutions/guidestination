import { NextApiRequest, NextApiResponse } from "next"
import Stripe from "stripe"
import { buffer } from "micro"
import { getAdminClient } from "@/integrations/supabase/admin"
import stripeService from "@/services/stripeService"
import { Json } from "@/integrations/supabase/types"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const config = {
  api: {
    bodyParser: false,
  },
}

const supabase = getAdminClient()

const recordStripeEvent = async (event: Stripe.Event) => {
  if (!supabase) {
    console.error("Supabase client not initialized for recording Stripe event.")
    return
  }
  try {
    console.log(`Stripe event received: ${event.type} - ${event.id}`)
  } catch (error) {
    console.error("Error recording Stripe event:", error)
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const buf = await buffer(req)
    const sig = req.headers["stripe-signature"]

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(buf, sig!, webhookSecret)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      res.status(400).send(`Webhook Error: ${errorMessage}`)
      return
    }

    if (!supabase) {
      console.error("Supabase client not initialized.")
      return res.status(500).json({ error: "Internal server error" })
    }

    await recordStripeEvent(event)

    try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session
          await stripeService.handleCheckoutSessionCompleted(session)
          break

        case "checkout.session.async_payment_succeeded":
          const asyncPaymentSession = event.data.object as Stripe.Checkout.Session
          await stripeService.handleCheckoutSessionCompleted(asyncPaymentSession)
          break

        case "checkout.session.async_payment_failed":
          const failedSession = event.data.object as Stripe.Checkout.Session
          if (failedSession.metadata?.bookingId) {
            console.log(`Payment failed for session: ${failedSession.id}`)
          }
          break

        case "account.updated":
          console.log("Account updated:", event.data.object)
          break
        case "payout.paid":
          console.log("Payout paid:", event.data.object)
          break
        case "payout.failed":
          console.log("Payout failed:", event.data.object)
          break

        case "transfer.created":
        case "transfer.updated":
        case "transfer.reversed":
          console.log(`Received transfer event: ${event.type}`);
          break;

        default:
          console.warn(`Unhandled event type: ${event.type}`)
      }
      res.json({ received: true })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      console.error(`Webhook handler error for event ${event.id}:`, errorMessage)
      res.status(500).json({ error: "Webhook handler failed" })
    }
  } else {
    res.setHeader("Allow", "POST")
    res.status(405).end("Method Not Allowed")
  }
}

export default handler
