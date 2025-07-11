import { supabase } from "@/integrations/supabase/client"
import { getAdminClient, getAdminClientSafe } from "@/integrations/supabase/admin"
import type { Database } from "@/integrations/supabase/types"
import emailService from "./emailService"
import type Stripe from "stripe"

// This function ensures Stripe is only initialized on the server-side when needed.
const getStripe = (): Stripe | null => {
  if (typeof window !== "undefined") {
    // This is client-side, so don't initialize Stripe
    return null
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not set in the environment.")
    return null
  }
  // Dynamically require Stripe to avoid bundling it on the client
  const StripeConstructor = require("stripe")
  return new StripeConstructor(process.env.STRIPE_SECRET_KEY)
}

// Create a safe supabase client that handles null checks
const getSupabaseClient = () => {
  if (!supabase) {
    console.error("Supabase client not initialized")
    return null
  }
  return supabase
}

// Get admin client for webhook operations - use safe version
const getAdminSupabaseClient = () => {
  const adminClient = getAdminClientSafe()
  if (!adminClient) {
    console.error("Supabase admin client not initialized")
    return null
  }
  return adminClient
}

export const stripeService = {
  // Client-side method to create checkout session via API
  async createCheckoutSession(checkoutData: {
    activityId: number;
    participants: number;
    totalAmount: number;
    customerEmail: string;
    customerName: string;
    selectedDate: string;
    establishmentId?: string;
  }) {
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutData),
    })

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create checkout session")
    }

    return response.json()
  },

  // Server-side method for API routes
  async createServerCheckoutSession(
    activityId: number,
    participants: number,
    totalAmount: number,
    customerEmail: string,
    customerName: string,
    establishmentId?: string
  ) {
    const stripe = getStripe()
    if (!stripe) {
      throw new Error("Stripe not initialized on server")
    }

    const client = getSupabaseClient()
    if (!client) throw new Error("Database connection not available")

    const {  activity, error } = await client
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
              description: activity.description ?? undefined,
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
    const stripe = getStripe()
    if (!stripe) {
      throw new Error("Stripe not initialized on server")
    }
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
      ] as any,
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
    const client = getAdminSupabaseClient()
    if (!client) {
      console.error("Supabase admin client not available for webhook processing")
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
    const client = getAdminSupabaseClient()
    if (!client) return

    const { activityId, participants, customerName, establishmentId } = session.metadata!

    try {
      // Create the booking
      const {  booking, error: bookingError } = await client
        .from("bookings")
        .insert({
          activity_id: parseInt(activityId),
          customer_name: customerName,
          participants: parseInt(participants),
          total_amount: session.amount_total! / 100,
          status: "confirmed",
          booking_date: new Date().toISOString(),
          user_id: "stripe_customer", // Default user for Stripe bookings
          provider_id: "default", // Will be updated based on activity
        })
        .select()
        .single()

      if (bookingError) {
        console.error("Error creating booking:", bookingError)
        return
      }

      console.log("Booking created successfully:", booking.id)

      // Process commission and send confirmation emails
      await this.processBookingConfirmation(booking, client)

    } catch (error) {
      console.error("Error in handleCheckoutSessionCompleted:", error)
    }
  },

  async processBookingConfirmation(booking: any, client: any) {
    try {
      // Get activity and owner details
      const {  activity, error: activityError } = await client
        .from("activities")
        .select(`
          *,
          activity_owners (
            id,
            email,
            business_name,
            provider_id
          )
        `)
        .eq("id", booking.activity_id)
        .single()

      if (activityError || !activity) {
        console.error("Error fetching activity details:", activityError)
        return
      }

      // Calculate platform commission (20%)
      const platformCommissionRate = 0.20
      const platformCommission = booking.total_amount * platformCommissionRate

      // Get establishment and partner details if booking was made through establishment
      let establishmentData = null
      let partnerData = null
      let partnerCommission = 0

      if (booking.establishment_id) {
        const {  establishment, error: establishmentError } = await client
          .from("establishments")
          .select(`
            *,
            partner_registrations (
              id,
              email,
              owner_name,
              business_name,
              commission_package
            )
          `)
          .eq("id", booking.establishment_id)
          .single()

        if (!establishmentError && establishment) {
          establishmentData = establishment
          partnerData = establishment.partner_registrations

          // Calculate partner commission based on package
          const partnerCommissionRate = partnerData.commission_package === "premium" ? 0.15 : 0.10
          partnerCommission = booking.total_amount * partnerCommissionRate

          // Create establishment commission record
          await client
            .from("establishment_commissions")
            .insert({
              establishment_id: booking.establishment_id,
              booking_id: booking.id,
              activity_id: booking.activity_id,
              commission_rate: partnerCommissionRate,
              booking_amount: booking.total_amount,
              commission_amount: partnerCommission,
              commission_status: "pending",
              booking_source: "website"
            })
        }
      }

      // Create commission invoice for activity owner
      const invoiceNumber = `INV-${Date.now()}-${booking.id}`
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30) // 30 days from now

      await client
        .from("commission_invoices")
        .insert({
          booking_id: booking.id,
          provider_id: activity.activity_owners.id,
          invoice_number: invoiceNumber,
          total_booking_amount: booking.total_amount,
          platform_commission_rate: platformCommissionRate,
          platform_commission_amount: platformCommission,
          partner_commission_rate: partnerCommission > 0 ? (partnerCommission / booking.total_amount) : null,
          partner_commission_amount: partnerCommission > 0 ? partnerCommission : null,
          establishment_id: booking.establishment_id,
          is_qr_booking: false,
          invoice_status: "pending",
          due_date: dueDate.toISOString()
        })

      // Update booking to mark commission invoice as generated
      await client
        .from("bookings")
        .update({ commission_invoice_generated: true })
        .eq("id", booking.id)

      // Prepare email data
      const emailData = {
        bookingId: booking.id,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email || "no-email@example.com",
        activityTitle: activity.title,
        activityDescription: activity.description,
        totalAmount: booking.total_amount,
        participants: booking.participants,
        bookingDate: booking.booking_date,
        activityOwnerEmail: activity.activity_owners.email,
        activityOwnerName: activity.activity_owners.business_name || "Activity Provider",
        platformCommission: platformCommission,
        partnerEmail: partnerData?.email,
        partnerName: partnerData?.owner_name,
        partnerCommission: partnerCommission > 0 ? partnerCommission : undefined,
        establishmentName: establishmentData?.name
      }

      // Send confirmation emails
      await emailService.sendBookingConfirmationEmails(emailData)

      console.log(`Booking confirmation process completed for booking ${booking.id}`)

    } catch (error) {
      console.error("Error processing booking confirmation:", error)
    }
  },

  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const client = getAdminSupabaseClient()
    if (!client) return

    console.log("Payment succeeded:", paymentIntent.id)
  },

  async retrieveSession(sessionId: string) {
    const stripe = getStripe()
    if (!stripe) {
      throw new Error("Stripe not available")
    }
    return await stripe.checkout.sessions.retrieve(sessionId)
  },

  async retrievePaymentIntent(paymentIntentId: string) {
    const stripe = getStripe()
    if (!stripe) {
      throw new Error("Stripe not available")
    }
    const client = getSupabaseClient()
    if (!client) throw new Error("Database connection not available")

    return await stripe.paymentIntents.retrieve(paymentIntentId)
  },

  async createRefund(paymentIntentId: string, amount?: number) {
    const stripe = getStripe()
    if (!stripe) {
      throw new Error("Stripe not available")
    }
    const client = getSupabaseClient()
    if (!client) throw new Error("Database connection not available")

    return await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    })
  },

  async createBooking(bookingDetails: any, userId: string) {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          ...bookingDetails,
          user_id: userId,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
    return data;
  },

  async updateBookingStatus(bookingId: string, status: string, paymentIntentId?: string) {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const {  booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*, activities(*)")
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      console.error("Error fetching booking:", bookingError);
      throw bookingError;
    }

    const { data, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: status,
      })
      .eq("id", bookingId)
      .select();

    if (updateError) {
      console.error("Error updating booking status:", updateError);
      throw updateError;
    }
    return data;
  },
}

export default stripeService
