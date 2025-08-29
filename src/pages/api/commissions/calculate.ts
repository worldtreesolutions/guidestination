import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

interface CommissionCalculation {
  bookingTotal: number;
  platformFee: number;
  platformNet: number;
  referralCommission: number;
  providerAmount: number;
  referredByEstablishment?: string;
  hasReferral: boolean;
}

interface BookingCommissionData {
  bookingId: string;
  activityId: number;
  customerId: string;
  bookingTotal: number;
  referralData?: {
    establishmentId: string;
    establishmentName: string;
    visitTimestamp: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { bookingId, activityId, customerId, bookingTotal, referralData }: BookingCommissionData = req.body;

    if (!bookingId || !activityId || !customerId || !bookingTotal) {
      return res.status(400).json({ error: "Missing required booking data" });
    }

    // Calculate commission structure
    const commission = calculateCommissionBreakdown(bookingTotal, referralData);

    // Store commission data in the bookings table (we'll add commission fields)
    const { data: existingBooking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError || !existingBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Update booking with commission data
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        platform_fee: commission.platformFee,
        provider_amount: commission.providerAmount,
        referral_commission: commission.referralCommission,
        referred_by_establishment: commission.referredByEstablishment || null,
        has_referral: commission.hasReferral,
        commission_calculated_at: new Date().toISOString(),
        commission_status: 'pending', // Manual payout system - starts as pending
        commission_paid_at: null // Will be updated when payout is processed
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating booking with commission data:", updateError);
      return res.status(500).json({ error: "Failed to update booking with commission data" });
    }

    // If there's a referral, log it for establishment tracking
    if (commission.hasReferral && referralData) {
      console.log(`🏪 Establishment ${referralData.establishmentId} earned commission: ฿${commission.referralCommission} from booking ${bookingId}`);
      console.log(`💰 Commission Status: PENDING (Manual payout required - Stripe Connect not available in Thailand)`);
      
      // Note: Commission is tracked in bookings table with commission_status='pending'
      // Manual payout dashboard will process these monthly via bank transfer
      // No automatic Stripe Connect payout due to Thailand restrictions
    }

    return res.status(200).json({
      success: true,
      commission: commission,
      updatedBooking: updatedBooking
    });

  } catch (error) {
    console.error("Commission calculation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Core commission calculation logic
export function calculateCommissionBreakdown(
  bookingTotal: number, 
  referralData?: { establishmentId: string; establishmentName: string; visitTimestamp: string }
): CommissionCalculation {
  
  // Platform always gets 20% of booking total
  const platformFee = bookingTotal * 0.20;
  
  // Check if booking came from referral
  const hasReferral = !!referralData;
  
  let referralCommission = 0;
  let platformNet = platformFee;
  
  if (hasReferral) {
    // Referring establishment gets 50% of platform's 20% = 10% of booking total
    referralCommission = platformFee * 0.50; // 50% of platform fee
    platformNet = platformFee - referralCommission; // Platform keeps remaining 50% of their 20%
  }
  
  // Activity provider gets everything else (80% of booking if no referral, 70% if referral)
  const providerAmount = bookingTotal - platformFee;
  
  return {
    bookingTotal,
    platformFee, // Always 20% of booking
    platformNet, // Platform's actual profit (10% if referral, 20% if no referral)
    referralCommission, // 10% of booking total (if referral exists)
    providerAmount, // Always 80% of booking (to activity provider)
    referredByEstablishment: referralData?.establishmentId,
    hasReferral
  };
}

// Example calculations:
// Booking = $100
// 
// NO REFERRAL:
// - Platform: $20 (20%)
// - Provider: $80 (80%)
// - Establishment: $0
//
// WITH REFERRAL:
// - Platform: $10 (10% net after sharing)
// - Provider: $80 (80%)
// - Establishment: $10 (10% referral commission)
// - Total Platform Fee: $20 (but $10 shared with establishment)
