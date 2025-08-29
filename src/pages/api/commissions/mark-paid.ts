import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

interface MarkCommissionPaidRequest {
  establishmentId: string;
  bookingIds: string[];
  payoutReference: string;
  payoutAmount: number;
  payoutDate: string;
  payoutMethod: 'bank_transfer' | 'promptpay' | 'check';
  notes?: string;
}

interface PayoutRecord {
  id: string;
  establishmentId: string;
  bookingIds: string[];
  payoutReference: string;
  payoutAmount: number;
  payoutDate: string;
  payoutMethod: string;
  status: 'paid';
  processedAt: string;
  notes?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { 
      establishmentId, 
      bookingIds, 
      payoutReference, 
      payoutAmount, 
      payoutDate, 
      payoutMethod,
      notes 
    }: MarkCommissionPaidRequest = req.body;

    if (!establishmentId || !bookingIds || bookingIds.length === 0 || !payoutReference || !payoutAmount) {
      return res.status(400).json({ error: "Missing required payout data" });
    }

    console.log(`💰 Processing commission payout for establishment ${establishmentId}`);
    console.log(`📋 Booking IDs: ${bookingIds.join(', ')}`);
    console.log(`🏦 Payout Reference: ${payoutReference}`);
    console.log(`💵 Amount: ฿${payoutAmount}`);

    // For now, we'll validate that the bookings exist and log the payout
    // In production, you'll need to add the commission fields to the database schema
    
    const { data: existingBookings, error: fetchError } = await supabase
      .from("bookings")
      .select('id, total_amount, provider_id, created_at')
      .in('id', bookingIds);

    if (fetchError) {
      console.error("Error fetching bookings:", fetchError);
      return res.status(500).json({ error: "Failed to validate bookings" });
    }

    if (!existingBookings || existingBookings.length !== bookingIds.length) {
      return res.status(404).json({ 
        error: "Some booking IDs not found",
        found: existingBookings?.length || 0,
        requested: bookingIds.length
      });
    }

    // Create payout record (for now, we'll return it as JSON)
    // In production, this should be stored in a commission_payouts table
    const payoutRecord: PayoutRecord = {
      id: `payout_${Date.now()}`,
      establishmentId,
      bookingIds,
      payoutReference,
      payoutAmount,
      payoutDate,
      payoutMethod,
      status: 'paid',
      processedAt: new Date().toISOString(),
      notes
    };

    // Log the successful payout for audit purposes
    console.log(`✅ Commission payout processed successfully`);
    console.log(`📊 Payout Record:`, JSON.stringify(payoutRecord, null, 2));
    console.log(`🏦 Bank Transfer Reference: ${payoutReference}`);
    console.log(`💰 Total Commission Paid: ฿${payoutAmount}`);

    // Note: In production, you would:
    // 1. Update bookings table with commission_status='paid', commission_paid_at, payout_reference
    // 2. Insert record into commission_payouts table
    // 3. Send notification email to establishment
    // 4. Update establishment balance/account

    return res.status(200).json({
      success: true,
      message: `Commission payout recorded for ${existingBookings.length} bookings`,
      payoutRecord: payoutRecord,
      validatedBookings: existingBookings,
      instructions: {
        databaseUpdate: "Add commission fields to bookings table and create commission_payouts table",
        nextSteps: [
          "Update database schema with commission tracking fields",
          "Implement actual booking status updates",
          "Create commission_payouts table for audit trail",
          "Add email notification system",
          "Integrate with Thai banking APIs for automated transfers"
        ]
      }
    });

  } catch (error) {
    console.error("Commission payout processing error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Database Schema Requirements for Production:
// 
// ALTER TABLE bookings ADD COLUMN commission_status TEXT DEFAULT 'pending';
// ALTER TABLE bookings ADD COLUMN commission_paid_at TIMESTAMP WITH TIME ZONE;
// ALTER TABLE bookings ADD COLUMN payout_reference TEXT;
// ALTER TABLE bookings ADD COLUMN referral_commission DECIMAL(10,2);
// ALTER TABLE bookings ADD COLUMN referred_by_establishment TEXT;
// ALTER TABLE bookings ADD COLUMN has_referral BOOLEAN DEFAULT FALSE;
//
// CREATE TABLE commission_payouts (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   establishment_id TEXT NOT NULL,
//   booking_ids TEXT[] NOT NULL,
//   payout_reference TEXT NOT NULL,
//   payout_amount DECIMAL(10,2) NOT NULL,
//   payout_date TIMESTAMP WITH TIME ZONE NOT NULL,
//   payout_method TEXT NOT NULL,
//   status TEXT DEFAULT 'paid',
//   notes TEXT,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );

// Usage by Dashboard Application:
// POST /api/commissions/mark-paid
// {
//   "establishmentId": "est_123",
//   "bookingIds": ["booking_1", "booking_2", "booking_3"],
//   "payoutReference": "TXN202501140001",
//   "payoutAmount": 1500.00,
//   "payoutDate": "2025-01-14",
//   "payoutMethod": "bank_transfer",
//   "notes": "Monthly commission payout - January 2025"
// }
