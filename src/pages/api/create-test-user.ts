
import { NextApiRequest, NextApiResponse } from "next"
import { supabase } from "@/integrations/supabase/client"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  try {
    // Create test user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "testcustomer@guidestination.com",
      password: "testpassword123",
      options: {
        data: {
          first_name: "John",
          last_name: "Doe"
        }
      }
    })

    if (authError) {
      console.error("Auth error:", authError)
      return res.status(400).json({ error: authError.message })
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
