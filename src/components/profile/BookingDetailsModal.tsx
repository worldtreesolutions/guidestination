
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, CreditCard } from "lucide-react"
import { Booking } from "@/services/customerService"
import Image from "next/image"

interface BookingDetailsModalProps {
  booking: Booking | null
  isOpen: boolean
  onClose: () => void
}

export default function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  if (!booking) return null

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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            Complete information about your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {booking.activities?.image_url && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={booking.activities.image_url}
                alt={booking.activities.title || "Activity"}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {booking.activities?.title || "Activity"}
              </h3>
              {booking.activities?.location && (
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {booking.activities.location}
                </p>
              )}
            </div>
            <Badge variant={getStatusColor(booking.status)} className="text-sm">
              {booking.status.toUpperCase()}
            </Badge>
          </div>

          {booking.activities?.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-600">{booking.activities.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Booking Date</p>
                  <p className="text-gray-600">{formatDate(booking.booking_date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-gray-600">{formatTime(booking.booking_date)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Participants</p>
                  <p className="text-gray-600">{booking.participants} person{booking.participants > 1 ? "s" : ""}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Total Amount</p>
                  <p className="text-gray-600 font-semibold">฿{booking.total_amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Booking ID: {booking.id}</span>
              <span>Booked on: {formatDate(booking.created_at)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} className="flex-1">
              Close
            </Button>
            {booking.status === "confirmed" && (
              <Button variant="outline" className="flex-1">
                Contact Support
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
