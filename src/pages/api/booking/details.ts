import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { session_id } = req.query;

  if (!session_id) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    // For now, return mock data since we're testing
    // In production, this would query your database
    const mockBookingDetails = {
      id: `booking_${session_id}`,
      activityName: "Test Activity",
      participants: 2,
      totalAmount: 103.20, // $100 + $3.20 Stripe fee
      bookingDate: new Date().toISOString(),
      customerName: "Test Customer",
      customerEmail: "test@example.com",
    };

    res.status(200).json(mockBookingDetails);
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to fetch booking details" 
    });
  }
}
