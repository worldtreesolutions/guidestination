
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Booking } from "@/services/activityService"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface RecentBookingsProps {
  bookings: Booking[]
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>
            Your most recent activity bookings
          </CardDescription>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/bookings">
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-semibold">No bookings yet</h3>
            <p className="text-sm text-muted-foreground">
              You don't have any bookings for your activities yet.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.activityTitle}</TableCell>
                  <TableCell>{booking.customerName}</TableCell>
                  <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
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
                  <TableCell>{booking.totalPrice.toLocaleString()} THB</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
