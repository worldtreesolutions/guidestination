
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

// API endpoint to get providers with commission data for external admin portal
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Basic API key authentication
    const apiKey = req.headers["x-api-key"] as string;
    const expectedApiKey = process.env.ADMIN_API_KEY;

    if (!apiKey || !expectedApiKey || apiKey !== expectedApiKey) {
      return res.status(401).json({ error: "Unauthorized - Invalid API key" });
    }

    // Get all providers with their commission summary
    const { data: providers, error } = await supabase
      .from("activity_owners")
      .select(`
        id,
        business_name,
        email,
        phone,
        created_at,
        commission_invoices (
          id,
          platform_commission_amount,
          invoice_status,
          created_at
        )
      `);

    if (error) throw error;

    // Calculate commission summary for each provider
    const providersWithStats = providers?.map(provider => {
      const invoices = provider.commission_invoices || [];
      const totalCommission = invoices.reduce((sum, inv) => sum + Number(inv.platform_commission_amount), 0);
      const paidCommission = invoices
        .filter(inv => inv.invoice_status === "paid")
        .reduce((sum, inv) => sum + Number(inv.platform_commission_amount), 0);
      const pendingCommission = invoices
        .filter(inv => ["pending", "overdue"].includes(inv.invoice_status))
        .reduce((sum, inv) => sum + Number(inv.platform_commission_amount), 0);

      return {
        id: provider.id,
        business_name: provider.business_name,
        email: provider.email,
        phone: provider.phone,
        created_at: provider.created_at,
        commission_stats: {
          total_invoices: invoices.length,
          total_commission: totalCommission,
          paid_commission: paidCommission,
          pending_commission: pendingCommission,
          paid_invoices: invoices.filter(inv => inv.invoice_status === "paid").length,
          pending_invoices: invoices.filter(inv => ["pending", "overdue"].includes(inv.invoice_status)).length
        }
      };
    }) || [];

    res.status(200).json({
      success: true,
      data: providersWithStats
    });

  } catch (error) {
    console.error("Error fetching providers with commission data:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
