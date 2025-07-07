import { supabase } from "@/integrations/supabase/client"

export interface ReferralVisit {
  id: string;
  establishment_id: string;
  ip_address: string;
  visit_date: string;
  visitor_id?: string;
  session_id?: string;
  user_agent?: string;
  referrer_url?: string;
  metadata?: any;
  visited_at?: string;
}

export interface EstablishmentCommission {
  id: string;
  establishment_id: string;
  booking_id?: string;
  activity_id: number;
  customer_id: string;
  referral_visit_id?: string;
  commission_rate: number;
  booking_amount: number;
  commission_amount: number;
  commission_status: "pending" | "approved" | "paid" | "cancelled";
  booking_source: "qr_code" | "direct" | "other";
  created_at: string;
  updated_at: string;
}

export const referralService = {
  async trackVisit(establishmentId: string, metadata: any = {}) {
    const sessionId = this.getOrCreateSessionId()
    const { data: { user } } = await supabase.auth.getUser()
    
    const visitData = {
      establishment_id: establishmentId,
      visitor_id: user?.id || undefined,
      session_id: sessionId,
      ip_address: (await this.getClientIP()) || "unknown",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      referrer_url: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      metadata,
    };

    const { data, error } = await supabase
      .from("referral_visits")
      .insert([visitData] as any)
      .select()
      .single();

    if (error) throw error
    
    // Store visit ID in session for later booking attribution
    sessionStorage.setItem('referral_visit_id', data.id)
    sessionStorage.setItem('establishment_id', establishmentId)
    
    return data as ReferralVisit
  },

  async getReferralVisitFromSession(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('referral_visit_id')
  },

  async getEstablishmentFromSession(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('establishment_id')
  },

  async createCommission(
    establishmentId: string,
    bookingId: string,
    activityId: number,
    customerId: string,
    bookingAmount: number,
    commissionRate: number = 10.0,
    referralVisitId?: string
  ) {
    const commissionAmount = (bookingAmount * commissionRate) / 100

    const commissionData = {
      establishment_id: establishmentId,
      booking_id: bookingId,
      activity_id: activityId,
      customer_id: customerId,
      referral_visit_id: referralVisitId || null,
      commission_rate: commissionRate,
      booking_amount: bookingAmount,
      commission_amount: commissionAmount,
      commission_status: 'pending' as const,
      booking_source: referralVisitId ? 'qr_code' as const : 'direct' as const
    }

    const { data, error } = await supabase
      .from("establishment_commissions")
      .insert([commissionData])
      .select()
      .single();

    if (error) throw error
    return data as EstablishmentCommission
  },

  async getEstablishmentCommissions(establishmentId: string) {
    const { data, error } = await supabase
      .from("establishment_commissions")
      .select(`*`)
      .eq("establishment_id", establishmentId)
      .order("created_at", { ascending: false });

    if (error) throw error
    return data as EstablishmentCommission[]
  },

  async getEstablishmentVisits(establishmentId: string) {
    const { data, error } = await supabase
      .from("referral_visits")
      .select("*")
      .eq("establishment_id", establishmentId)
      .order("visited_at", { ascending: false });

    if (error) throw error
    return data as ReferralVisit[]
  },

  getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'server-session'
    
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  },

  async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      return null
    }
  },

  clearReferralSession() {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem('referral_visit_id')
    sessionStorage.removeItem('establishment_id')
  }
}

export default referralService
