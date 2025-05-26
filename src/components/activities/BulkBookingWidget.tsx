
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScheduledActivity } from "./ExcursionPlanner"
import { useRouter } from "next/router"
import { ShoppingCart, Trash2, CreditCard, Calendar } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import { Activity } from "@/types/activity"

interface BulkBookingWidgetProps {
  activities: (Activity | ScheduledActivity)[]
  onClearSelection: () => void
}

// Function to convert Activity to ScheduledActivity format
const convertToScheduledActivity = (activity: Activity): ScheduledActivity => {
  return {
    id: activity.activity_id?.toString() || "",
    title: activity.title,
    imageUrl: typeof activity.image_url === 'string' ? activity.image_url : "",
    day: "",
    hour: 0,
    duration: 2, // Default duration
    price: activity.final_price || activity.b_price || 0,
    participants: 1 // Default participants
  }
}

// Function to check if an activity is a ScheduledActivity
const isScheduledActivity = (activity: any): activity is ScheduledActivity => {
  return 'imageUrl' in activity && 'day' in activity && 'hour' in activity;
}

export const BulkBookingWidget = ({
  activities,
  onClearSelection
}: BulkBookingWidgetProps) => {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { t } = useLanguage()
  
  // Convert activities to ScheduledActivity format if needed
  const formattedActivities: ScheduledActivity[] = activities.map(activity => {
    if (isScheduledActivity(activity)) {
      return activity as ScheduledActivity;
    }
    return convertToScheduledActivity(activity as Activity);
  });
  
  const totalPrice = formattedActivities.reduce((sum, activity) => sum + activity.price, 0)

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const handleBooking = () => {
    router.push("/checkout")
  }

  const totalActivities = formattedActivities.length
  const hasActivities = totalActivities > 0

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-primary" />
          <CardTitle className={isMobile ? "text-lg" : "text-xl"}>{t("booking.title")}</CardTitle>
        </div>
        {isMobile && (
          <CardDescription className="text-xs">
            {t("booking.description")}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4 pb-6">
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
