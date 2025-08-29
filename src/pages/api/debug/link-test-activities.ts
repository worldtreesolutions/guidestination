import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const establishmentId = "69f5db76-7169-40ff-9eda-e45f79bd90ac";
    
    // First, let's check what activities exist
    const { data: existingActivities, error: activitiesError } = await supabase
      .from("activities")
      .select("id, title")
      .eq("is_active", true)
      .limit(3);

    if (activitiesError || !existingActivities || existingActivities.length === 0) {
      return res.status(404).json({ error: "No activities found in database" });
    }

    // Link the first 3 activities to the test establishment
    const linkPromises = existingActivities.map(activity => 
      supabase
        .from("establishment_activities")
        .insert({
          establishment_id: establishmentId,
          activity_id: activity.id
        })
    );

    const results = await Promise.all(linkPromises);
    
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error("Errors linking activities:", errors);
      return res.status(500).json({ error: "Failed to link some activities", details: errors });
    }

    return res.status(200).json({ 
      message: "Successfully linked activities to establishment",
      establishment_id: establishmentId,
      linked_activities: existingActivities.map(a => ({ id: a.id, title: a.title }))
    });

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
