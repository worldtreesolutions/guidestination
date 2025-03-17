
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeeklyActivitySchedule } from "@/components/activities/WeeklyActivitySchedule"
import { SelectedActivitiesList } from "@/components/activities/SelectedActivitiesList"
import { BulkBookingWidget } from "@/components/activities/BulkBookingWidget"
import { usePlanning } from "@/contexts/PlanningContext"

export interface ScheduledActivity {
  id: string
  title: string
  imageUrl: string
  day: string
  hour: number
  duration: number
  price: number
  participants: number
  availableSlots?: {
    [key: string]: number[]
  }
}

export const ExcursionPlanner = () => {
  const { selectedActivities, removeActivity, clearActivities, updateActivity } = usePlanning()

  const handleActivitySelect = (activity: ScheduledActivity) => {
    updateActivity(activity.id, activity)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Mon Planning Excursion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WeeklyActivitySchedule
                selectedActivities={selectedActivities}
                onActivitySelect={handleActivitySelect}
              />
            </div>
            <div className="space-y-6">
              <SelectedActivitiesList
                activities={selectedActivities}
                onActivityRemove={removeActivity}
              />
              <BulkBookingWidget
                activities={selectedActivities}
                onClearSelection={clearActivities}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
