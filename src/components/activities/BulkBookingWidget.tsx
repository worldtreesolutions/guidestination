
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScheduledActivity } from "./ExcursionPlanner"
import { useRouter } from "next/router"
import { ShoppingCart, Trash2, CreditCard, Calendar } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"

interface BulkBookingWidgetProps {
  activities: ScheduledActivity[]
  onClearSelection: () => void
}

export const BulkBookingWidget = ({
  activities,
  onClearSelection
}: BulkBookingWidgetProps) => {
  const router = useRouter()
  const isMobile = useIsMobile()
  const totalPrice = activities.reduce((sum, activity) => sum + activity.price, 0)

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const handleBooking = () => {
    router.push("/checkout")
  }

  const totalActivities = activities.length
  const hasActivities = totalActivities > 0

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
        <div className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-primary" />
          <CardTitle className={isMobile ? "text-lg" : "text-xl"}>Réserver mes activités</CardTitle>
        </div>
        {isMobile && (
          <CardDescription className="text-xs">
            Réservez toutes vos activités en un clic
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4 pb-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2 text-primary" />
              <span className={`${isMobile ? "text-sm" : "text-base"} text-muted-foreground`}>
                Total ({totalActivities} activité{totalActivities !== 1 ? "s" : ""})
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
            aria-label={`Réserver ${totalActivities} activités pour un total de ${totalPrice} bahts`}
          >
            <span className="flex items-center justify-center">
              <Calendar className="h-4 w-4 mr-2 group-hover:animate-pulse" />
              Réserver {totalActivities} activité{totalActivities !== 1 ? "s" : ""}
            </span>
          </Button>
          
          {hasActivities && (
            <Button
              variant="outline"
              className="w-full"
              size={isMobile ? "default" : "default"}
              onClick={onClearSelection}
              aria-label="Effacer toutes les activités sélectionnées"
            >
              <Trash2 className="h-4 w-4 mr-2 text-red-500" />
              <span>Effacer la sélection</span>
            </Button>
          )}
          
          {!hasActivities && (
            <div className="text-center p-2 text-muted-foreground text-sm">
              <p>Ajoutez des activités à votre planning pour les réserver</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
