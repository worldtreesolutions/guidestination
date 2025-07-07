import { getAdminClient, isAdminAvailable } from "@/integrations/supabase/admin";
import { supabase } from "@/integrations/supabase/client";
import commissionService, { CommissionInvoice } from "./commissionService";

// Simplified type to reduce memory usage
interface ActivityOwner {
  id: string;
  business_name?: string;
  email?: string;
}

export interface InvoiceEmailData {
  invoiceNumber: string;
  providerName: string;
  providerEmail: string;
  totalAmount: number;
  commissionAmount: number;
  dueDate: string;
  paymentLinkUrl?: string;
}

export interface PaymentConfirmationData {
  invoiceNumber: string;
  providerName: string;
  providerEmail: string;
  paymentAmount: number;
  paymentMethod: string;
  paymentReference?: string;
}

export interface ProcessPaymentData {
  invoiceId: string;
  paymentAmount: number;
  paymentMethod: string;
  paymentReference?: string;
  stripePaymentIntentId?: string;
}

export const invoiceService = {
  // Generate invoice PDF (placeholder - would integrate with PDF generation service)
  async generateInvoicePDF(invoice: CommissionInvoice): Promise<string> {
    // This would integrate with a PDF generation service like jsPDF or Puppeteer
    // For now, return a placeholder URL
    return `https://example.com/invoices/${invoice.invoice_number}.pdf`;
  },

  // Send invoice email to provider
  async sendInvoiceEmail(invoiceData: InvoiceEmailData): Promise<boolean> {
    try {
      // This would integrate with an email service like SendGrid, Mailgun, or Supabase Edge Functions
      // For now, we'll log the email data
      console.log("Sending invoice email:", invoiceData);
      
      // In a real implementation, you would:
      // 1. Generate the invoice PDF
      // 2. Create email template with invoice details
      // 3. Send email via your preferred email service
      // 4. Include payment link if available
      
      return true;
    } catch (error) {
      console.error("Failed to send invoice email:", error);
      return false;
    }
  },

  // Create Stripe Payment Link for commission payment
  async createStripePaymentLink(invoice: CommissionInvoice): Promise<{
    paymentLinkId: string;
    paymentLinkUrl: string;
  }> {
    try {
      // This would call your Stripe API to create a payment link
      const response = await fetch("/api/stripe/create-commission-payment-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: invoice.platform_commission_amount,
          currency: "usd", // or "thb" for Thailand
          description: `Commission payment for invoice ${invoice.invoice_number}`,
          metadata: {
            invoice_id: invoice.id,
            provider_id: invoice.provider_id,
            booking_id: invoice.booking_id.toString()
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create payment link: ${errorData.details || response.statusText}`);
      }

      const data = await response.json();
      
      // Update invoice with payment link details using safe client
      const client = isAdminAvailable() ? getAdminClient() : supabase;
      await client
        .from("commission_invoices")
        .update({
          stripe_payment_link_id: data.paymentLinkId,
          stripe_payment_link_url: data.paymentLinkUrl,
          payment_method: "stripe_payment_link"
        })
        .eq("id", invoice.id);

      return {
        paymentLinkId: data.paymentLinkId,
        paymentLinkUrl: data.paymentLinkUrl
      };
    } catch (error) {
      console.error("Failed to create Stripe payment link:", error);
      throw error;
    }
  },

  // Process successful commission payment
  async processCommissionPayment(data: ProcessPaymentData): Promise<void> {
    try {
      // Create payment record
      await commissionService.createCommissionPayment(data);

      // Update invoice status to paid
      await commissionService.updateInvoiceStatus(
        data.invoiceId,
        "paid"
      );

      // Send payment confirmation email
      const invoice = await commissionService.getCommissionInvoice(data.invoiceId);
      if (!invoice) {
        console.error("Invoice not found for payment confirmation email");
        return;
      }
      
      // Get provider details for email using safe client
      const client = isAdminAvailable() ? getAdminClient() : supabase;
      const { data: provider } = await client
        .from("activity_owners")
        .select("business_name, email")
        .eq("id", invoice.provider_id)
        .single();

      if (provider) {
        const owner = provider as ActivityOwner;
        await this.sendPaymentConfirmationEmail({
          invoiceNumber: invoice.invoice_number,
          providerName: owner.business_name || "Provider",
          providerEmail: owner.email || "",
          paymentAmount: data.paymentAmount,
          paymentMethod: data.paymentMethod,
          paymentReference: data.paymentReference
        });
      }
    } catch (error) {
      console.error("Failed to process commission payment:", error);
      throw error;
    }
  },

  // Send payment confirmation email
  async sendPaymentConfirmationEmail(data: PaymentConfirmationData): Promise<boolean> {
    try {
      console.log("Sending payment confirmation email:", data);
      // This would integrate with your email service
      return true;
    } catch (error) {
      console.error("Failed to send payment confirmation email:", error);
      return false;
    }
  },

  // Get overdue invoices for reminder emails
  async getOverdueInvoices(): Promise<CommissionInvoice[]> {
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    
    const { data, error } = await client
      .from("commission_invoices")
      .select("*")
      .eq("invoice_status", "pending")
      .lt("due_date", new Date().toISOString());

    if (error) throw error;

    // Update status to overdue
    if (data && data.length > 0) {
      const overdueIds = data.map(invoice => invoice.id);
      await client
        .from("commission_invoices")
        .update({ invoice_status: "overdue" })
        .in("id", overdueIds);
    }

    return data?.map(invoice => ({
      ...invoice,
      partner_commission_rate: invoice.partner_commission_rate || 0,
    })) as CommissionInvoice[] || [];
  },

  // Send reminder emails for overdue invoices
  async sendOverdueReminders(): Promise<void> {
    try {
      const overdueInvoices = await this.getOverdueInvoices();
      
      for (const invoice of overdueInvoices) {
        // Get provider details using safe client
        const client = isAdminAvailable() ? getAdminClient() : supabase;
        const { data: provider } = await client
          .from("activity_owners")
          .select("business_name, email")
          .eq("id", invoice.provider_id)
          .single();

        if (provider) {
          const owner = provider as ActivityOwner;
          await this.sendInvoiceEmail({
            invoiceNumber: invoice.invoice_number,
            providerName: owner.business_name || "Provider",
            providerEmail: owner.email || "",
            totalAmount: invoice.total_booking_amount,
            commissionAmount: invoice.platform_commission_amount,
            dueDate: invoice.due_date,
            paymentLinkUrl: invoice.stripe_payment_link_url || undefined
          });
        }
      }
    } catch (error) {
      console.error("Failed to send overdue reminders:", error);
      throw error;
    }
  }
};

export default invoiceService;
