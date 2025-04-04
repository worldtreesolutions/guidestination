
import { Booking } from "@/services/activityService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface RecentBookingsProps {
  bookings: Booking[];
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
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
  };

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>
          Your most recent customer bookings
        </CardDescription>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.activityTitle}</TableCell>
                <TableCell>{booking.customerName}</TableCell>
                <TableCell>{new Date(booking.date).toLocaleDateString()} at {booking.time}</TableCell>
                <TableCell>{booking.participants}</TableCell>
                <TableCell>฿{booking.providerAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)} variant="outline">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
