import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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

export const qrBookingService = {
  // Track QR code scan
  async trackQrScan(establishmentId: string, metadata?: any): Promise<string> {
    const { data, error } = await supabase
      .from("qr_scans")
      .insert({
        establishment_id: establishmentId,
        user_agent: navigator.userAgent,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  // Create referral visit for QR booking
  async createReferralVisit(establishmentId: string, sessionId?: string): Promise<string> {
    const { data, error } = await supabase
      .from("referral_visits")
      .insert({
        establishment_id: establishmentId,
        session_id: sessionId || `qr_${Date.now()}`,
        user_agent: navigator.userAgent,
        metadata: {
          source: "qr_code",
          timestamp: new Date().toISOString()
        }
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
      .insert([{ establishment_id: establishmentId, ip_address: ipAddress }]);

    if (error) {
      console.error("Error recording visit:", error);
      throw error;
    }
    return data;
  },

  // Create QR-linked booking
  async createQRBooking(bookingData: {
    activityId: number
    customerName: string
    customerEmail: string
    customerPhone?: string
    participants: number
    totalAmount: number
    establishmentId: string
    referralVisitId?: string
  }) {
    const { booking, error } = await supabase
      .from("bookings")
      .insert({
        activity_id: bookingData.activityId,
        customer_name: bookingData.customerName,
        customer_phone: bookingData.customerPhone || null,
        participants: bookingData.participants,
        total_amount: bookingData.totalAmount,
        establishment_id: bookingData.establishmentId,
        is_qr_booking: true,
        qr_establishment_id: bookingData.establishmentId,
        referral_visit_id: bookingData.referralVisitId || null,
        booking_source: "qr_code",
        status: "pending",
        booking_date: new Date().toISOString(), // Add missing booking_date
      })
      .select()
      .single();

    if (error) throw error;

    // Create establishment commission record
    const platformCommissionRate = 20; // 20% platform commission
    const partnerCommissionRate = 10; // 10% partner commission (50% of platform commission)
    const platformCommissionAmount = (bookingData.totalAmount * platformCommissionRate) / 100;
    const partnerCommissionAmount = (platformCommissionAmount * 50) / 100; // 50% of platform commission

    await supabase
      .from("establishment_commissions")
      .insert({
        establishment_id: bookingData.establishmentId,
        booking_id: booking.id,
        activity_id: bookingData.activityId,
        referral_visit_id: bookingData.referralVisitId,
        commission_rate: partnerCommissionRate,
        booking_amount: bookingData.totalAmount,
        commission_amount: partnerCommissionAmount,
        commission_status: "pending",
        booking_source: "qr_code"
      });

    return booking.id;
  },

  // Create QR booking
  async createQrBooking(bookingDetails: {
    activity_id: number;
    user_id: string;
    customer_name: string;
    customer_email: string;
    participants: number;
    total_price: number;
    provider_id: string;
    establishment_id: string;
  }) {
    if (!supabase) {
      throw new Error("Supabase client is not initialized.");
    }
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          activity_id: bookingDetails.activity_id,
          user_id: bookingDetails.user_id,
          customer_name: bookingDetails.customer_name,
          participants: bookingDetails.participants,
          total_amount: bookingDetails.total_price,
          provider_id: bookingDetails.provider_id,
          establishment_id: bookingDetails.establishment_id,
          status: "confirmed", // Or "pending" if payment is needed
          is_qr_booking: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating QR booking:", error);
      throw error;
    }
    return data;
  },

  // Get establishment details for QR booking
  async getEstablishmentForQr(establishmentId: string) {
    const { data, error } = await supabase
      .from("establishments")
      .select("*")
      .eq("id", establishmentId)
      .eq("verification_status", "approved")
      .single();

    if (error) throw error;
    return data;
  },

  // Get establishment by domain
  async getEstablishmentByDomain(domain: string) {
    const { data, error } = await supabase
      .from("establishments")
      .select("*")
      .eq("domain", domain)
      .eq("verification_status", "approved")
      .single();

    if (error) throw error;
    return data;
  },

  // Get QR booking statistics for establishment
  async getQrBookingStats(establishmentId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    let query = supabase
      .from("bookings")
      .select("total_amount, status, created_at")
      .eq("qr_establishment_id", establishmentId)
      .eq("is_qr_booking", true);

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
  }
};

export default qrBookingService;
