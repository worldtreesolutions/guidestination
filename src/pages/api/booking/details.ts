import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    // Get checkout session details
    const { data: checkoutSession, error: sessionError } = await supabase
      .from("stripe_checkout_sessions")
      .select("*")
      .eq("stripe_session_id", session_id)
      .single();

    if (sessionError || !checkoutSession) {
      return res.status(404).json({ error: "Checkout session not found" });
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        customer_name,
        customer_email,
        participants,
        total_amount,
        created_at,
        activities (
          title,
          description
        )
      `)
      .eq("activity_id", checkoutSession.activity_id)
      .eq("total_amount", checkoutSession.amount)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const bookingDetails = {
      id: booking.id,
      activityName: booking.activities?.title || "Activity",
      participants: booking.participants,
      totalAmount: booking.total_amount,
      bookingDate: booking.created_at,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
    };

    res.status(200).json(bookingDetails);
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to fetch booking details" 
    });
  }
}