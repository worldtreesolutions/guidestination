
import { createContext, useContext, useState } from "react"
import { Activity } from "@/types/activity"

interface PlanningContextType {
  selectedActivities: Activity[];
  addActivity: (activity: Activity) => void;
  removeActivity: (activityId: string) => void;
  clearActivities: () => void;
  isActivitySelected: (activityId: string) => boolean;
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined)

export function PlanningProvider({ children }: { children: React.ReactNode }) {
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([])

  const addActivity = (activity: Activity) => {
    setSelectedActivities((prev) => {
      if (prev.some((a) => a.activity_id === activity.activity_id)) {
        return prev
      }
      return [...prev, activity]
    })
  }

  const removeActivity = (activityId: string) => {
    setSelectedActivities((prev) =>
      prev.filter((activity) => activity.activity_id !== activityId)
    )
  }

  const clearActivities = () => {
    setSelectedActivities([])
  }

  const isActivitySelected = (activityId: string) => {
    return selectedActivities.some((activity) => activity.activity_id === activityId)
  }

  const value = {
    selectedActivities,
    addActivity,
    removeActivity,
    clearActivities,
    isActivitySelected,
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
