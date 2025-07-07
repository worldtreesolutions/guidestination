import { NextApiRequest, NextApiResponse } from "next";
import { commissionService } from "@/services/commissionService";
import { supabase } from "@/integrations/supabase/client";

// API endpoint to get commission invoices for external admin portal
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Basic API key authentication (you should implement proper auth)
    const apiKey = req.headers["x-api-key"] as string;
    const expectedApiKey = process.env.ADMIN_API_KEY;

    if (!apiKey || !expectedApiKey || apiKey !== expectedApiKey) {
      return res.status(401).json({ error: "Unauthorized - Invalid API key" });
    }

    // Parse query parameters for filtering
    const {
      provider_id,
      status,
      establishment_id,
      start_date,
      end_date,
      limit = "50",
      offset = "0"
    } = req.query;

    // Validate and cast status to proper type
    const validStatuses = ["pending", "cancelled", "paid", "overdue"] as const;
    const statusFilter = status && validStatuses.includes(status as any) 
      ? status as "pending" | "cancelled" | "paid" | "overdue"
      : undefined;

    // Get commission invoices with filters
    const { data: invoices, count } = await commissionService.getCommissionInvoices({
      providerId: provider_id as string,
      status: statusFilter,
      establishmentId: establishment_id as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    // Enrich data with provider and establishment details
    const enrichedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        // Get provider details
        const { data: provider } = await supabase
          .from("activity_owners")
          .select("business_name, email, phone")
          .eq("id", invoice.provider_id)
          .single();

        // Get establishment details if QR booking
        let establishment = null;
        if (invoice.establishment_id) {
          const { data: est } = await supabase
            .from("establishments")
            .select("name, email, phone")
            .eq("id", invoice.establishment_id)
            .single();
          establishment = est;
        }

        // Get booking details
        const { data: booking } = await supabase
          .from("bookings")
          .select("activity_id, customer_email, booking_date")
          .eq("id", invoice.booking_id)
          .single();

        // Get activity details
        let activity = null;
        if (booking?.activity_id) {
          const { data: act } = await supabase
            .from("activities")
            .select("title, location")
            .eq("id", booking.activity_id)
            .single();
          activity = act;
        }

        return {
          ...invoice,
          provider: provider || null,
          establishment: establishment || null,
          booking: booking || null,
          activity: activity || null
        };
      })
    );

    // Return formatted response
    res.status(200).json({
      success: true,
      data: {
        invoices: enrichedInvoices,
        pagination: {
          total: count,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: count > parseInt(offset as string) + parseInt(limit as string)
        }
      }
    });

  } catch (error) {
    console.error("Error fetching commission invoices:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
