
import { createContext, useContext, useState, ReactNode } from "react"
import { ScheduledActivity } from "@/components/activities/ExcursionPlanner"

interface PlanningContextType {
  selectedActivities: ScheduledActivity[]
  addActivity: (activity: Partial<ScheduledActivity>) => void
  removeActivity: (activityId: string) => void
  clearActivities: () => void
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined)

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [selectedActivities, setSelectedActivities] = useState<ScheduledActivity[]>([])

  const addActivity = (activity: Partial<ScheduledActivity>) => {
    const newActivity: ScheduledActivity = {
      id: Math.random().toString(36).substr(2, 9),
      title: activity.title || "",
      imageUrl: activity.imageUrl || "",
      day: activity.day || "monday",
      hour: activity.hour || 9,
      duration: activity.duration || 2,
      price: activity.price || 0,
      participants: activity.participants || 1
    }
    setSelectedActivities(prev => [...prev, newActivity])
  }

  const removeActivity = (activityId: string) => {
    setSelectedActivities(prev => prev.filter(a => a.id !== activityId))
  }

  const clearActivities = () => {
    setSelectedActivities([])
  }

  return (
    <PlanningContext.Provider value={{
      selectedActivities,
      addActivity,
      removeActivity,
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
