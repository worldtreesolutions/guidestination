import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { bookingService } from "@/services/bookingService"
import { Booking } from "@/types/activity"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function BookingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookings = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const ownerBookings = await bookingService.fetchBookingsForOwner(user.id);
          setBookings(ownerBookings);
        } catch (error: any) {
          console.error(error.message);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchBookings()
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Manage Bookings - Guidestination</title>
        <meta name="description" content="Manage your activity bookings" />
      </Head>

      <Navbar />

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage your customer reservations
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.activityTitle}</TableCell>
                    <TableCell>
                      <div>{booking.customerName}</div>
                      <div className="text-xs text-muted-foreground">{booking.customerEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div>{new Date(booking.date || booking.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{booking.bookingTime}</div>
                    </TableCell>
                    <TableCell>{booking.num_participants}</TableCell>
                    <TableCell>
                      <div>฿{(booking.providerAmount || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        After {(((booking.platformFee || 0) / (booking.totalAmount || 1)) * 100).toFixed(0)}% fee
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)} variant="outline">
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800 hover:bg-green-100/80";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
    case "completed":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100/80";
    default:
      return "";
  }
}
