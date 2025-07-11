import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Navbar from "@/components/layout/Navbar"
import { useAuth } from "@/contexts/AuthContext"
import { Booking } from "@/types/activity"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          activities (
            title,
            image_url
          )
        `
        )
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setBookings((data as Booking[]) || [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user, fetchBookings])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading bookings...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.activities?.title || "Activity"}
                      </TableCell>
                      <TableCell>
                        {booking.customer_name || "Guest"}
                      </TableCell>
                      <TableCell>
                        {booking.booking_date
                          ? format(new Date(booking.booking_date), "PPP")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {booking.participants || 1}
                      </TableCell>
                      <TableCell>
                        ฿{(booking.total_price || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status || "pending")} variant="outline">
                          {booking.status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
