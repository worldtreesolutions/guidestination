import Stripe from "stripe";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutSessionData, StripeCheckoutMetadata, StripeFeesCalculation } from "@/types/stripe";
import { Database, Json } from "@/integrations/supabase/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export const stripeService = {
  calculateStripeFees(baseAmount: number): StripeFeesCalculation {
    const stripeFeePercent = 0.029;
    const stripeFeeFixed = 0.30;
    const stripeFee = (baseAmount * stripeFeePercent) + stripeFeeFixed;
    const totalAmount = baseAmount + stripeFee;
    return {
      baseAmount,
      stripeFee,
      totalAmount,
      platformCommission: 0,
      providerAmount: 0,
      guidestinationCommission: 0,
    };
  },

  calculateCommissionWithFees(
    baseAmount: number,
    commissionPercent: number,
    hasEstablishment: boolean = false
  ): StripeFeesCalculation {
    const fees = this.calculateStripeFees(baseAmount);
    const platformCommission = (baseAmount * commissionPercent) / 100;
    const providerAmount = baseAmount - platformCommission;
    let partnerCommission = 0;
    let guidestinationCommission = platformCommission;
    if (hasEstablishment) {
      partnerCommission = platformCommission * 0.5;
      guidestinationCommission = platformCommission * 0.5;
    }
    return {
      ...fees,
      platformCommission,
      providerAmount,
      partnerCommission: hasEstablishment ? partnerCommission : undefined,
      guidestinationCommission,
    };
  },

  async createCheckoutSession(data: CheckoutSessionData): Promise<Stripe.Checkout.Session> {
    const {
      activityId,
      providerId,
      establishmentId,
      customerId,
      amount: baseAmount,
      participants,
      commissionPercent = 20,
      successUrl,
      cancelUrl,
    } = data;

    const { data: provider, error: providerError } = await supabase
      .from("activity_owners")
      .select("stripe_account_id, stripe_charges_enabled")
      .eq("provider_id", providerId)
      .single();

    if (providerError || !provider?.stripe_account_id || !provider.stripe_charges_enabled) {
      throw new Error("Provider Stripe account not configured or not enabled for charges.");
    }

    const calculation = this.calculateCommissionWithFees(baseAmount, commissionPercent, !!establishmentId);
    const totalAmountCents = Math.round(calculation.totalAmount * 100);
    const platformCommissionCents = Math.round(calculation.platformCommission * 100);

    const metadata: Stripe.MetadataParam = {
      activity_id: activityId.toString(),
      provider_id: providerId,
      commission_percent: commissionPercent.toString(),
      participants: participants.toString(),
      base_amount: baseAmount.toString(),
      stripe_fee: calculation.stripeFee.toString(),
    };

    if (establishmentId) {
      metadata.establishment_id = establishmentId;
    }
    if (customerId) {
      metadata.customer_id = customerId;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Activity Booking - ${participants} participant(s)`,
            description: `Base amount: $${baseAmount.toFixed(2)} + Processing fee: $${calculation.stripeFee.toFixed(2)}`,
          },
          unit_amount: totalAmountCents,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      payment_intent_data: {
        application_fee_amount: platformCommissionCents,
        transfer_data: {
          destination: provider.stripe_account_id,
        },
      },
    });

    await supabase.from("stripe_checkout_sessions").insert({
      stripe_session_id: session.id,
      activity_id: Number(activityId),
      provider_id: providerId,
      establishment_id: establishmentId,
      customer_id: customerId,
      amount: calculation.totalAmount,
      commission_percent: commissionPercent,
      status: "pending",
      meta: metadata as unknown as Json,
    });

    return session;
  },

  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const metadata = session.metadata as StripeCheckoutMetadata | null;
    if (!metadata) throw new Error("No metadata found in checkout session");

    await supabase
      .from("stripe_checkout_sessions")
      .update({ status: "completed" })
      .eq("stripe_session_id", session.id);

    await this.createBooking(session, metadata);
    await this.handleCommissionSplit(session, metadata);
  },

  async createBooking(session: Stripe.Checkout.Session, metadata: StripeCheckoutMetadata): Promise<void> {
    const bookingData: Database['public']['Tables']['bookings']['Insert'] = {
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
      booking_date: new Date().toISOString(),
    };
    const { error } = await supabase.from("bookings").insert(bookingData);
    if (error) throw new Error(`Failed to create booking: ${error.message}`);
  },

  async handleCommissionSplit(session: Stripe.Checkout.Session, metadata: StripeCheckoutMetadata): Promise<void> {
    const baseAmount = parseFloat(metadata.base_amount);
    const commissionPercent = parseFloat(metadata.commission_percent);
    const platformCommission = (baseAmount * commissionPercent) / 100;
    const providerAmount = baseAmount - platformCommission;

    await this.trackProviderPayout(metadata.provider_id, providerAmount, session.id);

    if (metadata.establishment_id) {
      const partnerCommission = platformCommission * 0.5;
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

        if (partner?.stripe_account_id && partner.stripe_charges_enabled) {
          await this.transferToPartner(session.id, partner.stripe_account_id, establishment.partner_id, partnerCommission);
        }
      }

      await supabase.from("establishment_commissions").insert({
        establishment_id: metadata.establishment_id,
        activity_id: parseInt(metadata.activity_id),
        customer_id: metadata.customer_id || "guest",
        booking_amount: baseAmount,
        commission_amount: partnerCommission,
        commission_status: "pending",
        booking_source: "qr_code",
      });
    }
  },

  async trackProviderPayout(providerId: string, amount: number, sessionId: string): Promise<void> {
    await supabase.from("stripe_payouts").insert({
      activity_owner_id: providerId,
      recipient_type: "activity_owner",
      stripe_payout_id: `pending_${sessionId}_${Date.now()}`,
      amount: amount,
      currency: "usd",
      status: "pending",
    });
  },

  async transferToPartner(sessionId: string, stripeAccountId: string, partnerId: string, amount: number): Promise<void> {
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        destination: stripeAccountId,
        description: `Commission payment for booking ${sessionId}`,
      });

      const { data: checkoutSession } = await supabase.from("stripe_checkout_sessions").select("id").eq("stripe_session_id", sessionId).single();
      if (checkoutSession) {
        await supabase.from("stripe_transfers").insert({
          checkout_session_id: checkoutSession.id,
          stripe_transfer_id: transfer.id,
          recipient_type: "partner",
          recipient_id: partnerId,
          amount: amount,
          status: "completed",
        });
        await supabase.from("stripe_payouts").insert({
          partner_id: partnerId,
          recipient_type: "partner",
          stripe_payout_id: transfer.id,
          amount: amount,
          currency: "usd",
          status: "paid",
          arrival_date: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to transfer to partner:", error);
      const { data: checkoutSession } = await supabase.from("stripe_checkout_sessions").select("id").eq("stripe_session_id", sessionId).single();
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
    if (paymentIntent.metadata?.checkout_session_id) {
      await supabase
        .from("stripe_checkout_sessions")
        .update({ status: "failed" })
        .eq("stripe_session_id", paymentIntent.metadata.checkout_session_id);
    }
  },

  async handleTransferFailed(transfer: Stripe.Transfer): Promise<void> {
    await supabase
      .from("stripe_transfers")
      .update({ status: "failed", error_message: "Transfer failed" })
      .eq("stripe_transfer_id", transfer.id);
  },

  async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    await supabase
      .from("activity_owners")
      .update({ stripe_charges_enabled: account.charges_enabled, stripe_payouts_enabled: account.payouts_enabled })
      .eq("stripe_account_id", account.id);
    await supabase
      .from("partner_registrations")
      .update({ stripe_charges_enabled: account.charges_enabled })
      .eq("stripe_account_id", account.id);
  },

  async handlePayoutPaid(payout: Stripe.Payout): Promise<void> {
    await supabase
      .from("stripe_payouts")
      .update({ status: "paid", arrival_date: new Date(payout.arrival_date * 1000).toISOString() })
      .eq("stripe_payout_id", payout.id);
  },

  async handlePayoutFailed(payout: Stripe.Payout): Promise<void> {
    await supabase
      .from("stripe_payouts")
      .update({ status: "failed" })
      .eq("stripe_payout_id", payout.id);
  },

  async handleRefund(charge: Stripe.Charge): Promise<void> {
    console.log("Refund processed for charge:", charge.id);
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
    const { data } = await supabase.from("stripe_webhook_events").select("processed").eq("stripe_event_id", eventId).single();
    return data?.processed || false;
  },

  async markEventProcessed(eventId: string): Promise<void> {
    await supabase.from("stripe_webhook_events").update({ processed: true }).eq("stripe_event_id", eventId);
  },

  async getActivityOwnerPayouts(providerId: string): Promise<any[]> {
    const { data, error } = await supabase.from("stripe_payouts").select("*").eq("activity_owner_id", providerId).order("created_at", { ascending: false });
    if (error) return [];
    return data || [];
  },

  async getPartnerPayouts(partnerId: string): Promise<any[]> {
    const { data, error } = await supabase.from("stripe_payouts").select("*").eq("partner_id", partnerId).order("created_at", { ascending: false });
    if (error) return [];
    return data || [];
  },

  async getAllPayouts(): Promise<any[]> {
    const { data, error } = await supabase.from("stripe_payouts").select("*, activity_owners:activity_owner_id(business_name, owner_name), partner_registrations:partner_id(business_name, owner_name)").order("created_at", { ascending: false });
    if (error) return [];
    return data || [];
  },
};

export default stripeService;
