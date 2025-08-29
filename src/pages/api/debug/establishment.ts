import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { establishmentId } = req.query;

    if (!establishmentId) {
      return res.status(400).json({ error: "Missing establishmentId parameter" });
    }

    console.log(`🔍 Looking for establishment with ID: ${establishmentId}`);

    // First, let's check if any establishments exist at all
    const { data: allEstablishments, error: allError } = await supabase
      .from("establishments")
      .select("*")
      .limit(10);

    if (allError) {
      console.error("❌ Error fetching all establishments:", allError);
      return res.status(500).json({ error: "Database error", details: allError });
    }

    console.log(`📊 Found ${allEstablishments?.length || 0} establishments in database:`, 
      allEstablishments?.map(e => ({ 
        id: e.id, 
        fields: Object.keys(e),
        sample: JSON.stringify(e, null, 2).substring(0, 200) + "..."
      }))
    );

    // Now try to find the specific establishment
    const { data: specificEstablishment, error: specificError } = await supabase
      .from("establishments")
      .select("*")
      .eq("id", establishmentId as string)
      .single();

    if (specificError) {
      console.error(`❌ Error fetching establishment ${establishmentId}:`, specificError);
      
      // Try without the is_active filter to see if it exists but is inactive
      const { data: inactiveCheck, error: inactiveError } = await supabase
        .from("establishments")
        .select("*")
        .eq("id", establishmentId as string)
        .single();

      if (inactiveCheck) {
        console.log(`⚠️ Establishment ${establishmentId} exists but may be inactive:`, inactiveCheck);
        return res.status(200).json({
          found: true,
          establishment: inactiveCheck,
          note: "Establishment found but may be inactive"
        });
      }

      return res.status(404).json({ 
        error: "Establishment not found", 
        searchedId: establishmentId,
        allEstablishments: allEstablishments?.map(e => e.id),
        details: specificError 
      });
    }

    console.log(`✅ Found establishment ${establishmentId}:`, specificEstablishment);

    return res.status(200).json({
      found: true,
      establishment: specificEstablishment
    });

  } catch (error) {
    console.error("🚨 Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error", details: error });
  }
}
