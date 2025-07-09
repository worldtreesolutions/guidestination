
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Users } from "lucide-react"
import { Booking } from "@/services/customerService"

interface BookingCardProps {
  booking: Booking & {
    activities?: {
      title: string
      image_url?: string
      location?: string
    }
  }
  onViewDetails: (bookingId: string) => void
}

export default function BookingCard({ booking, onViewDetails }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "completed":
        return "secondary"
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-lg">
              {booking.activities?.title || "Activity"}
            </h4>
            {booking.activities?.location && (
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {booking.activities.location}
              </p>
            )}
          </div>
          <Badge variant={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Booking Date: {formatDate(booking.booking_date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{booking.participants} participant{booking.participants > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="text-lg font-bold text-blue-600">
            ฿{booking.total_amount.toLocaleString()}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(booking.id)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
