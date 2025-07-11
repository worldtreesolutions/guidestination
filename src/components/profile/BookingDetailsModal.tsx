import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, Phone, Mail } from "lucide-react"
import { Booking } from "@/types/activity"
import Image from "next/image"

interface BookingDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="relative h-48 w-full rounded-lg overflow-hidden">
            <Image
              src={booking.activities?.image_url || "/placeholder-activity.jpg"}
              alt={booking.activities?.title || "Activity"}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge className={getStatusColor(booking.status || "pending")}>
                {booking.status || "pending"}
              </Badge>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              {booking.activities?.title || "Unknown Activity"}
            </h2>
            <p className="text-muted-foreground">
              {booking.activities?.description || "No description available"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Booking Date: {new Date(booking.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Participants: {booking.participants || 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Location: {booking.activities?.meeting_point || "Location TBD"}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">Total Amount:</span>
                <span className="ml-2 text-lg font-semibold">
                  ${booking.total_amount || booking.total_price || 0}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Booking ID:</span>
                <span className="ml-2 font-mono text-xs">
                  {booking.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {booking.status === "confirmed" && (
              <Button variant="destructive">
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
