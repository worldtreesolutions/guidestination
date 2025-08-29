import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, Phone, Mail } from "lucide-react"
import { Booking } from "@/types/activity"
import { useCurrency } from "@/context/CurrencyContext";
import { formatCurrency } from "@/utils/currency";
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"

interface BookingDetailsModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  const { t } = useLanguage();
  const { currency, convert } = useCurrency();
  
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
          <DialogTitle>{t('profile.bookingDetails.title')}</DialogTitle>
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
                {t(`profile.bookingDetails.status.${booking.status || "pending"}`)}
              </Badge>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              {booking.activities?.title || t('profile.bookingDetails.labels.unknownActivity')}
            </h2>
            <p className="text-muted-foreground">
              {booking.activities?.description || t('profile.bookingDetails.labels.noDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {t('profile.bookingDetails.labels.bookingDate')}: {new Date(booking.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {t('profile.bookingDetails.labels.participants')}: {booking.participants || 1}
                </span>
              </div>
              {/* Pickup Location */}
              {booking.activities?.pickup_location_formatted_address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('profile.bookingDetails.labels.pickupLocation')}: {booking.activities.pickup_location_formatted_address}
                  </span>
                </div>
              )}
              {/* Meeting Point */}
              {booking.activities?.meeting_point && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('profile.bookingDetails.labels.meetingPoint')}: {booking.activities.meeting_point}
                  </span>
                </div>
              )}
              {/* Activity Provider/Owner */}
              {(booking.activities?.provider_name || booking.activities?.provider_email || booking.activities?.provider_phone) && (
                <div className="flex flex-col gap-1 mt-2">
                  {booking.activities?.provider_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {t('profile.bookingDetails.labels.activityProvider')}: {booking.activities.provider_name}
                      </span>
                    </div>
                  )}
                  {booking.activities?.provider_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{booking.activities.provider_email}</span>
                    </div>
                  )}
                  {booking.activities?.provider_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{booking.activities.provider_phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="text-sm">
                <span className="font-medium">{t('profile.bookingDetails.labels.totalAmount')}:</span>
                <span className="ml-2 text-lg font-semibold">
                  {formatCurrency(
                    convert(booking.total_amount || booking.total_price || 0, currency),
                    currency
                  )}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{t('profile.bookingDetails.labels.bookingId')}:</span>
                <span className="ml-2 font-mono text-xs">
                  {booking.id}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t('profile.bookingDetails.buttons.close')}
            </Button>
            {booking.status === "confirmed" && (
              <Button variant="destructive">
                {t('profile.bookingDetails.buttons.cancelBooking')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
