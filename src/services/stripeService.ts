import Stripe from "stripe";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutSessionData, StripeCheckoutMetadata } from "@/types/stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const stripeService = {
  async createCheckoutSession(data: CheckoutSessionData): Promise<Stripe.Checkout.Session> {
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
    } = data;

    // Get provider's Stripe account ID
    const { data: provider, error: providerError } = await supabase
      .from("activity_owners")
      .select("stripe_account_id, stripe_charges_enabled")
      .eq("provider_id", providerId)
      .single();

    if (providerError || !provider?.stripe_account_id || !provider?.stripe_charges_enabled) {
      throw new Error("Provider Stripe account not configured or not enabled");
    }

    // Calculate amounts
    const totalAmount = Math.round(amount * 100); // Convert to cents
    const platformCommission = Math.round((totalAmount * commissionPercent) / 100);
    const providerAmount = totalAmount - platformCommission;

    const metadata: StripeCheckoutMetadata = {
      activity_id: activityId.toString(),
      provider_id: providerId,
      commission_percent: commissionPercent.toString(),
      participants: participants.toString(),
    };

    if (establishmentId) {
      metadata.establishment_id = establishmentId;
    }

    if (customerId) {
      metadata.customer_id = customerId;
    }

    // Create checkout session with Stripe Connect
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Activity Booking - ${participants} participant(s)`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      payment_intent_data: {
        application_fee_amount: platformCommission,
        transfer_data: {
          destination: provider.stripe_account_id,
        },
      },
    });

    // Store session in database
    await supabase.from("stripe_checkout_sessions").insert({
      stripe_session_id: session.id,
      activity_id: activityId,
      provider_id: providerId,
      establishment_id: establishmentId,
      customer_id: customerId,
      amount: amount,
      commission_percent: commissionPercent,
      status: "pending",
      metadata,
    });

    return session;
  },

  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const metadata = session.metadata as StripeCheckoutMetadata;
    
    if (!metadata) {
      throw new Error("No metadata found in checkout session");
    }

    // Update checkout session status
    const { error: updateError } = await supabase
      .from("stripe_checkout_sessions")
      .update({ status: "completed" })
      .eq("stripe_session_id", session.id);

    if (updateError) {
      throw new Error(`Failed to update checkout session: ${updateError.message}`);
    }

    // Create booking
    await this.createBooking(session, metadata);

    // Handle commission splitting
    await this.handleCommissionSplit(session, metadata);
  },

  async createBooking(session: Stripe.Checkout.Session, metadata: StripeCheckoutMetadata): Promise<void> {
    const bookingData = {
      activity_id: parseInt(metadata.activity_id),
      customer_id: metadata.customer_id || null,
      customer_name: session.customer_details?.name || "Guest",
      customer_email: session.customer_details?.email || "",
      customer_phone: session.customer_details?.phone || null,
      participants: parseInt(metadata.participants),
      total_amount: session.amount_total! / 100,
      status: "confirmed",
      booking_source: metadata.establishment_id ? "qr_code" : "direct",
      establishment_id: metadata.establishment_id || null,
    };

    const { error } = await supabase.from("bookings").insert(bookingData);

    if (error) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  },

  async handleCommissionSplit(session: Stripe.Checkout.Session, metadata: StripeCheckoutMetadata): Promise<void> {
    const totalAmount = session.amount_total! / 100;
    const commissionPercent = parseFloat(metadata.commission_percent);
    const platformCommission = (totalAmount * commissionPercent) / 100;

    // If establishment_id is present, split commission with partner
    if (metadata.establishment_id) {
      const partnerCommission = platformCommission * 0.5; // 50% of platform commission (10% of total)
      const guidestinationCommission = platformCommission * 0.5; // Remaining 50%

      // Get partner's Stripe account
      const { data: establishment } = await supabase
        .from("establishments")
        .select("partner_id")
        .eq("id", metadata.establishment_id)
        .single();

      if (establishment?.partner_id) {
        const { data: partner } = await supabase
          .from("partner_registrations")
          .select("stripe_account_id, stripe_charges_enabled")
          .eq("id", establishment.partner_id)
          .single();

        if (partner?.stripe_account_id && partner?.stripe_charges_enabled) {
          await this.transferToPartner(
            session.id,
            partner.stripe_account_id,
            establishment.partner_id,
            partnerCommission
          );
        }
      }

      // Record establishment commission
      await supabase.from("establishment_commissions").insert({
        establishment_id: metadata.establishment_id,
        booking_amount: totalAmount,
        commission_amount: partnerCommission,
        commission_status: "pending",
        booking_source: "qr_code",
      });
    }
  },

  async transferToPartner(
    sessionId: string,
    stripeAccountId: string,
    partnerId: string,
    amount: number
  ): Promise<void> {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        destination: stripeAccountId,
        description: `Commission payment for booking ${sessionId}`,
      });

      // Record transfer in database
      const { data: checkoutSession } = await supabase
        .from("stripe_checkout_sessions")
        .select("id")
        .eq("stripe_session_id", sessionId)
        .single();

      if (checkoutSession) {
        await supabase.from("stripe_transfers").insert({
          checkout_session_id: checkoutSession.id,
          stripe_transfer_id: transfer.id,
          recipient_type: "partner",
          recipient_id: partnerId,
          amount: amount,
          status: "completed",
        });
      }
    } catch (error) {
      console.error("Failed to transfer to partner:", error);
      
      // Record failed transfer
      const { data: checkoutSession } = await supabase
        .from("stripe_checkout_sessions")
        .select("id")
        .eq("stripe_session_id", sessionId)
        .single();

      if (checkoutSession) {
        await supabase.from("stripe_transfers").insert({
          checkout_session_id: checkoutSession.id,
          recipient_type: "partner",
          recipient_id: partnerId,
          amount: amount,
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  },

  async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.error("Payment failed:", paymentIntent.id, paymentIntent.last_payment_error);
    
    // Update checkout session status if exists
    if (paymentIntent.metadata?.checkout_session_id) {
      await supabase
        .from("stripe_checkout_sessions")
        .update({ status: "failed" })
        .eq("stripe_session_id", paymentIntent.metadata.checkout_session_id);
    }
  },

  async handleTransferFailed(transfer: Stripe.Transfer): Promise<void> {
    console.error("Transfer failed:", transfer.id, transfer.failure_message);
    
    // Update transfer status in database
    await supabase
      .from("stripe_transfers")
      .update({ 
        status: "failed",
        error_message: transfer.failure_message || "Transfer failed"
      })
      .eq("stripe_transfer_id", transfer.id);
  },

  async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    const accountId = account.id;
    
    // Update provider account status
    await supabase
      .from("activity_owners")
      .update({
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
      })
      .eq("stripe_account_id", accountId);

    // Update partner account status
    await supabase
      .from("partner_registrations")
      .update({
        stripe_charges_enabled: account.charges_enabled,
      })
      .eq("stripe_account_id", accountId);
  },

  async handleRefund(charge: Stripe.Charge): Promise<void> {
    console.log("Refund processed for charge:", charge.id);
    
    // Handle refund logic here if needed
    // This could include updating booking status, notifying users, etc.
  },

  async recordWebhookEvent(eventId: string, eventType: string, processed: boolean = false, errorMessage?: string): Promise<void> {
    await supabase.from("stripe_webhook_events").insert({
      stripe_event_id: eventId,
      event_type: eventType,
      processed,
      error_message: errorMessage,
    });
  },

  async isEventProcessed(eventId: string): Promise<boolean> {
    const { data } = await supabase
      .from("stripe_webhook_events")
      .select("processed")
      .eq("stripe_event_id", eventId)
      .single();

    return data?.processed || false;
  },

  async markEventProcessed(eventId: string): Promise<void> {
    await supabase
      .from("stripe_webhook_events")
      .update({ processed: true })
      .eq("stripe_event_id", eventId);
  },
};

export default stripeService;