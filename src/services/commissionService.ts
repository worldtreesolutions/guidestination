
import { supabase } from "@/integrations/supabase/client"
import { Earning, CommissionInvoice } from "@/types/activity"

const BOOKINGS_TABLE = "bookings"
const ACTIVITIES_TABLE = "activities"

export const commissionService = {
  async fetchEarningsForOwner(ownerId: string): Promise<{
    total: number
    monthly: Earning[]
    pending: number
  }> {
    const {  activities, error: activitiesError } = await supabase
      .from(ACTIVITIES_TABLE)
      .select("id")
      .eq("owner_id", ownerId)

    if (activitiesError) {
      console.error("Error fetching activities for owner:", activitiesError)
      throw new Error(activitiesError.message)
    }

    if (!activities || activities.length === 0) {
      return { total: 0, monthly: [], pending: 0 }
    }

    const activityIds = activities.map((a: any) => a.id)

    const {  bookings, error: bookingsError } = await supabase
      .from(BOOKINGS_TABLE)
      .select("total_price, status, created_at")
      .in("activity_id", activityIds)

    if (bookingsError) {
      console.error("Error fetching bookings for earnings:", bookingsError)
      throw new Error(bookingsError.message)
    }

    if (!bookings) {
      return { total: 0, monthly: [], pending: 0 }
    }

    let total = 0
    let pending = 0
    const monthlyData: { [key: string]: number } = {}

    bookings.forEach((booking: any) => {
      if (booking.status === "confirmed") {
        total += booking.total_price
        const month = new Date(booking.created_at).toLocaleString("en-US", { month: "short" })
        monthlyData[month] = (monthlyData[month] || 0) + booking.total_price
      } else if (booking.status === "pending") {
        pending += booking.total_price
      }
    })

    const monthlyArray: Earning[] = Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return months.indexOf(a.month) - months.indexOf(b.month)
      })

    return { total, monthly: monthlyArray, pending }
  },

  async getCommissionStats() {
    // This is a placeholder. In a real app, you'd query your database.
    return {
      totalInvoices: 0,
      totalCommissionAmount: 0,
      paidInvoices: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      totalPaidAmount: 0,
      totalPendingAmount: 0,
    }
  },

  async getCommissionInvoice(invoiceId: string): Promise<CommissionInvoice | null> {
    // This is a placeholder.
    console.log("Fetching commission invoice:", invoiceId)
    return null
  },

  async updateInvoiceStatus(invoiceId: string, status: "pending" | "paid" | "overdue"): Promise<void> {
    // This is a placeholder.
    console.log(`Updating invoice ${invoiceId} to status ${status}`)
  },

  async createCommissionPayment(paymentData: any): Promise<void> {
    // This is a placeholder.
    console.log("Creating commission payment:", paymentData)
  },

  calculateCommission(amount: number, isQrBooking: boolean) {
    const platformRate = 0.20; // 20%
    const partnerShareRate = 0.50; // 50% of platform commission

    const platformCommissionAmount = amount * platformRate;
    let partnerCommissionAmount = 0;
    let providerReceives = amount - platformCommissionAmount;

    if (isQrBooking) {
      partnerCommissionAmount = platformCommissionAmount * partnerShareRate;
      // Provider payout is not affected by partner commission, that's on the platform
    }

    return {
      platformCommissionAmount,
      partnerCommissionAmount,
      providerReceives,
    };
  },
}
  