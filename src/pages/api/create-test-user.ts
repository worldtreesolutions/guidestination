
import { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    const testEmail = "testcustomer@guidestination.com"
    const testPassword = "testpassword123"

    // First, clean up any existing test user
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.email === testEmail)
    
    if (existingUser) {
      console.log("Deleting existing user:", existingUser.id)
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id)
      // Also clean up profile data
      await supabaseAdmin.from("customer_profiles").delete().eq("email", testEmail)
      await supabaseAdmin.from("bookings").delete().eq("customer_email", testEmail)
      await supabaseAdmin.from("wishlist").delete().eq("customer_id", existingUser.id)
    }

    // Create test user with Supabase Auth using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
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

    console.log("Created user:", authData.user.id)

    // Create customer profile
    const { error: profileError } = await supabaseAdmin
      .from("customer_profiles")
      .insert({
        customer_id: authData.user.id,
        email: testEmail,
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

    console.log("Created customer profile")

    // Create some sample bookings for testing
    const { data: activities } = await supabaseAdmin
      .from("activities")
      .select("id")
      .limit(3)

    if (activities && activities.length > 0) {
      const sampleBookings = activities.map((activity, index) => ({
        customer_id: authData.user.id,
        activity_id: activity.id,
        customer_name: "John Doe",
        customer_email: testEmail,
        customer_phone: "+1234567890",
        booking_date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
        participants: index + 1,
        total_amount: (index + 1) * 1500,
        status: index === 0 ? "confirmed" as const : index === 1 ? "completed" as const : "pending" as const
      }))

      const { error: bookingError } = await supabaseAdmin.from("bookings").insert(sampleBookings)
      if (bookingError) {
        console.error("Booking creation error:", bookingError)
      } else {
        console.log("Created sample bookings")
      }
    }

    // Create some sample wishlist items
    if (activities && activities.length > 1) {
      const wishlistItems = activities.slice(0, 2).map(activity => ({
        customer_id: authData.user.id,
        activity_id: activity.id
      }))

      const { error: wishlistError } = await supabaseAdmin.from("wishlist").insert(wishlistItems)
      if (wishlistError) {
        console.error("Wishlist creation error:", wishlistError)
      } else {
        console.log("Created wishlist items")
      }
    }

    // Verify user was created
    const { data: verifyUser } = await supabaseAdmin.auth.admin.getUserById(authData.user.id)
    console.log("Verified user exists:", verifyUser.user?.email)

    res.status(200).json({ 
      message: "Test user created successfully with sample data.",
      user: authData.user,
      credentials: {
        email: testEmail,
        password: testPassword
      },
      note: "Customer profile created successfully. You can now log in and test the profile system."
    })
  } catch (error) {
    console.error("Error creating test user:", error)
    res.status(500).json({ error: "Failed to create test user", details: error })
  }
}
