
import { NextApiRequest, NextApiResponse } from "next";
import { commissionService } from "@/services/commissionService";

// API endpoint to get commission statistics for external admin portal
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

    // Parse query parameters
    const { start_date, end_date, provider_id } = req.query;

    // Get commission statistics
    const stats = await commissionService.getCommissionStats({
      startDate: start_date as string,
      endDate: end_date as string,
      providerId: provider_id as string
    });

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("Error fetching commission stats:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
