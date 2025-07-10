import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { SupabaseActivity } from "@/services/supabaseActivityService";
import { ScheduledActivity } from "@/components/activities/ExcursionPlanner";

type Activity = SupabaseActivity;

interface PlanningContextType {
  selectedActivities: Activity[];
  scheduledActivities: ScheduledActivity[];
  addActivity: (activity: Activity) => void;
  removeActivity: (activityId: string) => void;
  clearActivities: () => void;
  isActivitySelected: (activityId: string) => boolean;
  updateActivity: (activityId: string, updatedActivity: Partial<ScheduledActivity>) => void;
  scheduleActivity: (activityId: string, day: string, hour: number) => void;
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
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([]);

  const addActivity = useCallback((activity: Activity) => {
    // Prevent adding duplicates to selected or scheduled lists
    const isAlreadySelected = selectedActivities.some(a => a.id === activity.id);
    const isAlreadyScheduled = scheduledActivities.some(a => a.id === activity.id.toString());

    if (!isAlreadySelected && !isAlreadyScheduled) {
      const newActivity = {
        ...activity,
        id: `${activity.id}-${Date.now()}`, // Create a unique ID for the planner
        plannerDate: date,
        plannerTime: time,
        imageUrl: activity.image_url?.[0] || '/placeholder.svg',
      };
      setSelectedActivities(prev => [...prev, newActivity]);
    }
  }, [selectedActivities, scheduledActivities]);

  const removeActivity = useCallback((activityId: string) => {
    setSelectedActivities(prev => prev.filter(a => a.id.toString() !== activityId));
    setScheduledActivities(prev => prev.filter(a => a.id !== activityId));
  }, []);

  const scheduleActivity = useCallback((activityId: string, day: string, hour: number) => {
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
          duration: activityToSchedule.duration,
          price: activityToSchedule.price,
          participants: 1, // Default participants
        };
        return [...prevScheduled, newScheduledActivity];
      }
      
      return prevScheduled;
    });
  }, [selectedActivities]);

  const updateActivity = useCallback((activityId: string, updatedActivity: Partial<ScheduledActivity>) => {
    setScheduledActivities(prev =>
      prev.map(act => (act.id === activityId ? { ...act, ...updatedActivity } : act))
    );
  }, []);

  const clearActivities = useCallback(() => {
    setSelectedActivities([]);
    setScheduledActivities([]);
  }, []);

  const isActivitySelected = (activityId: string) => {
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
