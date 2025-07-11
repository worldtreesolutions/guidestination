import { NextApiRequest, NextApiResponse } from "next"
    import { getAdminClient } from "@/integrations/supabase/admin"

    const supabaseAdmin = getAdminClient()

    interface Invoice {
        id: string;
        total_booking_amount: number;
        platform_commission_amount: number;
        partner_commission_amount: number | null;
        invoice_status: string;
    }

    interface Provider {
        id: string;
        business_name: string;
        email: string;
        created_at: string;
        commission_invoices: Invoice[];
    }

    export default async function handler(
      req: NextApiRequest,
      res: NextApiResponse
    ) {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: "Supabase admin client not initialized" })
      }

      if (req.method === "GET") {
        try {
          const provider_id = req.query.provider_id as string | undefined;

          // Get providers with filters
          let query = supabaseAdmin.from("activity_owners").select("id, business_name, email, created_at");

          if (provider_id) {
            query = query.eq("id", provider_id as string);
          }

          const { data: providers, error } = await query;

          if (error) {
            console.error("Error fetching providers:", error);
            return res.status(500).json({ error: "Failed to fetch providers" });
          }

          res.status(200).json(providers as Provider[]);
        } catch (error) {
          console.error("Error in /api/admin/commission/providers:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      } else {
        res.setHeader("Allow", ["GET"])
        res.status(405).end(`Method ${req.method} Not Allowed`)
      }
    }
  
