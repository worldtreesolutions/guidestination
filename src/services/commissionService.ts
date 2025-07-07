
import { supabase } from "@/integrations/supabase/client";

export interface CommissionInvoice {
  id: string;
  booking_id: number;
  provider_id: string;
  invoice_number: string;
  total_booking_amount: number;
  platform_commission_rate: number;
  platform_commission_amount: number;
  partner_commission_rate: number;
  partner_commission_amount: number;
  establishment_id?: string;
  is_qr_booking: boolean;
  invoice_status: "pending" | "paid" | "overdue" | "cancelled";
  payment_method?: "stripe_payment_link" | "bank_transfer" | "manual";
  stripe_payment_link_id?: string;
  stripe_payment_link_url?: string;
  payment_reference?: string;
  due_date: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionPayment {
  id: string;
  invoice_id: string;
  payment_amount: number;
  payment_method: string;
  payment_reference?: string;
  stripe_payment_intent_id?: string;
  payment_status: "pending" | "completed" | "failed" | "refunded";
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CommissionCalculation {
  totalAmount: number;
  platformCommissionRate: number;
  platformCommissionAmount: number;
  partnerCommissionRate: number;
  partnerCommissionAmount: number;
  providerReceives: number;
  isQrBooking: boolean;
}

export const commissionService = {
  // Calculate commission amounts based on booking details
  calculateCommission(
    totalAmount: number,
    isQrBooking: boolean = false,
    platformRate: number = 20,
    partnerRate: number = 10
  ): CommissionCalculation {
    const platformCommissionAmount = (totalAmount * platformRate) / 100;
    const partnerCommissionAmount = isQrBooking ? (platformCommissionAmount * 50) / 100 : 0;
    const providerReceives = totalAmount - platformCommissionAmount;

    return {
      totalAmount,
      platformCommissionRate: platformRate,
      platformCommissionAmount,
      partnerCommissionRate: partnerRate,
      partnerCommissionAmount,
      providerReceives,
      isQrBooking
    };
  },

  // Create commission invoice after successful payment
  async createCommissionInvoice(bookingData: {
    bookingId: number;
    providerId: string;
    totalAmount: number;
    isQrBooking?: boolean;
    establishmentId?: string;
  }): Promise<CommissionInvoice> {
    const commission = this.calculateCommission(
      bookingData.totalAmount,
      bookingData.isQrBooking || false
    );

    const { data, error } = await supabase
      .from("commission_invoices")
      .insert({
        booking_id: bookingData.bookingId,
        provider_id: bookingData.providerId,
        total_booking_amount: commission.totalAmount,
        platform_commission_rate: commission.platformCommissionRate,
        platform_commission_amount: commission.platformCommissionAmount,
        partner_commission_rate: commission.partnerCommissionRate,
        partner_commission_amount: commission.partnerCommissionAmount,
        establishment_id: bookingData.establishmentId,
        is_qr_booking: commission.isQrBooking,
        invoice_status: "pending"
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all commission invoices with filters
  async getCommissionInvoices(filters?: {
    providerId?: string;
    status?: string;
    establishmentId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: CommissionInvoice[]; count: number }> {
    let query = supabase
      .from("commission_invoices")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (filters?.providerId) {
      query = query.eq("provider_id", filters.providerId);
    }

    if (filters?.status) {
      query = query.eq("invoice_status", filters.status);
    }

    if (filters?.establishmentId) {
      query = query.eq("establishment_id", filters.establishmentId);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  },

  // Get single commission invoice
  async getCommissionInvoice(invoiceId: string): Promise<CommissionInvoice> {
    const { data, error } = await supabase
      .from("commission_invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update commission invoice status
  async updateInvoiceStatus(
    invoiceId: string,
    status: "pending" | "paid" | "overdue" | "cancelled",
    paymentData?: {
      paymentMethod?: string;
      paymentReference?: string;
      paidAt?: string;
    }
  ): Promise<CommissionInvoice> {
    const updateData: any = {
      invoice_status: status,
      updated_at: new Date().toISOString()
    };

    if (status === "paid" && paymentData) {
      updateData.payment_method = paymentData.paymentMethod;
      updateData.payment_reference = paymentData.paymentReference;
      updateData.paid_at = paymentData.paidAt || new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("commission_invoices")
      .update(updateData)
      .eq("id", invoiceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create commission payment record
  async createCommissionPayment(paymentData: {
    invoiceId: string;
    paymentAmount: number;
    paymentMethod: string;
    paymentReference?: string;
    stripePaymentIntentId?: string;
  }): Promise<CommissionPayment> {
    const { data, error } = await supabase
      .from("commission_payments")
      .insert({
        invoice_id: paymentData.invoiceId,
        payment_amount: paymentData.paymentAmount,
        payment_method: paymentData.paymentMethod,
        payment_reference: paymentData.paymentReference,
        stripe_payment_intent_id: paymentData.stripePaymentIntentId,
        payment_status: "completed",
        paid_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get commission payments for an invoice
  async getCommissionPayments(invoiceId: string): Promise<CommissionPayment[]> {
    const { data, error } = await supabase
      .from("commission_payments")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get commission statistics for admin dashboard
  async getCommissionStats(filters?: {
    startDate?: string;
    endDate?: string;
    providerId?: string;
  }): Promise<{
    totalInvoices: number;
    totalCommissionAmount: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
    totalPaidAmount: number;
    totalPendingAmount: number;
  }> {
    let query = supabase
      .from("commission_invoices")
      .select("platform_commission_amount, invoice_status, created_at");

    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }

    if (filters?.providerId) {
      query = query.eq("provider_id", filters.providerId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const invoices = data || [];
    const totalInvoices = invoices.length;
    const totalCommissionAmount = invoices.reduce((sum, inv) => sum + Number(inv.platform_commission_amount), 0);
    const paidInvoices = invoices.filter(inv => inv.invoice_status === "paid").length;
    const pendingInvoices = invoices.filter(inv => inv.invoice_status === "pending").length;
    const overdueInvoices = invoices.filter(inv => inv.invoice_status === "overdue").length;
    const totalPaidAmount = invoices
      .filter(inv => inv.invoice_status === "paid")
      .reduce((sum, inv) => sum + Number(inv.platform_commission_amount), 0);
    const totalPendingAmount = invoices
      .filter(inv => inv.invoice_status === "pending")
      .reduce((sum, inv) => sum + Number(inv.platform_commission_amount), 0);

    return {
      totalInvoices,
      totalCommissionAmount,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalPaidAmount,
      totalPendingAmount
    };
  },

  // Mark booking as having commission invoice generated
  async markBookingCommissionGenerated(bookingId: number): Promise<void> {
    const { error } = await supabase
      .from("bookings")
      .update({ commission_invoice_generated: true })
      .eq("id", bookingId);

    if (error) throw error;
  },

  // Update booking with QR establishment info
  async updateBookingQrInfo(bookingId: number, establishmentId: string): Promise<void> {
    const { error } = await supabase
      .from("bookings")
      .update({
        is_qr_booking: true,
        qr_establishment_id: establishmentId
      })
      .eq("id", bookingId);

    if (error) throw error;
  }
};

export default commissionService;
