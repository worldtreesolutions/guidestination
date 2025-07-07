
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

  // Create QR-linked booking
  async createQrBooking(qrBookingData: QrBookingData): Promise<number> {
    try {
      // Create the booking with QR establishment link
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          activity_id: qrBookingData.activityId,
          customer_name: qrBookingData.customerData.name,
          customer_email: qrBookingData.customerData.email,
          customer_phone: qrBookingData.customerData.phone,
          participants: qrBookingData.bookingData.participants,
          total_amount: qrBookingData.bookingData.totalAmount,
          establishment_id: qrBookingData.establishmentId,
          is_qr_booking: true,
          qr_establishment_id: qrBookingData.establishmentId,
          referral_visit_id: qrBookingData.referralVisitId,
          booking_source: "qr_code",
          status: "pending"
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create establishment commission record
      const platformCommissionRate = 20; // 20% platform commission
      const partnerCommissionRate = 10; // 10% partner commission (50% of platform commission)
      const platformCommissionAmount = (qrBookingData.bookingData.totalAmount * platformCommissionRate) / 100;
      const partnerCommissionAmount = (platformCommissionAmount * 50) / 100; // 50% of platform commission

      await supabase
        .from("establishment_commissions")
        .insert({
          establishment_id: qrBookingData.establishmentId,
          booking_id: booking.id,
          activity_id: qrBookingData.activityId,
          referral_visit_id: qrBookingData.referralVisitId,
          commission_rate: partnerCommissionRate,
          booking_amount: qrBookingData.bookingData.totalAmount,
          commission_amount: partnerCommissionAmount,
          commission_status: "pending",
          booking_source: "qr_code"
        });

      return booking.id;
    } catch (error) {
      console.error("Failed to create QR booking:", error);
      throw error;
    }
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
