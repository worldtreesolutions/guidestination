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

  // Parse available dates from schedule
  const availableDates = activity.schedule?.available_dates
    ? activity.schedule.available_dates.map((dateStr: string) => new Date(dateStr))
    : []

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
            Select an available date to see timing details
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
              
              {activity.schedule?.start_time && activity.schedule?.end_time && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Activity Time</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(activity.schedule.start_time)} - {formatTime(activity.schedule.end_time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Group Size</p>
                      <p className="text-sm text-gray-600">
                        Maximum {activity.max_participants} participants
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedDate && isDateAvailable(selectedDate) && (
                <div className="mt-6 p-4 border rounded-lg bg-white">
                  <h5 className="font-medium mb-2">Selected Date</h5>
                  <p className="text-gray-600 mb-4">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                  <Badge variant="default" className="mb-4">Available</Badge>
                  <div className="space-y-2 text-sm">
                    {activity.schedule?.start_time && (
                      <p><strong>Start:</strong> {formatTime(activity.schedule.start_time)}</p>
                    )}
                    {activity.schedule?.end_time && (
                      <p><strong>End:</strong> {formatTime(activity.schedule.end_time)}</p>
                    )}
                    <p><strong>Duration:</strong> {activity.duration}</p>
                  </div>
                </div>
              )}

              {availableDates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No scheduled dates available</p>
                  <p className="text-sm">Contact the activity owner for custom scheduling</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {availableDates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Available Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableDates
                .filter((date: Date) => date >= new Date())
                .sort((a: Date, b: Date) => a.getTime() - b.getTime())
                .slice(0, 6)
                .map((date: Date, index: number) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="font-medium">
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {date.toLocaleDateString("en-US", { weekday: "long" })}
                    </div>
                    {activity.schedule?.start_time && (
                      <div className="text-sm text-blue-600 mt-1">
                        {formatTime(activity.schedule.start_time)}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
