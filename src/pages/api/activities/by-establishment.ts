import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { establishmentId } = req.query;

  if (!establishmentId || typeof establishmentId !== "string") {
    return res.status(400).json({ error: "Establishment ID is required" });
  }

  try {
    console.log(`🔍 Fetching activities for establishment: ${establishmentId}`);

    // First try to get activities through the junction table
    const { data: establishmentActivities, error: establishmentActivitiesError } = await supabase
      .from("establishment_activities")
      .select("activity_id")
      .eq("establishment_id", establishmentId);

    let activityIds: number[] = [];
    
    if (establishmentActivitiesError) {
      console.log("Warning: establishment_activities query failed:", establishmentActivitiesError);
    } else if (establishmentActivities && establishmentActivities.length > 0) {
      activityIds = establishmentActivities.map(ea => ea.activity_id);
      console.log(`Found ${activityIds.length} activity IDs linked to establishment`);
    }

    let activities: any[] = [];

    // If we have specific activity IDs, fetch those activities
    if (activityIds.length > 0) {
      const { data: specificActivities, error: specificError } = await supabase
        .from("activities")
        .select("*")
        .in("id", activityIds)
        .eq("is_active", true);

      if (specificError) {
        console.error("Error fetching specific activities:", specificError);
      } else {
        activities = specificActivities || [];
      }
    }

    // If no activities found, try provider_id match
    if (activities.length === 0) {
      console.log("No junction table activities found, trying provider_id match");
      
      const { data: providerActivities, error: providerError } = await supabase
        .from("activities")
        .select("*")
        .eq("provider_id", establishmentId)
        .eq("is_active", true);

      if (providerError) {
        console.log("Provider activities query failed:", providerError);
      } else {
        activities = providerActivities || [];
      }
    }

    // If no activities found, return empty array
    if (activities.length === 0) {
      console.log(`No activities found for establishment ${establishmentId}`);
      return res.status(200).json([]);
    }

    // Fetch activity options for all activities
    const allActivityIds = activities.map(activity => activity.id);
    
    // Group options by activity
    const activityOptionsMap: Record<number, Record<string, string[]>> = {};
    
    // Fetch selected options for all activities
    const { data: allSelectedOptions, error: allOptionsError } = await supabase
      .from("activity_selected_options")
      .select("activity_id, option_id")
      .in("activity_id", allActivityIds);

    if (allOptionsError) {
      console.error(`Error fetching activity selected options:`, allOptionsError);
    }

    if (allSelectedOptions && allSelectedOptions.length > 0) {
      // Get all option IDs
      const allOptionIds = allSelectedOptions.map(item => item.option_id).filter(Boolean);
      
      if (allOptionIds.length > 0) {
        // Fetch the actual options
        const { data: activityOptions, error: activityOptionsError } = await supabase
          .from("activity_options")
          .select("id, name, description, type")
          .in("id", allOptionIds);

        if (activityOptionsError) {
          console.error(`Error fetching activity options:`, activityOptionsError);
        } else if (activityOptions) {
          // Create options map by option ID
          const optionsById: Record<number, any> = {};
          activityOptions.forEach(option => {
            optionsById[option.id] = option;
          });

          // Group options by activity and type
          allSelectedOptions.forEach(selectedOption => {
            const activityId = selectedOption.activity_id;
            const option = optionsById[selectedOption.option_id];
            
            if (option && option.type) {
              if (!activityOptionsMap[activityId]) {
                activityOptionsMap[activityId] = {
                  highlights: [],
                  included: [],
                  not_included: []
                };
              }
              
              const type = option.type.toLowerCase();
              if (activityOptionsMap[activityId][type]) {
                const optionText = option.description || option.name;
                activityOptionsMap[activityId][type].push(optionText);
              }
            }
          });
        }
      }
    }

    // Transform the data to ensure proper format for the frontend
    const transformedActivities = activities.map(activity => {
      // Get activity options for this specific activity
      const activityOptions = activityOptionsMap[activity.id] || {
        highlights: [],
        included: [],
        not_included: []
      };

      return {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        image_url: activity.image_url,
        pickup_location: activity.pickup_location,
        dropoff_location: activity.dropoff_location,
        discounts: activity.discounts,
        max_participants: activity.max_participants,
        // Combine existing field values with database options
        highlights: [
          ...(activity.highlights ? activity.highlights.split('\n').filter(Boolean) : []),
          ...activityOptions.highlights
        ].join('\n') || activity.highlights || "Great experience\nProfessional service\nMemorable moments",
        included: [
          ...(activity.included ? activity.included.split('\n').filter(Boolean) : []),
          ...activityOptions.included
        ].join('\n') || activity.included || "Professional guide\nAll necessary equipment",
        not_included: [
          ...(activity.not_included ? activity.not_included.split('\n').filter(Boolean) : []),
          ...activityOptions.not_included
        ].join('\n') || activity.not_included || "Personal expenses\nTips\nMeals (unless specified)",
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
        duration: activity.duration || "half_day",
        languages: activity.languages || "english_thai",
        cancellation_policy: activity.cancellation_policy || "Free cancellation up to 24 hours before activity start",
        meeting_point: activity.meeting_point || "To be confirmed",
        provider_id: activity.provider_id,
        address: activity.address,
        place_id: activity.place_id,
        location_lat: activity.location_lat,
        location_lng: activity.location_lng,
        
        // Additional fields for frontend compatibility
        establishment_id: establishmentId,
        slug: `activity-${activity.id}`, // Generate slug from ID since slug field doesn't exist
        categories: activity.category ? { name: activity.category } : null,
        requirements: "No special requirements",
        provider_contact: "+66 123 456 789",
        what_to_bring: "Comfortable clothing\nCamera\nWater bottle",
        location: activity.address || "Thailand"
      };
    });

    console.log(`✅ Found ${transformedActivities.length} activities for establishment ${establishmentId}`);

    return res.status(200).json(transformedActivities);

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
