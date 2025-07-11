
import { supabase } from "@/integrations/supabase/client";
import { getAdminClient, isAdminAvailable } from "@/integrations/supabase/admin";
import { Earning, CommissionInvoice, CommissionStats } from "@/types/activity";

export const commissionService = {
  async fetchEarningsForOwner(ownerId: string): Promise<{
    total: number;
    monthly: Earning[];
    pending: number;
  }> {
    const client = isAdminAvailable() ? getAdminClient() : supabase;

    const {  activities, error: activitiesError } = await client
      .from("activities")
      .select("id")
      .eq("owner_id", ownerId);

    if (activitiesError) {
      console.error("Error fetching activities for owner:", activitiesError);
      throw new Error(activitiesError.message);
    }

    if (!activities || activities.length === 0) {
      return { total: 0, monthly: [], pending: 0 };
    }

    const activityIds = activities.map((a) => a.id);

    const {  bookings, error: bookingsError } = await client
      .from("bookings")
      .select("total_price, status, created_at")
      .in("activity_id", activityIds);

    if (bookingsError) {
      console.error("Error fetching bookings for earnings:", bookingsError);
      throw new Error(bookingsError.message);
    }

    if (!bookings) {
      return { total: 0, monthly: [], pending: 0 };
    }

    let total = 0;
    let pending = 0;
    const monthlyData: { [key: string]: number } = {};

    bookings.forEach((booking) => {
      if (booking.status === "confirmed" || booking.status === "completed") {
        total += booking.total_price || 0;
        const month = new Date(booking.created_at).toLocaleString("en-US", {
          month: "short",
        });
        monthlyData[month] = (monthlyData[month] || 0) + (booking.total_price || 0);
      } else if (booking.status === "pending") {
        pending += booking.total_price || 0;
      }
    });

    const monthlyArray: Earning[] = Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    return { total, monthly: monthlyArray, pending };
  },

  async getCommissionStats(): Promise<CommissionStats> {
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    const { data, error } = await client.from("commission_invoices").select("*");

    if (error) {
      console.error("Error fetching commission stats:", error);
      throw error;
    }

    const stats: CommissionStats = {
      totalInvoices: data.length,
      totalCommissionAmount: data.reduce((sum, inv) => sum + inv.platform_commission_amount, 0),
      paidInvoices: data.filter(inv => inv.invoice_status === "paid").length,
      totalPaidAmount: data.filter(inv => inv.invoice_status === "paid").reduce((sum, inv) => sum + inv.platform_commission_amount, 0),
      pendingInvoices: data.filter(inv => inv.invoice_status === "pending").length,
      overdueInvoices: data.filter(inv => inv.invoice_status === "overdue").length,
      totalPendingAmount: data.filter(inv => inv.invoice_status === "pending" || inv.invoice_status === "overdue").reduce((sum, inv) => sum + inv.platform_commission_amount, 0),
    };

    return stats;
  },

  async getCommissionInvoices(
    { providerId, status }: { providerId?: string; status?: "all" | "pending" | "overdue" | "paid" }
  ): Promise<CommissionInvoice[]> {
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    let query = client.from("commission_invoices").select(`
      *,
      activity_owners (
        business_name,
        email
      )
    `);

    if (providerId) {
      query = query.eq("provider_id", providerId);
    }

    if (status && status !== "all") {
      query = query.eq("invoice_status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching ${status} invoices:`, error);
      throw error;
    }

    return data as CommissionInvoice[];
  },

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
    return data;
  },

  async updateInvoiceStatus(invoiceId: string, status: "pending" | "paid" | "overdue"): Promise<void> {
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    const { error } = await client
      .from("commission_invoices")
      .update({ invoice_status: status })
      .eq("id", invoiceId);

    if (error) {
      console.error(`Error updating invoice ${invoiceId} to status ${status}:`, error);
      throw error;
    }
  },

  async createCommissionPayment(paymentData: any): Promise<void> {
    const client = isAdminAvailable() ? getAdminClient() : supabase;
    const { error } = await client.from("commission_payments").insert([paymentData]);

    if (error) {
      console.error("Error creating commission payment:", error);
      throw error;
    }
  },

  calculateCommission(amount: number, isQrBooking: boolean) {
    const platformRate = 0.20; // 20%
    const partnerShareRate = 0.50; // 50% of platform commission

    const platformCommissionAmount = amount * platformRate;
    let partnerCommissionAmount = 0;
    let providerReceives = amount - platformCommissionAmount;

    if (isQrBooking) {
      partnerCommissionAmount = platformCommissionAmount * partnerShareRate;
    }

    return {
      platformCommissionAmount,
      partnerCommissionAmount,
      providerReceives,
    };
  },
};
