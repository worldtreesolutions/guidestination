import { supabase } from "@/integrations/supabase/client";
import { getAdminClient, isAdminAvailable } from "@/integrations/supabase/admin";
import { Earning, CommissionInvoice, CommissionStats } from "@/types/activity";

export const commissionService = {
  async fetchEarningsForOwner(ownerId: string) {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return { total: 0, monthly: [], pending: 0 };
    }
    
    const { data, error } = await supabase
      .from("commission_invoices")
      .select("*")
      .eq("provider_id", ownerId);

    if (error) {
      console.error("Error fetching earnings:", error);
      return { total: 0, monthly: [], pending: 0 };
    }

    const total = data?.reduce((sum, invoice) => sum + (invoice.platform_commission_amount || 0), 0) || 0;
    const pending = data?.filter(invoice => invoice.invoice_status === "pending")
      .reduce((sum, invoice) => sum + (invoice.platform_commission_amount || 0), 0) || 0;

    return {
      total,
      monthly: [],
      pending
    };
  },

  async fetchCommissionStats(): Promise<CommissionStats> {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return {
        total_revenue: 0,
        total_commission: 0,
        pending_commission: 0,
        paid_commission: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
        totalCommissionAmount: 0,
        totalPaidAmount: 0,
        totalPendingAmount: 0,
      };
    }

    const { data, error } = await supabase
      .from("commission_invoices")
      .select("*");

    if (error) {
      console.error("Error fetching commission stats:", error);
      return {
        total_revenue: 0,
        total_commission: 0,
        pending_commission: 0,
        paid_commission: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
        totalCommissionAmount: 0,
        totalPaidAmount: 0,
        totalPendingAmount: 0,
      };
    }

    const totalInvoices = data?.length || 0;
    const paidInvoices = data?.filter(invoice => invoice.invoice_status === "paid").length || 0;
    const pendingInvoices = data?.filter(invoice => invoice.invoice_status === "pending").length || 0;
    const overdueInvoices = data?.filter(invoice => invoice.invoice_status === "overdue").length || 0;
    const totalCommissionAmount = data?.reduce((sum, invoice) => sum + (invoice.platform_commission_amount || 0), 0) || 0;
    const totalPaidAmount = data?.filter(invoice => invoice.invoice_status === "paid")
      .reduce((sum, invoice) => sum + (invoice.platform_commission_amount || 0), 0) || 0;
    const totalPendingAmount = data?.filter(invoice => invoice.invoice_status === "pending")
      .reduce((sum, invoice) => sum + (invoice.platform_commission_amount || 0), 0) || 0;

    return {
      total_revenue: totalCommissionAmount,
      total_commission: totalCommissionAmount,
      pending_commission: totalPendingAmount,
      paid_commission: totalPaidAmount,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalCommissionAmount,
      totalPaidAmount,
      totalPendingAmount,
    };
  },

  async createCommissionInvoice(invoiceData: Omit<CommissionInvoice, "id">): Promise<CommissionInvoice> {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    
    const { data, error } = await supabase
      .from("commission_invoices")
      .insert([{
        ...invoiceData,
        invoice_status: invoiceData.invoice_status as "pending" | "paid" | "overdue" | "cancelled"
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating commission invoice:", error);
      throw error;
    }
    
    return data as CommissionInvoice;
  },
};
