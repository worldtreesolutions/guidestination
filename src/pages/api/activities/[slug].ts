import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Activity slug is required" });
  }

  try {
    console.log(`🔍 Looking for activity with slug: ${slug}`);

    // Parse the slug to extract activity ID
    let activityId: number | null = null;

    // Check if slug follows the pattern "activity-{id}"
    const slugMatch = slug.match(/^activity-(\d+)$/);
    if (slugMatch) {
      activityId = parseInt(slugMatch[1]);
    } else if (!isNaN(parseInt(slug))) {
      // If slug is just a number, use it as ID
      activityId = parseInt(slug);
    }

    if (!activityId) {
      console.log(`❌ Invalid activity slug format: ${slug}`);
      return res.status(404).json({ error: "Activity not found" });
    }

    // Fetch activity from database
    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .select("*")
      .eq("id", activityId)
      .eq("is_active", true)
      .single();

    if (activityError || !activity) {
      console.log(`❌ Activity not found with ID: ${activityId}`, activityError);
      return res.status(404).json({ error: "Activity not found" });
    }

    console.log(`✅ Found activity: ${activity.title}`);

    // Fetch activity schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from("activity_schedules")
      .select("*")
      .eq("activity_id", activityId)
      .eq("is_active", true);

    if (schedulesError) {
      console.log("Warning: Failed to fetch schedules:", schedulesError);
    }

    // Fetch activity options using TypeScript schema: id, name, description, type
    console.log(`🔍 Fetching activity options for activity ID: ${activityId}`);
    const { data: selectedOptions, error: optionsError } = await supabase
      .from("activity_selected_options")
      .select("option_id")
      .eq("activity_id", activityId);

    console.log(`📊 Selected options result:`, { selectedOptions, optionsError });

    if (optionsError) {
      console.log("Warning: Failed to fetch activity selected options:", optionsError);
    }

    // Group options by type (ensure all possible types are mapped)
    const optionsByType: Record<string, string[]> = {
      highlights: [], // Map highlight -> highlights
      included: [],
      not_included: []
    };

    if (selectedOptions && selectedOptions.length > 0) {
      // Get the option IDs
      const optionIds = selectedOptions.map(item => item.option_id).filter(Boolean);
      console.log(`📋 Selected option IDs:`, optionIds);
      
      if (optionIds.length > 0) {
        // Fetch the actual options using wildcard to see actual schema
        console.log(`🔍 Fetching option details for IDs:`, optionIds);
        const { data: activityOptions, error: activityOptionsError } = await supabase
          .from("activity_options")
          .select("*")
          .in("id", optionIds);

        console.log(`📊 Activity options result:`, { activityOptions, activityOptionsError });

        if (activityOptionsError) {
          console.error(`❌ Error fetching activity options:`, activityOptionsError);
        } else if (activityOptions && activityOptions.length > 0) {
          console.log(`📋 Found ${activityOptions.length} activity options`);
          console.log(`📋 Sample activity option:`, activityOptions[0]);
          
          activityOptions.forEach(option => {
            const optionAny = option as any; // Cast to bypass incorrect TypeScript types
            const type = optionAny.type?.toLowerCase();
            
            // Map 'highlight' type to 'highlights' for consistency
            const mappedType = type === 'highlight' ? 'highlights' : type;
            
            if (mappedType && optionsByType[mappedType]) {
              // Use label field as the option text (actual database returns label)
              const optionText = optionAny.label || `Option ${optionAny.id}`;
              optionsByType[mappedType].push(optionText);
              console.log(`➕ Added option to ${mappedType}: ${optionText}`);
            } else {
              console.log(`⚠️ Unknown option type: ${type} (mapped to ${mappedType}) for option ID: ${optionAny.id}`);
            }
          });
        } else {
          console.log(`📋 No activity options found for the selected option IDs`);
        }
      } else {
        console.log(`📋 No valid option IDs found`);
      }
    } else {
      console.log(`📋 No selected options found for activity ${activityId}`);
    }

    console.log(`📋 Final options by type:`, optionsByType);

    // Transform the data to match frontend expectations
    const transformedActivity = {
      id: activity.id,
      slug: `activity-${activity.id}`,
      title: activity.title,
      description: activity.description,
      image_url: activity.image_url,
      pickup_location: activity.pickup_location,
      dropoff_location: activity.dropoff_location,
      discounts: activity.discounts || 0,
      max_participants: activity.max_participants,
      // Keep original static content
      highlights: activity.highlights || "Great experience\nProfessional service\nMemorable moments",
      included: activity.included || "Professional guide\nAll necessary equipment",
      not_included: activity.not_included || "Personal expenses\nTips\nMeals (unless specified)",
      // Add dynamic content from database
      dynamic_highlights: optionsByType.highlights.join('\n'),
      dynamic_included: optionsByType.included.join('\n'),
      dynamic_not_included: optionsByType.not_included.join('\n'),
      b_price: activity.b_price,
      final_price: activity.final_price || activity.b_price || 0,
      currency_code: activity.currency_code || "THB",
      average_rating: activity.average_rating || 4.5,
      review_count: activity.review_count || 0,
      instant_booking: activity.instant_booking,
      is_active: activity.is_active,
      created_at: activity.created_at,
      updated_at: activity.updated_at,
      category: activity.category,
      location: activity.address || "Thailand",
      duration: activity.duration || "half_day",
      languages: activity.languages || "english_thai",
      requirements: "No special requirements",
      cancellation_policy: activity.cancellation_policy || "Free cancellation up to 24 hours before activity start",
      provider_contact: "+66 123 456 789",
      meeting_point: activity.meeting_point || "To be confirmed",
      what_to_bring: "Comfortable clothing\nCamera\nWater bottle",
      activity_schedules: schedules || [],
      reviews: []
    };

    console.log(`✅ Returning transformed activity with enhanced options`);
    console.log(`📋 Static highlights: ${transformedActivity.highlights ? transformedActivity.highlights.substring(0, 100) : 'None'}...`);
    console.log(`📋 Dynamic highlights: ${transformedActivity.dynamic_highlights || 'None'}`);
    console.log(`📋 Static included: ${transformedActivity.included ? transformedActivity.included.substring(0, 100) : 'None'}...`);
    console.log(`📋 Dynamic included: ${transformedActivity.dynamic_included || 'None'}`);
    console.log(`📋 Static not_included: ${transformedActivity.not_included ? transformedActivity.not_included.substring(0, 100) : 'None'}...`);
    console.log(`📋 Dynamic not_included: ${transformedActivity.dynamic_not_included || 'None'}`);
    
    return res.status(200).json(transformedActivity);

  } catch (error) {
    console.error("❌ API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}