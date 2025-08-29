import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

interface TrackVisitRequest {
  establishmentId: string;
  establishmentName: string;
  timestamp: string;
  userAgent?: string;
  referrer?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      establishmentId,
      establishmentName,
      timestamp,
      userAgent,
      referrer
    }: TrackVisitRequest = req.body;

    // Validate required fields
    if (!establishmentId || !establishmentName || !timestamp) {
      return res.status(400).json({ 
        error: "Missing required fields: establishmentId, establishmentName, timestamp" 
      });
    }

    // Get client IP address
    const clientIp = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     'unknown';

    // Insert referral visit record
    const { data, error } = await supabase
      .from("referral_visits")
      .insert({
        establishment_id: establishmentId,
        establishment_name: establishmentName,
        visited_at: timestamp,
        ip_address: Array.isArray(clientIp) ? clientIp[0] : clientIp,
        user_agent: userAgent,
        referrer: referrer || null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Error tracking referral visit:", error);
      return res.status(500).json({ error: "Failed to track visit" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Referral visit tracked successfully" 
    });
  } catch (error) {
    console.error("Error in track-visit API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
