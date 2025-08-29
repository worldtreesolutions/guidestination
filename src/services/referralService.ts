import { supabase } from "@/integrations/supabase/client"

// Default commission rate (percent) - can be replaced with config/env
const DEFAULT_COMMISSION_RATE = 10.0;

// Injectable IP provider for better testability / server-side handling
let ipProvider: (() => Promise<string | null>) | null = null;

export function setIpProvider(provider: () => Promise<string | null>) {
  ipProvider = provider;
}

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
  expires_at?: string;
  is_active?: boolean;
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
  async trackVisit(establishmentId: string, metadata: any = {}, ipAddress?: string) {
    const sessionId = this.getOrCreateSessionId();
    const { data: { user } } = await supabase.auth.getUser();

    // Prefer provided ipAddress, then injectable provider, then external lookup
    let ip = ipAddress || null;
    if (!ip && ipProvider) {
      try { ip = await ipProvider(); } catch (_) { ip = null; }
    }
    if (!ip && !ipProvider) {
      ip = await this.getClientIP();
    }

    // Set 15-day expiry for QR code linking
    const expiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days from now

    const visitData = {
      establishment_id: establishmentId,
      visitor_id: user?.id || undefined,
      session_id: sessionId,
      ip_address: ip || "unknown",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      referrer_url: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      metadata,
      expires_at: expiresAt.toISOString(),
      is_active: true,
    };

    const { data, error } = await supabase
      .from("referral_visits")
      .insert([visitData] as any)
      .select()
      .single();

    if (error) throw error;

    // Store visit ID in session for later booking attribution (guard for SSR)
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem('referral_visit_id', data.id);
        sessionStorage.setItem('establishment_id', establishmentId);
        sessionStorage.setItem('establishment_link_expires', expiresAt.toISOString());
      } catch (_) {}
    }

    return data as ReferralVisit;
  },

  async getReferralVisitFromSession(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('referral_visit_id')
  },

  async getEstablishmentFromSession(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem('establishment_id')
  },

  async getActiveEstablishmentLink(sessionId?: string, userId?: string): Promise<ReferralVisit | null> {
    const currentSessionId = sessionId || this.getOrCreateSessionId();
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = userId || user?.id;

    try {
      // Use a simple query and cast to any to avoid TS type issues
      const { data: visits, error } = await supabase
        .from("referral_visits")
        .select("*") as any;

      if (error) throw error;
      if (!visits || visits.length === 0) return null;

      const now = new Date();
      
      // Filter for active, non-expired visits that match current user/session
      const activeVisits = visits.filter((visit: any) => {
        if (!visit.is_active) return false;
        
        const expiresAt = visit.expires_at ? new Date(visit.expires_at) : null;
        if (!expiresAt || expiresAt <= now) return false;
        
        const matchesUser = currentUserId && visit.visitor_id === currentUserId;
        const matchesSession = !currentUserId && visit.session_id === currentSessionId;
        
        return matchesUser || matchesSession;
      });

      // Return the most recent active visit
      if (activeVisits.length > 0) {
        activeVisits.sort((a: any, b: any) => {
          const aDate = new Date(a.created_at || a.visit_date || 0);
          const bDate = new Date(b.created_at || b.visit_date || 0);
          return bDate.getTime() - aDate.getTime();
        });
        return activeVisits[0] as ReferralVisit;
      }

      return null;
    } catch (err) {
      console.error('Error getting active establishment link:', err);
      return null;
    }
  },

  async isEstablishmentLinkExpired(): Promise<boolean> {
    if (typeof window === 'undefined') return true;
    
    const expiryString = sessionStorage.getItem('establishment_link_expires');
    if (!expiryString) return true;
    
    const expiryDate = new Date(expiryString);
    return new Date() > expiryDate;
  },

  async createCommission(
    establishmentId: string,
    bookingId: string,
    activityId: number,
    customerId: string,
    bookingAmount: number,
    commissionRate: number = DEFAULT_COMMISSION_RATE,
    referralVisitId?: string
  ) {
    // basic validation
    if (!bookingId) throw new Error('bookingId is required');
    if (!establishmentId) throw new Error('establishmentId is required');
    if (bookingAmount == null || bookingAmount < 0) throw new Error('bookingAmount must be >= 0');

    const commissionAmount = (bookingAmount * commissionRate) / 100;

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
    };

    const { data, error } = await supabase
      .from("establishment_commissions")
      .insert([commissionData] as any)
      .select()
      .single();

    if (error) throw error;
    return data as EstablishmentCommission;
  },

  async getEstablishmentCommissions(establishmentId: string) {
    const { data, error } = await supabase
      .from("establishment_commissions")
      .select(`*`)
      .eq("establishment_id", establishmentId)
      .order("created_at", { ascending: false });

    if (error) throw error
    return data as unknown as EstablishmentCommission[]
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
    // Use injectable provider when available to avoid direct external calls during SSR/tests
    if (ipProvider) {
      try {
        return await ipProvider();
      } catch (e) {
        return null;
      }
    }

    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return null;
    }
  },

  clearReferralSession() {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem('referral_visit_id')
    sessionStorage.removeItem('establishment_id')
    sessionStorage.removeItem('establishment_link_expires')
  },
  // Backwards-compatible wrapper for creating referral commission
  async createReferralCommission(commissionData: {
    establishment_id: string;
    booking_id: string;
    activity_id: number;
    customer_id: string;
    referral_visit_id: string;
    commission_rate: number;
    booking_amount: number;
    commission_amount: number;
  }) {
    // delegate to createCommission for validation and single insertion pattern
    return this.createCommission(
      commissionData.establishment_id,
      commissionData.booking_id,
      commissionData.activity_id,
      commissionData.customer_id,
      commissionData.booking_amount,
      commissionData.commission_rate,
      commissionData.referral_visit_id
    );
  },

  async getReferralStats(establishmentId: string) {
    const { data, error } = await supabase
      .from("establishment_commissions")
      .select(`*`)
      .eq("establishment_id", establishmentId)
      .order("created_at", { ascending: false });

    if (error) throw error
    return data as unknown as EstablishmentCommission[]
  },

  // Helper method to check and create commission during booking
  async processBookingCommission(
    bookingId: string,
    activityId: number,
    customerId: string,
    bookingAmount: number,
    sessionId?: string,
    userId?: string
  ): Promise<EstablishmentCommission | null> {
    try {
      // Check if customer has an active establishment link
      const activeLink = await this.getActiveEstablishmentLink(sessionId, userId);
      
      if (!activeLink) {
        // No active establishment link - no commission
        return null;
      }

      // Calculate commission: 10% of total booking (50% of 20% platform fee)
      const platformFeeRate = 20; // 20% platform fee
      const establishmentShareRate = 50; // 50% of platform fee goes to establishment
      const commissionRate = (platformFeeRate * establishmentShareRate) / 100; // 10%

      // Create commission record
      const commission = await this.createCommission(
        activeLink.establishment_id,
        bookingId,
        activityId,
        customerId,
        bookingAmount,
        commissionRate,
        activeLink.id
      );

      return commission;
    } catch (error) {
      console.error('Error processing booking commission:', error);
      return null;
    }
  }
}

export default referralService
