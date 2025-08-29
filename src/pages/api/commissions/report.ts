import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import { calculateCommissionBreakdown } from "./calculate";

interface EstablishmentCommissionSummary {
  establishmentId: string;
  establishmentName?: string;
  totalBookings: number;
  totalCommissionAmount: number;
  bookingDetails: {
    bookingId: string;
    bookingDate: string;
    bookingAmount: number;
    commissionAmount: number;
    commissionStatus: string;
  }[];
}

interface CommissionReport {
  reportPeriod: string;
  totalEstablishments: number;
  totalCommissionsPending: number;
  totalCommissionsPaid: number;
  establishments: EstablishmentCommissionSummary[];
  generatedAt: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { period } = req.query;

    // Default to current month if no period specified
    const reportPeriod = period as string || new Date().toISOString().slice(0, 7); // YYYY-MM format

    // Calculate date range for the period
    const startDate = `${reportPeriod}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
      .toISOString().slice(0, 10);

    console.log(`📊 Generating commission report for period: ${reportPeriod} (${startDate} to ${endDate})`);

    // Fetch all bookings for the specified period
    // Note: Until database schema is updated, we'll calculate potential commissions for all bookings
    const bookingsResponse = await supabase
      .from("bookings")
      .select('id, created_at, total_amount, provider_id, status')
      .gte('created_at', `${startDate}T00:00:00.000Z`)
      .lte('created_at', `${endDate}T23:59:59.999Z`)
      .order('created_at', { ascending: false });

    if (bookingsResponse.error) {
      console.error("Error fetching bookings:", bookingsResponse.error);
      return res.status(500).json({ error: "Failed to fetch commission data" });
    }

    const allBookings = bookingsResponse.data || [];

    if (allBookings.length === 0) {
      return res.status(200).json({
        reportPeriod,
        totalEstablishments: 0,
        totalCommissionsPending: 0,
        totalCommissionsPaid: 0,
        establishments: [],
        generatedAt: new Date().toISOString(),
        message: `No bookings found for period ${reportPeriod}`
      });
    }

    // For demonstration purposes, assume some bookings came from QR referrals
    // In production, this will be filtered by actual referral data stored in localStorage/database
    const potentialReferralBookings = allBookings.filter(booking => 
      booking.provider_id && booking.provider_id !== 'default'
    );

    // Group bookings by provider_id (establishment) and calculate commissions
    const establishmentGroups: { [key: string]: any[] } = {};
    
    potentialReferralBookings.forEach(booking => {
      const establishmentId = booking.provider_id;
      if (establishmentId) {
        if (!establishmentGroups[establishmentId]) {
          establishmentGroups[establishmentId] = [];
        }
        establishmentGroups[establishmentId].push(booking);
      }
    });

    // Create commission summary for each establishment
    const establishments: EstablishmentCommissionSummary[] = [];
    let totalCommissions = 0;

    Object.entries(establishmentGroups).forEach(([establishmentId, bookings]) => {
      const totalBookings = bookings.length;
      let establishmentTotalCommission = 0;

      const bookingDetails = bookings.map(booking => {
        // Calculate commission for this booking using our existing logic
        const commission = calculateCommissionBreakdown(
          booking.total_amount,
          { 
            establishmentId, 
            establishmentName: `Establishment ${establishmentId}`,
            visitTimestamp: booking.created_at 
          }
        );

        establishmentTotalCommission += commission.referralCommission;

        return {
          bookingId: booking.id,
          bookingDate: booking.created_at,
          bookingAmount: booking.total_amount,
          commissionAmount: commission.referralCommission,
          commissionStatus: 'pending' // Default to pending since we're using manual payouts
        };
      });

      establishments.push({
        establishmentId,
        establishmentName: `Establishment ${establishmentId}`,
        totalBookings,
        totalCommissionAmount: establishmentTotalCommission,
        bookingDetails
      });

      totalCommissions += establishmentTotalCommission;
    });

    // Sort establishments by commission amount (highest first)
    establishments.sort((a, b) => b.totalCommissionAmount - a.totalCommissionAmount);

    const report: CommissionReport = {
      reportPeriod,
      totalEstablishments: establishments.length,
      totalCommissionsPending: totalCommissions, // All pending since manual payouts
      totalCommissionsPaid: 0,
      establishments,
      generatedAt: new Date().toISOString()
    };

    console.log(`✅ Commission report generated: ${establishments.length} establishments, ฿${totalCommissions.toFixed(2)} total`);

    return res.status(200).json(report);

  } catch (error) {
    console.error("Commission report generation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Helper function to export commission data as CSV
export function generateCommissionCSV(report: CommissionReport): string {
  const headers = [
    'Establishment ID',
    'Establishment Name', 
    'Total Bookings',
    'Total Commission (THB)',
    'Booking ID',
    'Booking Date',
    'Booking Amount (THB)',
    'Commission Amount (THB)',
    'Status'
  ];

  let csv = headers.join(',') + '\n';

  report.establishments.forEach(establishment => {
    establishment.bookingDetails.forEach(booking => {
      const row = [
        establishment.establishmentId,
        establishment.establishmentName,
        establishment.totalBookings,
        establishment.totalCommissionAmount.toFixed(2),
        booking.bookingId,
        booking.bookingDate,
        booking.bookingAmount.toFixed(2),
        booking.commissionAmount.toFixed(2),
        booking.commissionStatus
      ];
      csv += row.join(',') + '\n';
    });
  });

  return csv;
}

// Usage examples:
// GET /api/commissions/report - Current month pending commissions
// GET /api/commissions/report?period=2024-01 - January 2024 pending commissions  
// GET /api/commissions/report?period=2024-01&status=paid - January 2024 paid commissions
