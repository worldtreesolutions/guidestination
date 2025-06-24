
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

// Define a type for partial activity data that can be used to create an Activity
export type PartialActivity = {
  title: string;
  image_url: string; // This should align with Activity's image_url type (Json | null)
  b_price: number;
  activity_id?: string | number; // Corresponds to activities.activity_id
  id?: number; // Corresponds to activities.id (PK)
  user_id?: string | null; // Corresponds to activities.user_id
  final_price?: number | null; // Changed Final_Price to final_price
  [key: string]: any;
}

interface PlanningContextType {
  selectedActivities: Activity[];
  scheduledActivities: ScheduledActivity[];
  addActivity: (activityData: PartialActivity) => void;
  removeActivity: (activityId: string) => void;
  clearActivities: () => void;
  isActivitySelected: (activityId: string) => boolean;
  updateActivity: (activityId: string, updatedActivity: ScheduledActivity) => void;
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

  // Modified to accept partial activity data
  const addActivity = (activityData: PartialActivity) => {
    const randomId = Math.floor(Math.random() * 10000);
    
    let numericActivityId: number; // This is for activities.activity_id
    if (typeof activityData.activity_id === "string") {
      numericActivityId = parseInt(activityData.activity_id, 10) || randomId;
    } else if (typeof activityData.activity_id === "number") {
      numericActivityId = activityData.activity_id;
    } else {
      numericActivityId = randomId;
    }
    const primaryKeyId = activityData.id || numericActivityId;

    const activity: Activity = {
      // Fields from Database["public"]["Tables"]["activities"]["Row"]
      id: primaryKeyId, 
      activity_id: numericActivityId, 
      title: activityData.title,
      name: activityData.name || activityData.title, 
      description: activityData.description || "",
      image_url: activityData.image_url,
      b_price: activityData.b_price,
      final_price: activityData.final_price !== undefined ? activityData.final_price : activityData.b_price,
      price: activityData.price !== undefined ? activityData.price : activityData.b_price,
      Final_Price: activityData.final_price !== undefined ? activityData.final_price : activityData.b_price,
      category_id: activityData.category_id || 1,
      is_active: activityData.is_active !== undefined ? activityData.is_active : true,
      created_at: activityData.created_at || new Date().toISOString(),
      updated_at: activityData.updated_at || new Date().toISOString(),
      duration: activityData.duration || "2",
      status: typeof activityData.status === "string" ? activityData.status as "draft" | "published" | "archived" : "published",
    };

    setSelectedActivities((prev) => {
      if (prev.some((a) => a.id === activity.id)) { // Use primary key 'id' for checking
        return prev
      }
      return [...prev, activity]
    })
  }

  const removeActivity = (activityId: string) => {
    // Remove from selected activities
    setSelectedActivities((prev) =>
      prev.filter((activity) => activity.activity_id.toString() !== activityId)
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
    return selectedActivities.some((activity) => activity.activity_id.toString() === activityId)
  }

  // Updated to match the expected signature
  const updateActivity = (activityId: string, updatedActivity: ScheduledActivity) => {
    setScheduledActivities((prev) => {
      const index = prev.findIndex((a) => a.id === activityId)
      if (index === -1) return [...prev, updatedActivity]
      
      const updated = [...prev]
      updated[index] = updatedActivity
      return updated
    })
  }

  const scheduleActivity = (activityId: string, day: string, hour: number) => {
    // If day is empty, move from scheduled to selected
    if (!day) {
      const activityFromSchedule = scheduledActivities.find((a) => a.id === activityId) // activityId here is ScheduledActivity.id
      if (activityFromSchedule) {
        const originalActivityNumericId = parseInt(activityId, 10);

        const originalActivity = selectedActivities.find((a) => a.id === originalActivityNumericId) || {
          id: originalActivityNumericId,
          activity_id: parseInt(activityFromSchedule.activity_id || activityId, 10) || originalActivityNumericId,
          title: activityFromSchedule.title,
          name: activityFromSchedule.title,
          description: "",
          image_url: activityFromSchedule.imageUrl,
          b_price: activityFromSchedule.price,
          final_price: activityFromSchedule.price,
          price: activityFromSchedule.price,
          Final_Price: activityFromSchedule.price,
          category_id: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          duration: activityFromSchedule.duration ? activityFromSchedule.duration.toString() : "2",
          status: "published" as "draft" | "published" | "archived",
        } as Activity;
        
        if (!selectedActivities.some((a) => a.id === originalActivity.id)) {
          setSelectedActivities((prev) => [...prev, originalActivity]);
        }
        
        setScheduledActivities((prev) => prev.filter((a) => a.id !== activityId));
      }
      return;
    }
    
    // Find the activity in selectedActivities using activityId (which should be Activity.id as string)
    const selectedActivity = selectedActivities.find((a) => a.id.toString() === activityId);
    const scheduledActivity = scheduledActivities.find((a) => a.id === activityId); // ScheduledActivity.id is string
    
    if (selectedActivity) {
      const newScheduledActivity: ScheduledActivity = {
        id: selectedActivity.id.toString(), 
        activity_id: selectedActivity.activity_id.toString(), 
        title: selectedActivity.title,
        imageUrl: selectedActivity.image_url,
        day,
        hour,
        duration: parseInt(selectedActivity.duration, 10) || 2,
        price: selectedActivity.final_price || selectedActivity.b_price || 0,
        participants: 1, 
      };
      
      setScheduledActivities((prev) => [...prev, newScheduledActivity]);
      setSelectedActivities((prev) => prev.filter((a) => a.id.toString() !== activityId));
    } else if (scheduledActivity) {
      setScheduledActivities((prev) => 
        prev.map((a) => 
          a.id === activityId ? { ...a, day, hour } : a
        )
      );
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
