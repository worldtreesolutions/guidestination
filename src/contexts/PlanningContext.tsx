import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { SupabaseActivity, Activity } from "@/types/activity"
import { ScheduledActivity } from "@/types/activity"

interface PlanningContextType {
  scheduledActivities: ScheduledActivity[];
  addActivity: (activity: ScheduledActivity) => void;
  removeActivity: (id: string) => void;
  clearActivities: () => void;
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
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([])

  const addActivity = (activity: ScheduledActivity) => {
    setScheduledActivities(prev => [...prev, activity]);
  };

  const removeActivity = useCallback((id: string) => {
    setScheduledActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearActivities = useCallback(() => {
    setScheduledActivities([]);
  }, []);

  const value = {
    scheduledActivities,
    addActivity,
    removeActivity,
    clearActivities,
  }

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>
}
  
