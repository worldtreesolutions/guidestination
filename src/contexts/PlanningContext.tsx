import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { SupabaseActivity } from "@/types/activity"

// Define the shape of a scheduled activity
interface ScheduledActivity extends SupabaseActivity {
  day?: string
  hour?: number
}

interface PlanningContextType {
  selectedActivities: SupabaseActivity[]
  scheduledActivities: ScheduledActivity[]
  addActivity: (activity: SupabaseActivity) => void
  removeActivity: (activityId: number) => void
  scheduleActivity: (activityId: number, day: string, hour: number) => void
  updateScheduledActivity: (activityId: number, updates: Partial<ScheduledActivity>) => void
  clearActivities: () => void
  isActivitySelected: (activityId: number) => boolean
}

export const PlanningContext = createContext<PlanningContextType | undefined>(undefined)

export function usePlanning() {
  const context = useContext(PlanningContext)
  if (!context) {
    throw new Error("usePlanning must be used within a PlanningProvider")
  }
  return context
}

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [selectedActivities, setSelectedActivities] = useState<SupabaseActivity[]>([])
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([])

  const addActivity = useCallback((activity: SupabaseActivity) => {
    setSelectedActivities(prev => {
      const isAlreadySelected = prev.some(a => a.id === activity.id)
      const isAlreadyScheduled = scheduledActivities.some(a => a.id === activity.id)
      if (isAlreadySelected || isAlreadyScheduled) {
        return prev
      }
      return [...prev, activity]
    })
  }, [scheduledActivities])

  const removeActivity = useCallback((activityId: number) => {
    setSelectedActivities(prev => prev.filter(a => a.id !== activityId))
    setScheduledActivities(prev => prev.filter(a => a.id !== activityId))
  }, [])

  const scheduleActivity = useCallback((activityId: number, day: string, hour: number) => {
    const activityToSchedule = selectedActivities.find(a => a.id === activityId)
    if (activityToSchedule) {
      // Remove from selected list
      setSelectedActivities(prev => prev.filter(a => a.id !== activityId))
      // Add to scheduled list
      setScheduledActivities(prev => [...prev, { ...activityToSchedule, day, hour }])
    } else {
        // If already scheduled, just update it
        setScheduledActivities(prev => prev.map(act => act.id === activityId ? { ...act, day, hour } : act))
    }
  }, [selectedActivities])

  const updateScheduledActivity = useCallback((activityId: number, updates: Partial<ScheduledActivity>) => {
    setScheduledActivities(prev =>
      prev.map(act => (act.id === activityId ? { ...act, ...updates } : act))
    )
  }, [])

  const clearActivities = useCallback(() => {
    setSelectedActivities([])
    setScheduledActivities([])
  }, [])

  const isActivitySelected = useCallback((activityId: number) => {
    return selectedActivities.some(a => a.id === activityId) || scheduledActivities.some(a => a.id === activityId)
  }, [selectedActivities, scheduledActivities])

  const value = {
    selectedActivities,
    scheduledActivities,
    addActivity,
    removeActivity,
    scheduleActivity,
    updateScheduledActivity,
    clearActivities,
    isActivitySelected,
  }

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>
}
  
