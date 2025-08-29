import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currency';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { Booking } from "@/types/activity"
import Image from "next/image"
import { useLanguage } from "@/contexts/LanguageContext"

interface BookingCardProps {
  booking: Booking;
  onViewDetails?: (booking: Booking) => void;
}

export default function BookingCard({ booking, onViewDetails }: BookingCardProps) {
  const { currency, convert } = useCurrency();
  const { t } = useLanguage();
  
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
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
      <CardHeader>
        <CardTitle className="line-clamp-2">
          {booking.activities?.title || t('profile.bookingDetails.labels.unknownActivity')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(booking.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{booking.participants || 1} {t('profile.bookingDetails.labels.participantsCount')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{booking.activities?.meeting_point || t('profile.bookingDetails.labels.locationTBD')}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-lg font-semibold">
            {formatCurrency(
              convert(booking.total_amount || booking.total_price || 0, currency),
              currency
            )}
          </span>
          <Button variant="outline" size="sm" onClick={() => onViewDetails && onViewDetails(booking)}>
            {t('profile.bookingDetails.buttons.viewDetails')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
