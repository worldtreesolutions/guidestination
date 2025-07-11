import { NextApiRequest, NextApiResponse } from "next"
    import Stripe from "stripe"
    import { buffer } from "micro"
    import { getAdminClient } from "@/integrations/supabase/admin"
    import { Json } from "@/integrations/supabase/types"

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    })

    const webhookSecret = process.env.STRIPE_COMMISSION_WEBHOOK_SECRET!

    export const config = {
      api: {
        bodyParser: false,
      },
    }

    const supabase = getAdminClient()

    const recordWebhookEvent = async (event: Stripe.Event) => {
      if (!supabase) {
        console.error("Supabase client not initialized for webhook event recording.")
        return
      }
      try {
        // Log the event instead of storing in non-existent table
        console.log(`Webhook event received: ${event.type} - ${event.id}`)
      } catch (error) {
        console.error("Error recording webhook event:", error)
      }
    }

    const handleSuccessfulPaymentIntent = async (paymentIntent: Stripe.PaymentIntent, res: NextApiResponse) => {
      if (!supabase) {
        console.error("Supabase client not initialized for successful payment.")
        return res.status(500).json({ error: "Internal server error" })
      }
      const invoiceId = paymentIntent.metadata.invoice_id
      if (!invoiceId) {
        console.error("No invoice_id in paymentIntent metadata")
        return res.status(400).json({ error: "Invoice ID missing" })
      }

      try {
        // Update invoice status
        const { error: updateError } = await supabase
          .from("commission_invoices")
          .update({ invoice_status: "paid" })
          .eq("id", invoiceId)

        if (updateError) throw updateError

        // Create payment record
        const { error: insertError } = await supabase
          .from("commission_payments")
          .insert({
            invoice_id: invoiceId,
            amount: paymentIntent.amount / 100,
            payment_method: paymentIntent.payment_method_types[0],
            stripe_payment_intent_id: paymentIntent.id,
            payment_status: "completed",
            paid_at: new Date(paymentIntent.created * 1000).toISOString(),
          })

        if (insertError) throw insertError

        // Create commission payment record for partner
        const {  invoice } = await supabase
          .from("commission_invoices")
          .select("platform_commission_amount")
          .eq("id", invoiceId)
          .single();
        
        if (invoice) {
            const { error: partnerPaymentError } = await supabase
            .from("commission_payments")
            .insert([{
                invoice_id: invoiceId,
                amount: invoice.platform_commission_amount,
                paid_at: new Date().toISOString(),
            }]);

            if (partnerPaymentError) {
            console.error("Error creating partner commission payment:", partnerPaymentError);
            throw partnerPaymentError;
            }
        }

        console.log(`Successfully processed payment for invoice ${invoiceId}`)
      } catch (error) {
        console.error("Error handling successful payment:", error)
      }
    }

    const handleFailedPaymentIntent = async (paymentIntent: Stripe.PaymentIntent, res: NextApiResponse) => {
        if (!supabase) {
            console.error("Supabase client not initialized for failed payment.")
            return res.status(500).json({ error: "Internal server error" })
        }
        const invoiceId = paymentIntent.metadata.invoice_id;
        if (!invoiceId) {
            console.error("No invoice_id in paymentIntent metadata for failed payment");
            return res.status(400).json({ error: "Invoice ID missing" });
        }

        try {
            await supabase
                .from("commission_invoices")
                .update({ invoice_status: "overdue" })
                .eq("id", invoiceId);

            await supabase.from("commission_payments").insert({
                invoice_id: invoiceId,
                amount: paymentIntent.amount / 100,
                payment_method: paymentIntent.payment_method_types[0],
                stripe_payment_intent_id: paymentIntent.id,
                payment_status: "failed",
                paid_at: new Date().toISOString(),
            });

            console.log(`Recorded failed payment attempt for invoice ${invoiceId}`);
        } catch (error) {
            console.error("Error handling failed payment:", error);
        }
    }


    export default async function handler(
      req: NextApiRequest,
      res: NextApiResponse
    ) {
      if (req.method === "POST") {
        const buf = await buffer(req)
        const sig = req.headers["stripe-signature"]

        let event: Stripe.Event

        try {
          event = stripe.webhooks.constructEvent(buf, sig!, webhookSecret)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error"
          console.error(`Webhook signature verification failed: ${errorMessage}`)
          return res.status(400).send(`Webhook Error: ${errorMessage}`)
        }

        await recordWebhookEvent(event)

        switch (event.type) {
          case "payment_intent.succeeded":
            const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent
            await handleSuccessfulPaymentIntent(paymentIntentSucceeded, res)
            break
          case "payment_intent.payment_failed":
            const paymentIntentFailed = event.data.object as Stripe.PaymentIntent
            await handleFailedPaymentIntent(paymentIntentFailed, res)
            break
          default:
            console.log(`Unhandled event type ${event.type}`)
        }

        res.status(200).json({ received: true })
      } else {
        res.setHeader("Allow", "POST")
        res.status(405).end("Method Not Allowed")
      }
    }
  
