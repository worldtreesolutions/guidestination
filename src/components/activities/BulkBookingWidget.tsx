
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScheduledActivity } from "./ExcursionPlanner"

interface BulkBookingWidgetProps {
  activities: ScheduledActivity[]
  onClearSelection: () => void
}

export const BulkBookingWidget = ({
  activities,
  onClearSelection
}: BulkBookingWidgetProps) => {
  const totalPrice = activities.reduce((sum, activity) => sum + activity.price, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réserver mes activités</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-bold">฿{totalPrice}</span>
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={activities.length === 0}
          >
            Réserver {activities.length} activité{activities.length > 1 ? "s" : ""}
          </Button>
          {activities.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onClearSelection}
            >
              Effacer la sélection
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
