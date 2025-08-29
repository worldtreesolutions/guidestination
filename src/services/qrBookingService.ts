
import { supabase } from "@/integrations/supabase/client";

export interface QrBookingData {
  establishmentId: string;
  activityId: number;
  customerData: {
    name: string;
    email: string;
    phone?: string;
  };
  bookingData: {
    participants: number;
    totalAmount: number;
    scheduleInstanceId?: number;
  };
  referralVisitId?: string;
}
// Commission configuration (can be moved to env or config later)
const PLATFORM_COMMISSION_RATE = 20; // percent
const PARTNER_COMMISSION_SHARE = 0.5; // partner receives 50% of platform commission

export interface CreateQrBookingInput {
  activityId: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  participants: number;
  totalAmount: number;
  establishmentId: string;
  providerId?: string;
  referralVisitId?: string;
  customerId?: string; // optional existing user
}

export const qrBookingService = {
  // Track QR code scan
  async trackQrScan(establishmentId: string, metadata?: any, userAgent?: string): Promise<string> {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    // navigator.userAgent is only available in browser; allow injection for SSR/tests
    let ua = userAgent;
    try {
      if (!ua && typeof navigator !== "undefined") ua = navigator.userAgent;
    } catch (e) {
      ua = ua || "unknown";
    }

    const { data, error } = await supabase
      .from("qr_scans")
      .insert({
        establishment_id: establishmentId,
        user_agent: ua,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  // Create referral visit for QR booking
  async createReferralVisit(establishmentId: string, sessionId?: string): Promise<string> {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const { data, error } = await supabase
      .from("referral_visits")
      .insert({
        establishment_id: establishmentId,
        ip_address: "0.0.0.0", // Default IP address; caller can use recordVisit to provide real IP
        visit_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  // Record visit
  async recordVisit(establishmentId: string, ipAddress: string, sessionId: string) {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
      .from("referral_visits")
      .insert({
        establishment_id: establishmentId,
  ip_address: ipAddress || "0.0.0.0",
        visit_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error recording visit:", error);
      throw error;
    }
    return data;
  },

  // Create QR-linked booking
  /**
   * Create a QR booking and related commission row.
   * Attempts to clean up booking if commission insertion fails to avoid partial state.
   */
  async createQrBooking(input: CreateQrBookingInput): Promise<any> {
    if (!supabase) throw new Error("Supabase client not available");

    // Basic validation
    if (!input.activityId || !input.establishmentId) throw new Error("Missing required booking fields");
    if (!input.participants || input.participants <= 0) throw new Error("Participants must be > 0");
    if (input.totalAmount == null || input.totalAmount < 0) throw new Error("Invalid totalAmount");

    // Insert booking
    const bookingPayload: any = {
      activity_id: input.activityId,
      customer_name: input.customerName,
      participants: input.participants,
      total_amount: input.totalAmount,
      status: "pending",
      booking_date: new Date().toISOString(),
      customer_id: input.customerId || "anonymous",
      provider_id: input.providerId || "default",
    };

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert(bookingPayload)
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Compute commissions
    const platformCommissionAmount = (input.totalAmount * PLATFORM_COMMISSION_RATE) / 100;
    const partnerCommissionAmount = platformCommissionAmount * PARTNER_COMMISSION_SHARE;
    const partnerCommissionRate = PLATFORM_COMMISSION_RATE * PARTNER_COMMISSION_SHARE;

    try {
      const { error: commissionError } = await supabase
        .from("establishment_commissions")
        .insert({
          establishment_id: input.establishmentId,
          booking_id: booking.id,
          activity_id: input.activityId,
          referral_visit_id: input.referralVisitId || null,
          commission_rate: partnerCommissionRate,
          booking_amount: input.totalAmount,
          commission_amount: partnerCommissionAmount,
          commission_status: "pending",
          booking_source: "qr_code",
        });

      if (commissionError) {
        // Attempt to clean up the booking to avoid inconsistent state
        try {
          await supabase.from("bookings").delete().eq("id", booking.id);
        } catch (cleanupErr) {
          console.error("Failed to cleanup booking after commission insert failure:", cleanupErr);
        }
        throw commissionError;
      }
    } catch (err) {
      throw err;
    }

    return booking;
  },

  // Get establishment details for QR booking
  async getEstablishmentForQr(establishmentId: string) {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const { data, error } = await supabase
      .from("establishments")
      .select("*")
      .eq("id", establishmentId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get establishment by domain
  async getEstablishmentByDomain(domain: string) {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const { data, error } = await supabase
      .from("establishments")
      .select("*")
      .eq("establishment_name", domain) // Using establishment_name instead of domain
      .single();

    if (error) throw error;
    return data;
  },

  // Get QR booking statistics for establishment
  async getQrBookingStats(establishmentId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    let query = supabase
      .from("bookings")
      .select("total_amount, status, created_at")
      .eq("provider_id", establishmentId); // provider_id used to filter bookings for establishment

    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const bookings = data || [];
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0);
    const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;

    return {
      totalBookings,
      totalRevenue,
      confirmedBookings,
      conversionRate: totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0
    };
  },

  // Update booking
  async updateBooking(bookingId: string, customerName: string) {
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*, activities(*)")
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      console.error("Error fetching booking:", bookingError);
      throw bookingError;
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        customer_name: customerName,
        status: "confirmed",
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      throw updateError;
    }
  }
};

export default qrBookingService;
