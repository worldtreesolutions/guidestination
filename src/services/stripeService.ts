
import Stripe from "stripe";
import { supabase } from "@/integrations/supabase/admin";
import type { Database, Tables, TablesInsert } from "@/integrations/supabase/types";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export type StripeCheckoutMetadata = {
  activity_id: string;
  provider_id: string;
  commission_percent: string;
  participants: string;
  booking_date: string;
  establishment_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  booking_source: string;
};

export const stripeService = {
  // Onboarding
  async createConnectAccount(userId: string, email: string, isPartner: boolean): Promise<string> {
    const account = await stripe.accounts.create({
      type: "express",
      email: email,
      meta {
        user_id: userId,
        user_type: isPartner ? "partner" : "activity_owner",
      },
    });

    const table = isPartner ? "partner_registrations" : "activity_owners";
    const { error } = await supabase
      .from(table)
      .update({ stripe_account_id: account.id })
      .eq("user_id", userId);

    if (error) {
      console.error("Failed to save stripe_account_id", error);
      throw new Error("Failed to save Stripe account ID.");
    }

    return account.id;
  },

  async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<string> {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });
    return accountLink.url;
  },

  async getAccountStatus(userId: string, isPartner: boolean): Promise<{ id: string; charges_enabled: boolean }> {
    const table = isPartner ? "partner_registrations" : "activity_owners";
    const { data, error } = await supabase
      .from(table)
      .select("stripe_account_id, stripe_charges_enabled")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error("Stripe account not found for user", error);
      throw new Error("Stripe account not found.");
    }
    
    return {
        id: data.stripe_account_id || "",
        charges_enabled: data.stripe_charges_enabled || false,
    };
  },

  // Checkout
  async createCheckoutSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    meta StripeCheckoutMetadata,
    providerAccountId: string,
    commissionPercent: number
  ) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancelled`,
      meta metadata,
      payment_intent_ {
        application_fee_amount: Math.round(lineItems[0].price_data!.unit_amount! * (commissionPercent / 100)),
        transfer_ {
          destination: providerAccountId,
        },
      },
    });

    const { error } = await supabase.from("stripe_checkout_sessions").insert({
      stripe_session_id: session.id,
      activity_id: parseInt(metadata.activity_id),
      provider_id: metadata.provider_id,
      amount: session.amount_total || 0,
      commission_percent: commissionPercent,
      status: "open",
      participants: parseInt(metadata.participants),
      booking_date: metadata.booking_date,
      customer_email: metadata.customer_email,
      customer_name: metadata.customer_name,
      customer_phone: metadata.customer_phone,
      establishment_id: metadata.establishment_id,
      booking_source: metadata.booking_source,
    });

    if (error) {
      console.error("Error inserting checkout session:", error);
    }

    return session;
  },

  async getCheckoutSession(sessionId: string) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata as StripeCheckoutMetadata | null;

    if (!metadata) {
      throw new Error("Session metadata not found");
    }

    const { data, error } = await supabase
      .from("stripe_checkout_sessions")
      .update({ status: session.payment_status })
      .eq("stripe_session_id", sessionId);

    if (error) {
      console.error("Error updating checkout session status:", error);
    }

    return { session, metadata };
  },

  // Webhooks & Post-payment processing
  constructWebhookEvent(body: Buffer, signature: string): Stripe.Event {
    return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  },

  async handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
    const metadata = session.metadata as StripeCheckoutMetadata | null;
    if (!metadata) throw new Error("Missing metadata in checkout session");

    const bookingData: TablesInsert<"bookings"> = {
      activity_id: parseInt(metadata.activity_id),
      customer_id: null, // Or link to a customer profile if one exists/is created
      customer_name: metadata.customer_name,
      customer_email: metadata.customer_email,
      booking_date: metadata.booking_date,
      participants: parseInt(metadata.participants),
      total_amount: session.amount_total! / 100,
      status: "confirmed",
    };

    const {  booking, error: bookingError } = await supabase
      .from("bookings")
      .insert(bookingData)
      .select()
      .single();

    if (bookingError || !booking) {
      console.error("Error creating booking:", bookingError);
      throw new Error("Failed to create booking.");
    }

    // Update checkout session status
    await supabase
      .from("stripe_checkout_sessions")
      .update({ status: "complete" })
      .eq("stripe_session_id", session.id);

    // Handle commission for partners if applicable
    if (metadata.establishment_id) {
      const partner = await this.getPartnerForEstablishment(metadata.establishment_id);
      if (partner?.stripe_account_id && partner.stripe_charges_enabled) {
        const commissionAmount = (session.amount_total! / 100) * (partner.commission_rate / 100);
        
        // This transfer is illustrative. In a real scenario, you might accumulate commissions
        // and pay them out periodically. Direct transfers from charges are complex.
        // For now, we'll log the commission.
        await supabase.from("establishment_commissions").insert({
            establishment_id: metadata.establishment_id,
            booking_id: booking.id,
            commission_amount: commissionAmount,
        });
      }
    }
  },

  async getPartnerForEstablishment(establishmentId: string) {
    const { data, error } = await supabase
      .from("establishments")
      .select(`
        partner_registrations (
          stripe_account_id,
          stripe_charges_enabled,
          commission_package
        )
      `)
      .eq("id", establishmentId)
      .single();

    if (error || !data || !data.partner_registrations) return null;

    const commissionRate = data.partner_registrations.commission_package === "premium" ? 15 : 10;

    return {
      stripe_account_id: data.partner_registrations.stripe_account_id,
      stripe_charges_enabled: data.partner_registrations.stripe_charges_enabled,
      commission_rate: commissionRate,
    };
  },

  async handleTransfer(transfer: Stripe.Transfer, status: "succeeded" | "failed") {
     await supabase
      .from("stripe_transfers")
      .update({ 
        status,
        failure_message: transfer.failure_message || null
      })
      .eq("id", transfer.id); // Assuming you store transfers with Stripe's transfer ID
  },

  async handleAccountUpdate(account: Stripe.Account) {
    const isPartner = account.metadata.user_type === "partner";
    const table = isPartner ? "partner_registrations" : "activity_owners";
    
    await supabase
      .from(table)
      .update({
        stripe_charges_enabled: account.charges_enabled,
      })
      .eq("stripe_account_id", account.id);
  },

  async handlePayout(payout: Stripe.Payout, status: "paid" | "failed") {
    await supabase
      .from("stripe_payouts")
      .update({ status })
      .eq("id", payout.id); // Assuming you store payouts with Stripe's payout ID
  },

  // Webhook event logging
  async logWebhookEvent(event: Stripe.Event) {
    const { error } = await supabase.from("stripe_webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object,
    });
    if (error) {
      console.error(`Failed to log webhook event ${event.id}`, error);
    }
  },

  async hasWebhookEventBeenProcessed(eventId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("stripe_webhook_events")
      .select("processed")
      .eq("stripe_event_id", eventId)
      .single();
      
    return data?.processed || false;
  },

  async markWebhookEventAsProcessed(eventId: string) {
    await supabase
      .from("stripe_webhook_events")
      .update({ processed: true })
      .eq("stripe_event_id", eventId);
  },

  // Payouts (Illustrative)
  async getPendingPayoutsForOwner(ownerId: string) {
    return supabase
      .from("stripe_payouts")
      .select("*")
      .eq("activity_owner_id", ownerId)
      .eq("status", "pending");
  },

  async getPendingPayoutsForPartner(partnerId: string) {
    return supabase
      .from("stripe_payouts")
      .select("*")
      .eq("partner_id", partnerId)
      .eq("status", "pending");
  },

  async getPayoutHistory(userId: string, isPartner: boolean) {
    const column = isPartner ? "partner_id" : "activity_owner_id";
    return supabase
      .from("stripe_payouts")
      .select("*")
      .eq(column, userId)
      .order("created_at", { ascending: false });
  },
};
