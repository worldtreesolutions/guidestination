import { getAdminClient, isAdminAvailable } from "@/integrations/supabase/admin";
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
  invoice_status: string;
  due_date: string;
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
  stripe_payment_link_id?: string;
  stripe_payment_link_url?: string;
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
  payment_status: string;
  paid_at: string;
  created_at: string;
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

// Helper to generate a unique invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  const client = isAdminAvailable() ? getAdminClient() : supabase;
  
  const { count, error } = await client
    .from("commission_invoices")
    .select("*", { count: "exact", head: true });

  if (error) throw error;

  const invoiceCount = count || 0;
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const nextId = (invoiceCount + 1).toString().padStart(4, "0");

  return `INV-${year}${month}-${nextId}`;
};

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
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    
    const commission = this.calculateCommission(
      bookingData.totalAmount,
      bookingData.isQrBooking || false
    );

    const invoiceNumber = await generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // Due in 14 days

    const { data, error } = await client
      .from("commission_invoices")
      .insert({
        booking_id: bookingData.bookingId,
        provider_id: bookingData.providerId,
        invoice_number: invoiceNumber,
        total_booking_amount: commission.totalAmount,
        platform_commission_rate: commission.platformCommissionRate,
        platform_commission_amount: commission.platformCommissionAmount,
        partner_commission_rate: commission.partnerCommissionRate,
        partner_commission_amount: commission.partnerCommissionAmount,
        establishment_id: bookingData.establishmentId,
        is_qr_booking: commission.isQrBooking,
        invoice_status: "pending",
        due_date: dueDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating commission invoice:", error);
      throw error;
    }
    return {
      ...data,
      partner_commission_rate: data.partner_commission_rate || 0,
    } as CommissionInvoice;
  },

  // Get all commission invoices with filters
  async getCommissionInvoices(filters?: {
    providerId?: string;
    status?: string;
    establishmentId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: CommissionInvoice[]; count: number }> {
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    
    let query = client
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
    return { 
      data: data?.map(invoice => ({
        ...invoice,
        partner_commission_rate: invoice.partner_commission_rate || 0,
      })) as CommissionInvoice[] || [], 
      count: count || 0 
    };
  },

  // Get single commission invoice
  async getCommissionInvoice(invoiceId: string): Promise<CommissionInvoice | null> {
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    
    const { data, error } = await client
      .from("commission_invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (error) {
        console.error("Error fetching commission invoice:", error);
        return null;
    }
    return {
      ...data,
      partner_commission_rate: data.partner_commission_rate || 0,
    } as CommissionInvoice;
  },

  // Update commission invoice status
  async updateInvoiceStatus(invoiceId: string, status: "pending" | "cancelled" | "paid" | "overdue"): Promise<CommissionInvoice> {
    const validStatuses = ["pending", "cancelled", "paid", "overdue"] as const;
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const { data, error } = await supabase
      .from("commission_invoices")
      .update({ 
        invoice_status: status as string,
        updated_at: new Date().toISOString() 
      })
      .eq("id", invoiceId)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      partner_commission_rate: data.partner_commission_rate || 0,
    } as CommissionInvoice;
  },

  // Create commission payment record
  async createCommissionPayment(paymentData: {
    invoiceId: string;
    paymentAmount: number;
    paymentMethod: string;
    paymentReference?: string;
    stripePaymentIntentId?: string;
  }): Promise<CommissionPayment> {
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    
    const { data, error } = await client
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
    return {
      ...data,
      payment_reference: data.payment_reference || undefined,
      stripe_payment_intent_id: data.stripe_payment_intent_id || undefined,
    } as CommissionPayment;
  },

  // Get commission payments for an invoice
  async getCommissionPayments(invoiceId: string): Promise<CommissionPayment[]> {
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    
    const { data, error } = await client
      .from("commission_payments")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data?.map(payment => ({
      ...payment,
      payment_reference: payment.payment_reference || undefined,
      stripe_payment_intent_id: payment.stripe_payment_intent_id || undefined,
    })) as CommissionPayment[] || [];
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
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    
    let query = client
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
      .filter(inv => ["pending", "overdue"].includes(inv.invoice_status || ""))
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
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    
    const { error } = await client
      .from("bookings")
      .update({ commission_invoice_generated: true })
      .eq("id", bookingId);

    if (error) throw error;
  },

  // Update booking with QR establishment info
  async updateBookingQrInfo(bookingId: number, establishmentId: string): Promise<void> {
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    
    const { error } = await client
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
