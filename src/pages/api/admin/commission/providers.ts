
    import { NextApiRequest, NextApiResponse } from "next"
    import { createAdminClient } from "@/integrations/supabase/admin"

    const supabaseAdmin = createAdminClient()

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
          const {  providers, error } = await supabaseAdmin
            .from("activity_owners")
            .select(
              `
              id,
              business_name,
              email,
              created_at,
              commission_invoices (
                id,
                total_booking_amount,
                platform_commission_amount,
                partner_commission_amount,
                invoice_status
              )
            `
            )
            .order("created_at", { ascending: false })

          if (error) {
            console.error("Error fetching providers:", error)
            return res.status(500).json({ error: error.message })
          }

          const enhancedProviders = (providers as Provider[]).map(provider => {
            const totalRevenue = provider.commission_invoices.reduce(
              (sum: number, inv: Invoice) => sum + inv.total_booking_amount,
              0
            )
            const totalPlatformCommission = provider.commission_invoices.reduce(
              (sum: number, inv: Invoice) => sum + inv.platform_commission_amount,
              0
            )
            const totalPartnerCommission = provider.commission_invoices.reduce(
              (sum: number, inv: Invoice) => sum + (inv.partner_commission_amount || 0),
              0
            )

            return {
              id: provider.id,
              business_name: provider.business_name,
              email: provider.email,
              joined_date: provider.created_at,
              total_invoices: provider.commission_invoices.length,
              total_revenue: totalRevenue,
              total_platform_commission: totalPlatformCommission,
              total_partner_commission: totalPartnerCommission,
              paid_invoices: provider.commission_invoices.filter(
                (inv: Invoice) => inv.invoice_status === "paid"
              ).length,
              pending_invoices: provider.commission_invoices.filter(
                (inv: Invoice) => inv.invoice_status === "pending"
              ).length,
            }
          })

          return res.status(200).json(enhancedProviders)
        } catch (err) {
          console.error("API Error:", err)
          const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
          return res.status(500).json({ error: errorMessage })
        }
      } else {
        res.setHeader("Allow", ["GET"])
        res.status(405).end(`Method ${req.method} Not Allowed`)
      }
    }
  