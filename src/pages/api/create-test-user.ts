
import { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/integrations/supabase/client"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // First, clean up any existing test user
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.email === "testcustomer@guidestination.com")
    
    if (existingUser) {
      await supabase.auth.admin.deleteUser(existingUser.id)
      // Also clean up profile data
      await supabase.from("customer_profiles").delete().eq("email", "testcustomer@guidestination.com")
    }

    // Create test user with Supabase Auth using admin client
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "testcustomer@guidestination.com",
      password: "testpassword123",
      email_confirm: true,
      user_metadata: {
        first_name: "John",
        last_name: "Doe"
      }
    })

    if (authError) {
      console.error("Auth error:", authError)
      return res.status(400).json({ error: authError.message })
    }

    if (!authData.user) {
      return res.status(400).json({ error: "Failed to create user" })
    }

    // Create customer profile
    const { error: profileError } = await supabase
      .from("customer_profiles")
      .insert({
        customer_id: authData.user.id,
        email: "testcustomer@guidestination.com",
        first_name: "John",
        last_name: "Doe",
        full_name: "John Doe",
        phone: "+1234567890",
        date_of_birth: "1990-01-15",
        user_id: authData.user.id
      })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return res.status(400).json({ error: profileError.message })
    }

    // Create some sample bookings for testing
    const { data: activities } = await supabase
      .from("activities")
      .select("id")
      .limit(3)

    if (activities && activities.length > 0) {
      const sampleBookings = activities.map((activity, index) => ({
        customer_id: authData.user.id,
        activity_id: activity.id,
        customer_name: "John Doe",
        customer_email: "testcustomer@guidestination.com",
        customer_phone: "+1234567890",
        booking_date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
        participants: index + 1,
        total_amount: (index + 1) * 1500,
        status: index === 0 ? "confirmed" as const : index === 1 ? "completed" as const : "pending" as const
      }))

      await supabase.from("bookings").insert(sampleBookings)
    }

    // Create some sample wishlist items
    if (activities && activities.length > 1) {
      const wishlistItems = activities.slice(0, 2).map(activity => ({
        customer_id: authData.user.id,
        activity_id: activity.id
      }))

      await supabase.from("wishlist").insert(wishlistItems)
    }

    res.status(200).json({ 
      message: "Test user created successfully with sample data.",
      user: authData.user,
      credentials: {
        email: "testcustomer@guidestination.com",
        password: "testpassword123"
      },
      note: "Customer profile created successfully. You can now log in and test the profile system."
    })
  } catch (error) {
    console.error("Error creating test user:", error)
    res.status(500).json({ error: "Failed to create test user" })
  }
}
