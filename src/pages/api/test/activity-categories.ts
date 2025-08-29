import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🔍 Checking activity_categories table structure...");

    // Try to query the activity_categories table
    const { data: activityCategories, error: activityCategoriesError } = await supabase
      .from("activity_categories")
      .select("*")
      .limit(5);

    if (activityCategoriesError) {
      console.error("Error querying activity_categories:", activityCategoriesError);
      return res.status(500).json({ 
        error: "activity_categories table error", 
        details: activityCategoriesError 
      });
    }

    // Try to query with join to categories table
    const { data: joinedData, error: joinError } = await supabase
      .from("activity_categories")
      .select(`
        *,
        categories (
          id,
          name,
          description
        )
      `)
      .limit(3);

    if (joinError) {
      console.error("Error joining with categories:", joinError);
    }

    return res.status(200).json({
      success: true,
      activity_categories_count: activityCategories?.length || 0,
      sample_data: activityCategories?.slice(0, 3),
      joined_data: joinedData?.slice(0, 3),
      join_error: joinError || null
    });

  } catch (error) {
    console.error("Test error:", error);
    return res.status(500).json({ error: "Internal server error", details: error });
  }
}
