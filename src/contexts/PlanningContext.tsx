import { createContext, useContext, useState, ReactNode } from "react"
import { ScheduledActivity } from "@/components/activities/ExcursionPlanner"

interface PlanningContextType {
  selectedActivities: ScheduledActivity[]
  scheduledActivities: ScheduledActivity[]
  addActivity: (activity: Partial<ScheduledActivity>) => void
  removeActivity: (activityId: string) => void
  updateActivity: (activityId: string, updatedActivity: ScheduledActivity) => void
  scheduleActivity: (activityId: string, day: string, hour: number) => void
  clearActivities: () => void
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined)

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [selectedActivities, setSelectedActivities] = useState<ScheduledActivity[]>([])
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([])

  const addActivity = (activity: Partial<ScheduledActivity>) => {
    const newActivity: ScheduledActivity = {
      id: Math.random().toString(36).substr(2, 9),
      title: activity.title || '',
      imageUrl: activity.imageUrl || '',
      day: '',
      hour: 0,
      duration: activity.duration || 2,
      price: activity.price || 0,
      participants: activity.participants || 1
    }
    setSelectedActivities(prev => [...prev, newActivity])
  }

  const scheduleActivity = (activityId: string, day: string, hour: number) => {
    const activity = selectedActivities.find(a => a.id === activityId) ||
                    scheduledActivities.find(a => a.id === activityId)
    if (!activity) return

    // Check if the new slot is available
    const endHour = hour + activity.duration
    const hasConflict = scheduledActivities.some(existingActivity => {
      if (existingActivity.id === activityId || existingActivity.day !== day) return false
      const existingEnd = existingActivity.hour + existingActivity.duration
      return !(hour >= existingEnd || endHour <= existingActivity.hour)
    })

    if (hasConflict) {
      // If there's a conflict, move back to selected activities
      if (!selectedActivities.find(a => a.id === activityId)) {
        setSelectedActivities(prev => [...prev, activity])
      }
      return
    }

    const updatedActivity = { ...activity, day, hour }
    
    // Remove from both lists first
    setSelectedActivities(prev => prev.filter(a => a.id !== activityId))
    setScheduledActivities(prev => {
      const withoutCurrent = prev.filter(a => a.id !== activityId)
      return [...withoutCurrent, updatedActivity]
    })
  }

  const updateActivity = (activityId: string, updatedActivity: ScheduledActivity) => {
    const isScheduled = scheduledActivities.find(a => a.id === activityId)
    if (isScheduled) {
      setScheduledActivities(prev => 
        prev.map(activity => 
          activity.id === activityId ? updatedActivity : activity
        )
      )
    } else {
      setSelectedActivities(prev => 
        prev.map(activity => 
          activity.id === activityId ? updatedActivity : activity
        )
      )
    }
  }

  const removeActivity = (activityId: string) => {
    const activity = [...selectedActivities, ...scheduledActivities].find(a => a.id === activityId)
    if (!activity) return

    setScheduledActivities(prev => prev.filter(a => a.id !== activityId))
    setSelectedActivities(prev => prev.filter(a => a.id !== activityId))
  }

  const clearActivities = () => {
    setSelectedActivities([])
    setScheduledActivities([])
  }

  return (
    <PlanningContext.Provider value={{
      selectedActivities,
      scheduledActivities,
      addActivity,
      removeActivity,
      updateActivity,
      scheduleActivity,
      clearActivities
    }}>
      {children}
    </PlanningContext.Provider>
  )
}

export const usePlanning = () => {
  const context = useContext(PlanningContext)
  if (context === undefined) {
    throw new Error("usePlanning must be used within a PlanningProvider")
  }
  return context
}