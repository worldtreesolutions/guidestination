import { supabase } from "@/integrations/supabase/client"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/integrations/supabase/types"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Create a safe supabase client that handles null checks
const getSupabaseClient = () => {
  if (!supabase) {
    console.error("Supabase client not initialized")
    return null
  }
  return supabase
}

export const stripeService = {
  async createCheckoutSession(
    activityId: number,
    participants: number,
    totalAmount: number,
    customerEmail: string,
    customerName: string,
    establishmentId?: string
  ) {
    const client = getSupabaseClient()
    if (!client) throw new Error("Database connection not available")

    const { data: activity, error } = await client
      .from("activities")
      .select("*")
      .eq("id", activityId)
      .single()

    if (error || !activity) {
      throw new Error("Activity not found")
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: activity.title,
              description: activity.description,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/cancelled`,
      customer_email: customerEmail,
      metadata: {
        activityId: activityId.toString(),
        participants: participants.toString(),
        customerName,
        establishmentId: establishmentId || "",
      },
    })

    return session
  },

  async createCommissionPaymentLink(
    invoiceId: string,
    amount: number,
    providerEmail: string,
    invoiceNumber: string
  ) {
    const client = getSupabaseClient()
    if (!client) throw new Error("Database connection not available")

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: `Commission Payment - Invoice ${invoiceNumber}`,
              description: `Payment for commission invoice ${invoiceNumber}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId,
        type: "commission_payment",
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/commission/payment-success?invoice_id=${invoiceId}`,
        },
      },
    })

    return paymentLink
  },

  async handleWebhookEvent(event: Stripe.Event) {
    const client = getSupabaseClient()
    if (!client) {
      console.error("Supabase client not available for webhook processing")
      return
    }

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
          break
        case "payment_intent.succeeded":
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }
    } catch (error) {
      console.error("Error handling webhook event:", error)
      throw error
    }
  },

  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const client = getSupabaseClient()
    if (!client) return

    const { activityId, participants, customerName, establishmentId } = session.metadata!

    try {
      const { data: booking, error: bookingError } = await client
        .from("bookings")
        .insert({
          activity_id: parseInt(activityId),
          customer_name: customerName,
          customer_email: session.customer_email!,
          participants: parseInt(participants),
          total_amount: session.amount_total! / 100,
          status: "confirmed",
          stripe_session_id: session.id,
          establishment_id: establishmentId || null,
          booking_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (bookingError) {
        console.error("Error creating booking:", bookingError)
        return
      }

      console.log("Booking created successfully:", booking.id)
    } catch (error) {
      console.error("Error in handleCheckoutSessionCompleted:", error)
    }
  },

  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const client = getSupabaseClient()
    if (!client) return

    console.log("Payment succeeded:", paymentIntent.id)
  },

  async retrieveSession(sessionId: string) {
    return await stripe.checkout.sessions.retrieve(sessionId)
  },

  async retrievePaymentIntent(paymentIntentId: string) {
    const client = getSupabaseClient()
    if (!client) throw new Error("Database connection not available")

    return await stripe.paymentIntents.retrieve(paymentIntentId)
  },

  async createRefund(paymentIntentId: string, amount?: number) {
    const client = getSupabaseClient()
    if (!client) throw new Error("Database connection not available")

    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    })
  },
}

export default stripeService
