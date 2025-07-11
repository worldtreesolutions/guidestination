import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Booking } from "@/types/activity"
import { format } from "date-fns"

interface RecentBookingsProps {
  bookings: Booking[]
}

export default function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>
          You have {bookings.length} recent bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage
                  src={`/avatars/${booking.customer_name?.charAt(0)}.png`}
                  alt="Avatar"
                />
                <AvatarFallback>
                  {booking.customer_name
                    ? booking.customer_name.charAt(0).toUpperCase()
                    : "N/A"}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  {booking.customer_name || "Guest"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {booking.activities?.title || "Activity"} -{" "}
                  {booking.booking_date
                    ? format(new Date(booking.booking_date), "PPP")
                    : "N/A"}
                </p>
              </div>
              <div className="ml-auto font-medium">
                +${(booking.total_price ?? 0).toFixed(2)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No recent bookings.</p>
        )}
      </CardContent>
    </Card>
  )
}
