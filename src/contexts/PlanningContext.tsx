
import { createContext, useContext, useState } from "react"
import { Activity } from "@/types/activity"

// Define the ScheduledActivity interface to match what's used in ExcursionPlanner
export interface ScheduledActivity {
  id: string
  title: string
  imageUrl: string
  day: string
  hour: number
  duration: number
  price: number
  participants: number
  activity_id?: string
  availableSlots?: {
    [key: string]: number[]
  }
}

interface PlanningContextType {
  selectedActivities: Activity[];
  scheduledActivities: ScheduledActivity[];
  addActivity: (activity: Activity) => void;
  removeActivity: (activityId: string) => void;
  clearActivities: () => void;
  isActivitySelected: (activityId: string) => boolean;
  updateActivity: (activity: ScheduledActivity) => void;
  scheduleActivity: (activityId: string, day: string, hour: number) => void;
}

const defaultContext: PlanningContextType = {
  selectedActivities: [],
  scheduledActivities: [],
  addActivity: () => {},
  removeActivity: () => {},
  clearActivities: () => {},
  isActivitySelected: () => false,
  updateActivity: () => {},
  scheduleActivity: () => {},
}

const PlanningContext = createContext<PlanningContextType>(defaultContext)

export function PlanningProvider({ children }: { children: React.ReactNode }) {
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([])
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([])

  const addActivity = (activity: Activity) => {
    setSelectedActivities((prev) => {
      if (prev.some((a) => a.activity_id === activity.activity_id)) {
        return prev
      }
      return [...prev, activity]
    })
  }

  const removeActivity = (activityId: string) => {
    // Remove from selected activities
    setSelectedActivities((prev) =>
      prev.filter((activity) => activity.activity_id !== activityId)
    )
    
    // Also remove from scheduled activities
    setScheduledActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId)
    )
  }

  const clearActivities = () => {
    setSelectedActivities([])
    setScheduledActivities([])
  }

  const isActivitySelected = (activityId: string) => {
    return selectedActivities.some((activity) => activity.activity_id === activityId)
  }

  const updateActivity = (activity: ScheduledActivity) => {
    setScheduledActivities((prev) => {
      const index = prev.findIndex((a) => a.id === activity.id)
      if (index === -1) return [...prev, activity]
      
      const updated = [...prev]
      updated[index] = activity
      return updated
    })
  }

  const scheduleActivity = (activityId: string, day: string, hour: number) => {
    // If day is empty, move from scheduled to selected
    if (!day) {
      const activity = scheduledActivities.find((a) => a.id === activityId)
      if (activity) {
        // Find the original activity in selectedActivities or create a new one
        const originalActivity = selectedActivities.find((a) => a.activity_id === activityId) || {
          activity_id: activityId,
          title: activity.title,
          image_url: activity.imageUrl,
          price: activity.price,
        } as Activity
        
        // Add to selected activities if not already there
        if (!selectedActivities.some((a) => a.activity_id === activityId)) {
          setSelectedActivities((prev) => [...prev, originalActivity])
        }
        
        // Remove from scheduled activities
        setScheduledActivities((prev) => prev.filter((a) => a.id !== activityId))
      }
      return
    }
    
    // Find the activity in either selected or scheduled
    const selectedActivity = selectedActivities.find((a) => a.activity_id === activityId)
    const scheduledActivity = scheduledActivities.find((a) => a.id === activityId)
    
    if (selectedActivity) {
      // Create a new scheduled activity from the selected one
      const newScheduledActivity: ScheduledActivity = {
        id: selectedActivity.activity_id || activityId,
        title: selectedActivity.title,
        imageUrl: selectedActivity.image_url || '',
        day,
        hour,
        duration: 2, // Default duration
        price: selectedActivity.price || 0,
        participants: 1, // Default participants
      }
      
      // Add to scheduled activities
      setScheduledActivities((prev) => [...prev, newScheduledActivity])
      
      // Remove from selected activities
      setSelectedActivities((prev) => prev.filter((a) => a.activity_id !== activityId))
    } else if (scheduledActivity) {
      // Update the existing scheduled activity
      setScheduledActivities((prev) => 
        prev.map((a) => 
          a.id === activityId ? { ...a, day, hour } : a
        )
      )
    }
  }

  const value = {
    selectedActivities,
    scheduledActivities,
    addActivity,
    removeActivity,
    clearActivities,
    isActivitySelected,
    updateActivity,
    scheduleActivity,
  }

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>
}

export function usePlanning() {
  const context = useContext(PlanningContext)
  if (!context) {
    throw new Error("usePlanning must be used within a PlanningProvider")
  }
  return context
}
