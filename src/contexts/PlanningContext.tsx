
import { createContext, useContext, useState } from "react"
import { Activity } from "@/types/activity"

interface PlanningContextType {
  selectedActivities: Activity[];
  addActivity: (activity: Activity) => void;
  removeActivity: (activityId: string) => void;
  clearActivities: () => void;
  isActivitySelected: (activityId: string) => boolean;
}

const PlanningContext = createContext<PlanningContextType>({
  selectedActivities: [],
  addActivity: () => {},
  removeActivity: () => {},
  clearActivities: () => {},
  isActivitySelected: () => false,
})

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

  return (
    <PlanningContext.Provider
      value={{
        selectedActivities,
        addActivity,
        removeActivity,
        clearActivities,
        isActivitySelected,
      }}
    >
      {children}
    </PlanningContext.Provider>
  )
}

export const usePlanning = () => {
  const context = useContext(PlanningContext)
  if (!context) {
    throw new Error("usePlanning must be used within a PlanningProvider")
  }
  return context
}
