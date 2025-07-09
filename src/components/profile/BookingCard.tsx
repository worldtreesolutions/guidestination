import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Users, Eye } from "lucide-react"
import { Booking } from "@/services/customerService"
import Image from "next/image"

interface BookingCardProps {
  booking: Booking
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
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {booking.activities?.image_url && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={booking.activities.image_url}
                alt={booking.activities.title || "Activity"}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg truncate">
                {booking.activities?.title || "Activity"}
              </h3>
              <Badge variant={getStatusColor(booking.status)} className="ml-2">
                {booking.status}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(booking.booking_date)}</span>
              </div>
              
              {booking.activities?.pickup_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{booking.activities.pickup_location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{booking.participants} participant{booking.participants > 1 ? "s" : ""}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">
                ฿{booking.total_amount.toLocaleString()}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails(booking.id)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
