
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useAuth } from "@/contexts/AuthContext"
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout"
import { activityService, Booking } from "@/services/activityService"
import { useToast } from "@/hooks/use-toast"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  Check, 
  X, 
  Calendar, 
  Clock, 
  Users, 
  CreditCard 
} from "lucide-react"

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dashboard/login")
      return
    }

    const fetchBookings = async () => {
      if (!user) return
      
      try {
        const bookingsData = await activityService.getBookingsByProvider(user.id)
        setBookings(bookingsData)
      } catch (error) {
        console.error("Error fetching bookings:", error)
        toast({
          title: "Error",
          description: "Failed to load bookings. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [user, isAuthenticated, router, toast])

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      await activityService.updateBookingStatus(bookingId, status)
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status } : booking
      ))
      toast({
        title: "Status updated",
        description: `Booking status updated to ${status}.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading bookings...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <>
      <Head>
        <title>Manage Bookings - Provider Dashboard</title>
        <meta name="description" content="Manage your activity bookings" />
      </Head>

      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">
              View and manage all bookings for your activities.
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">No bookings yet</h3>
              <p className="text-sm text-muted-foreground">
                You don't have any bookings for your activities yet.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.activityTitle}</TableCell>
                      <TableCell>{booking.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="mr-2 h-3 w-3" />
                          {booking.timeSlot}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          {booking.participants}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                          {booking.totalPrice.toLocaleString()} THB
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : booking.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Confirm
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleStatusChange(booking.id, 'cancelled')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  )
}
