
import { NextApiRequest, NextApiResponse } from "next";

// Simple test endpoint to verify API connection from external admin portal
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

    // Return success response with system info
    res.status(200).json({
      success: true,
      message: "Connection successful",
      data: {
        system: "Guidestination Commission API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        endpoints: [
          "GET /api/admin/commission/invoices",
          "GET /api/admin/commission/stats", 
          "GET /api/admin/commission/providers",
          "PUT /api/admin/commission/update-status"
        ]
      }
    });

  } catch (error) {
    console.error("Error in test connection:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
