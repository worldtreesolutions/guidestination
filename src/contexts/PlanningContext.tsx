import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { SupabaseActivity } from "@/types/activity";

interface PlanningContextType {
  selectedActivities: SupabaseActivity[];
  addActivity: (activity: SupabaseActivity) => void;
  removeActivity: (activityId: number) => void;
  clearActivities: () => void;
  isActivitySelected: (activityId: number) => boolean;
  updateActivity: (activityId: number, updatedActivity: Partial<SupabaseActivity>) => void;
  scheduleActivity: (activityId: number, day: string, hour: number) => void;
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined);

export function usePlanning() {
  const context = useContext(PlanningContext)
  if (!context) {
    throw new Error("usePlanning must be used within a PlanningProvider")
  }
  return context
}

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [selectedActivities, setSelectedActivities] = useState<SupabaseActivity[]>([]);

  const addActivity = useCallback((activity: SupabaseActivity) => {
    // Prevent adding duplicates to selected or scheduled lists
    const isAlreadySelected = selectedActivities.some(a => a.id === activity.id);
    const isAlreadyScheduled = scheduledActivities.some(a => a.id === activity.id.toString());

    if (!isAlreadySelected && !isAlreadyScheduled) {
      setSelectedActivities(prev => [...prev, activity]);
    }
  }, [selectedActivities, scheduledActivities]);

  const removeActivity = useCallback((activityId: number) => {
    setSelectedActivities(prev => prev.filter(a => a.id.toString() !== activityId));
    setScheduledActivities(prev => prev.filter(a => a.id !== activityId));
  }, []);

  const scheduleActivity = useCallback((activityId: number, day: string, hour: number) => {
    setScheduledActivities(prevScheduled => {
      const existingScheduled = prevScheduled.find(a => a.id === activityId);
      if (existingScheduled) {
        // Update existing scheduled activity
        return prevScheduled.map(a => 
          a.id === activityId ? { ...a, day, hour } : a
        );
      }

      // Move from selected to scheduled
      const activityToSchedule = selectedActivities.find(a => a.id.toString() === activityId);
      if (activityToSchedule) {
        setSelectedActivities(prevSelected => prevSelected.filter(a => a.id.toString() !== activityId));
        
        const newScheduledActivity: ScheduledActivity = {
          id: activityToSchedule.id.toString(),
          title: activityToSchedule.title,
          imageUrl: activityToSchedule.image_urls?.[0] || "",
          day,
          hour,
          duration: activityToSchedule.duration || 2,
          price: activityToSchedule.price || 0,
          participants: 1, // Default participants
        };
        return [...prevScheduled, newScheduledActivity];
      }
      
      return prevScheduled;
    });
  }, [selectedActivities]);

  const updateActivity = useCallback((activityId: number, updatedActivity: Partial<SupabaseActivity>) => {
    setScheduledActivities(prev =>
      prev.map(act => (act.id === activityId ? { ...act, ...updatedActivity } : act))
    );
  }, []);

  const clearActivities = useCallback(() => {
    setSelectedActivities([]);
    setScheduledActivities([]);
  }, []);

  const isActivitySelected = (activityId: number) => {
    return selectedActivities.some((activity) => activity.id.toString() === activityId) ||
           scheduledActivities.some((activity) => activity.id === activityId)
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
