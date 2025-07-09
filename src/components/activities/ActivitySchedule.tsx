import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar as CalendarIcon, Users } from "lucide-react"
import { SupabaseActivity } from "@/services/supabaseActivityService"

interface ActivityScheduleProps {
  activity: SupabaseActivity
}

export default function ActivitySchedule({ activity }: ActivityScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // For now, show a placeholder since we don't have schedule data in the current schema
  const availableDates: Date[] = []

  const isDateAvailable = (date: Date) => {
    return availableDates.some((availableDate: Date) => 
      availableDate.toDateString() === date.toDateString()
    )
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Activity Schedule
          </CardTitle>
          <CardDescription>
            Contact the activity owner for scheduling information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <h4 className="font-medium mb-4">Available Dates</h4>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => !isDateAvailable(date) || date < new Date()}
                className="rounded-md border"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>Available dates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span>Unavailable dates</span>
                </div>
              </div>
            </div>

            {/* Schedule Details */}
            <div>
              <h4 className="font-medium mb-4">Schedule Information</h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-sm text-gray-600">
                      {activity.duration || "Contact owner for details"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Group Size</p>
                    <p className="text-sm text-gray-600">
                      Maximum {activity.max_participants || "N/A"} participants
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Schedule details not available</p>
                <p className="text-sm">Contact the activity owner for scheduling information</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
