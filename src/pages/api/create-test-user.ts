
import { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/integrations/supabase/client"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
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

    // Create customer entry
    const { error: customerError } = await supabase
      .from("customers")
      .insert({
        cus_id: authData.user.id,
        email: "testcustomer@guidestination.com",
        full_name: "John Doe",
        phone: "+1234567890",
        address: "123 Test Street, Test City",
        last_login: new Date().toISOString(),
        total_bookings: 0,
        total_spent: 0.00,
        is_active: true
      })

    if (customerError) {
      console.error("Customer creation error:", customerError)
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
    }

    res.status(200).json({ 
      message: "Test user created successfully",
      user: authData.user,
      credentials: {
        email: "testcustomer@guidestination.com",
        password: "testpassword123"
      }
    })
  } catch (error) {
    console.error("Error creating test user:", error)
    res.status(500).json({ error: "Failed to create test user" })
  }
}
