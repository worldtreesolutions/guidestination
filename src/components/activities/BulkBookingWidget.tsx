import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScheduledActivity } from "./ExcursionPlanner"
import { useRouter } from "next/router"
import { ShoppingCart, Trash2, CreditCard, Calendar } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import { SupabaseActivity } from "@/types/activity"
import Image from "next/image"

type ActivityItem = SupabaseActivity | ScheduledActivity;

interface BulkBookingWidgetProps {
  activities: ActivityItem[];
  onClearSelection: () => void;
}

const isScheduledActivity = (activity: ActivityItem): activity is ScheduledActivity => {
    return "day" in activity && typeof activity.day === "string";
};

export function BulkBookingWidget({ activities, onClearSelection }: BulkBookingWidgetProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { t } = useLanguage()
  
  const totalPrice = activities.reduce((sum, activity) => sum + (activity.price || 0), 0)

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const handleBooking = () => {
    router.push("/checkout")
  }

  const totalActivities = activities.length
  const hasActivities = totalActivities > 0

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Bulk Booking</CardTitle>
        <CardDescription>Book multiple activities at once</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
            <Image
              src={isScheduledActivity(activity) ? activity.imageUrl : (activity.image_url?.[0] || "/placeholder.svg")}
              alt={activity.title}
              width={80}
              height={80}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium">{activity.title}</h4>
              <p className="text-sm text-muted-foreground">
                {formatPrice(activity.price || 0)}
              </p>
            </div>
          </div>
        ))}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2 text-primary" />
              <span className={`${isMobile ? "text-sm" : "text-base"} text-muted-foreground`}>
                {t("booking.total")} ({totalActivities} {totalActivities !== 1 ? t("planner.activitiesSelected") : t("planner.activitySelected")})
              </span>
            </div>
            <motion.span 
              className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-primary`}
              initial={{ scale: 1 }}
              animate={{ scale: hasActivities ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              ฿{formatPrice(totalPrice)}
            </motion.span>
          </div>
          
          <Button
            className="w-full group relative overflow-hidden"
            size={isMobile ? "default" : "lg"}
            disabled={!hasActivities}
            onClick={handleBooking}
            aria-label={`${t("booking.bookActivities")} ${totalActivities} ${totalActivities !== 1 ? t("planner.activitiesSelected") : t("planner.activitySelected")} ${t("booking.total")} ${totalPrice} baht`}
          >
            <span className="flex items-center justify-center">
              <Calendar className="h-4 w-4 mr-2 group-hover:animate-pulse" />
              {totalActivities !== 1 ? t("booking.bookActivities") : t("booking.bookActivity")}
            </span>
          </Button>
          
          {hasActivities && (
            <Button
              variant="outline"
              className="w-full"
              size={isMobile ? "default" : "default"}
              onClick={onClearSelection}
              aria-label={t("booking.clearSelection")}
            >
              <Trash2 className="h-4 w-4 mr-2 text-red-500" />
              <span>{t("booking.clearSelection")}</span>
            </Button>
          )}
          
          {!hasActivities && (
            <div className="text-center p-2 text-muted-foreground text-sm">
              <p>{t("booking.addActivities")}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
