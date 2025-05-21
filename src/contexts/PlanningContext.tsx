
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
  image_url: string;
  b_price: number;
  activity_id?: string | number;
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
    // Generate a random ID if none is provided
    const randomId = Math.floor(Math.random() * 10000);
    
    // Convert string ID to number or use provided number ID or random ID
    let numericId: number;
    if (typeof activityData.activity_id === 'string') {
      numericId = parseInt(activityData.activity_id, 10) || randomId;
    } else if (typeof activityData.activity_id === 'number') {
      numericId = activityData.activity_id;
    } else {
      numericId = randomId;
    }
    
    // Create a minimal Activity object from the partial data
    const activity: Activity = {
      activity_id: numericId,
      title: activityData.title,
      image_url: activityData.image_url,
      b_price: activityData.b_price,
      // Add required fields with default values
      address: null,
      category_id: null,
      created_at: new Date().toISOString(),
      description: null,
      duration: null,
      includes_hotel_pickup: null,
      is_active: true,
      latitude: null,
      longitude: null,
      max_participants: null,
      meeting_point: null,
      name: activityData.title,
      pickup_location: null,
      dropoff_location: null,
      provider_id: null,
      status: 2, // Published
      type: null,
      updated_at: new Date().toISOString(),
      languages: null,
      highlights: null,
      included: null,
      not_included: null
    }

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
      const activity = scheduledActivities.find((a) => a.id === activityId)
      if (activity) {
        // Find the original activity in selectedActivities or create a new one
        const originalActivity = selectedActivities.find((a) => a.activity_id.toString() === activityId) || {
          activity_id: parseInt(activityId, 10) || Math.floor(Math.random() * 10000),
          title: activity.title,
          image_url: activity.imageUrl,
          b_price: activity.price,
          // Add required fields with default values
          address: null,
          category_id: null,
          created_at: new Date().toISOString(),
          description: null,
          duration: null,
          includes_hotel_pickup: null,
          is_active: true,
          latitude: null,
          longitude: null,
          max_participants: null,
          meeting_point: null,
          name: activity.title,
          pickup_location: null,
          dropoff_location: null,
          provider_id: null,
          status: 2, // Published
          type: null,
          updated_at: new Date().toISOString(),
          languages: null,
          highlights: null,
          included: null,
          not_included: null,
        } as Activity
        
        // Add to selected activities if not already there
        if (!selectedActivities.some((a) => a.activity_id.toString() === activityId)) {
          setSelectedActivities((prev) => [...prev, originalActivity])
        }
        
        // Remove from scheduled activities
        setScheduledActivities((prev) => prev.filter((a) => a.id !== activityId))
      }
      return
    }
    
    // Find the activity in either selected or scheduled
    const selectedActivity = selectedActivities.find((a) => a.activity_id.toString() === activityId)
    const scheduledActivity = scheduledActivities.find((a) => a.id === activityId)
    
    if (selectedActivity) {
      // Create a new scheduled activity from the selected one
      const newScheduledActivity: ScheduledActivity = {
        id: selectedActivity.activity_id.toString() || activityId,
        title: selectedActivity.title,
        imageUrl: selectedActivity.image_url || '',
        day,
        hour,
        duration: 2, // Default duration
        price: selectedActivity.b_price || selectedActivity.final_price || 0, // Use b_price or final_price
        participants: 1, // Default participants
      }
      
      // Add to scheduled activities
      setScheduledActivities((prev) => [...prev, newScheduledActivity])
      
      // Remove from selected activities
      setSelectedActivities((prev) => prev.filter((a) => a.activity_id.toString() !== activityId))
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
