
import { createContext, useContext, useState, useEffect } from "react";
import { Activity } from "@/types/activity";

// Define the ScheduledActivity interface to match what's used in ExcursionPlanner
export interface ScheduledActivity {
  id: string;
  title: string;
  imageUrl: string;
  day: string;
  hour: number;
  duration: number;
  price: number;
  participants: number;
  activity_id?: string;
  availableSlots?: {
    [key: string]: number[];
  };
}

// Define a type for partial activity data that can be used to create an Activity
export type PartialActivity = {
  title: string;
  image_url: string;
  b_price: number;
  activity_id?: string | number;
  id?: number;
  name?: string;
  description?: string;
  final_price?: number | null;
  price?: number;
  Final_Price?: number;
  category_id?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  duration?: string;
  status?: "draft" | "published" | "archived";
  location?: string | null;
  max_participants?: number | null;
  languages?: string[] | null;
  highlights?: string[] | null;
  included?: string[] | null;
  not_included?: string[] | null;
  meeting_point?: string | null;
  average_rating?: number | null;
  review_count?: number | null;
  category?: string | null;
  includes_pickup?: boolean | null;
  pickup_locations?: string | null;
  includes_meal?: boolean | null;
  meal_description?: string | null;
  provider_id?: string | null;
  [key: string]: any;
};

interface PlanningContextType {
  selectedActivities: Activity[];
  scheduledActivities: ScheduledActivity[];
  addActivity: (activityData: PartialActivity) => void;
  removeActivity: (activityId: string) => void;
  clearActivities: () => void;
  isActivitySelected: (activityId: string) => boolean;
  updateActivity: (
    activityId: string,
    updatedActivity: ScheduledActivity
  ) => void;
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
};

const PlanningContext = createContext<PlanningContextType>(defaultContext);

export function PlanningProvider({ children }: { children: React.ReactNode }) {
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [scheduledActivities, setScheduledActivities] = useState<
    ScheduledActivity[]
  >([]);
  const [destination, setDestination] = useState<string>("");
  const [duration, setDuration] = useState<number>(7);
  const [pax, setPax] = useState<number>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [excludedCategories, setExcludedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    setDestination(localStorage.getItem("destination") || "");
    setDuration(Number(localStorage.getItem("duration") || 7));
    setPax(Number(localStorage.getItem("pax") || 1));
    const storedSelected = localStorage.getItem("selectedCategories");
    if (storedSelected) setSelectedCategories(JSON.parse(storedSelected));
    const storedExcluded = localStorage.getItem("excludedCategories");
    if (storedExcluded) setExcludedCategories(JSON.parse(storedExcluded));
    setStartDate(localStorage.getItem("startDate") || "");
    setEndDate(localStorage.getItem("endDate") || "");
  }, []);

  // Modified to accept partial activity data
  const addActivity = (activityData: PartialActivity) => {
    const randomId = Math.floor(Math.random() * 10000);

    let numericActivityId: number;
    if (typeof activityData.activity_id === "string") {
      numericActivityId = parseInt(activityData.activity_id, 10) || randomId;
    } else if (typeof activityData.activity_id === "number") {
      numericActivityId = activityData.activity_id;
    } else {
      numericActivityId = randomId;
    }
    const primaryKeyId = activityData.id || numericActivityId;

    const activity: Activity = {
      id: primaryKeyId,
      activity_id: numericActivityId,
      title: activityData.title,
      name: activityData.name || activityData.title,
      description: activityData.description || "",
      price_per_person: activityData.b_price || 0,
      duration_hours: parseInt(activityData.duration || "2", 10),
      availability: "",
      location: activityData.location || "",
      category: activityData.category || "",
      images: activityData.image_url ? [{ url: activityData.image_url }] : [],
      image_url: activityData.image_url,
      inclusions: activityData.included || [],
      exclusions: activityData.not_included || [],
      reviews: [],
      b_price: activityData.b_price,
      final_price: activityData.final_price ?? activityData.b_price,
      price: activityData.price ?? activityData.b_price,
      category_id: activityData.category_id || 1,
      is_active:
        activityData.is_active !== undefined ? activityData.is_active : true,
      created_at: activityData.created_at || new Date().toISOString(),
      updated_at: activityData.updated_at || new Date().toISOString(),
      duration: activityData.duration || "2",
      status:
        typeof activityData.status === "string"
          ? (activityData.status as "draft" | "published" | "archived")
          : "published",
      max_participants: activityData.max_participants || undefined,
      highlights: activityData.highlights || [],
      included: activityData.included || [],
      provider_id: activityData.provider_id || undefined,
    };

    setSelectedActivities((prev) => {
      if (prev.some((a) => a.id === activity.id)) {
        return prev;
      }
      return [...prev, activity];
    });
  };

  const removeActivity = (activityId: string) => {
    setSelectedActivities((prev) =>
      prev.filter((activity) => {
        const id = activity.activity_id ?? activity.id;
        return id.toString() !== activityId;
      })
    );

    setScheduledActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId)
    );
  };

  const clearActivities = () => {
    setSelectedActivities([]);
    setScheduledActivities([]);
  };

  const isActivitySelected = (activityId: string) => {
    return selectedActivities.some((activity) => {
      const id = activity.activity_id ?? activity.id;
      return id.toString() === activityId;
    });
  };

  const updateActivity = (
    activityId: string,
    updatedActivity: ScheduledActivity
  ) => {
    setScheduledActivities((prev) => {
      const index = prev.findIndex((a) => a.id === activityId);
      if (index === -1) return [...prev, updatedActivity];

      const updated = [...prev];
      updated[index] = updatedActivity;
      return updated;
    });
  };

  const scheduleActivity = (activityId: string, day: string, hour: number) => {
    if (!day) {
      const activityFromSchedule = scheduledActivities.find(
        (a) => a.id === activityId
      );
      if (activityFromSchedule) {
        const originalActivityNumericId = parseInt(activityId, 10);

        const originalActivity: Activity = {
          id: originalActivityNumericId,
          activity_id:
            parseInt(activityFromSchedule.activity_id || activityId, 10) ||
            originalActivityNumericId,
          title: activityFromSchedule.title,
          name: activityFromSchedule.title,
          description: "",
          price_per_person: activityFromSchedule.price,
          duration_hours: activityFromSchedule.duration,
          availability: "",
          location: "",
          category: "",
          images: [{ url: activityFromSchedule.imageUrl }],
          image_url: activityFromSchedule.imageUrl,
          inclusions: [],
          exclusions: [],
          reviews: [],
          b_price: activityFromSchedule.price,
          final_price: activityFromSchedule.price,
          price: activityFromSchedule.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          duration: activityFromSchedule.duration
            ? activityFromSchedule.duration.toString()
            : "2",
          status: "published",
        };

        if (!selectedActivities.some((a) => a.id === originalActivity.id)) {
          setSelectedActivities((prev) => [...prev, originalActivity]);
        }

        setScheduledActivities((prev) =>
          prev.filter((a) => a.id !== activityId)
        );
      }
      return;
    }

    const selectedActivity = selectedActivities.find((a) => {
      const id = a.activity_id ?? a.id;
      return id.toString() === activityId;
    });
    const scheduledActivity = scheduledActivities.find(
      (a) => a.id === activityId
    );

    if (selectedActivity) {
      const activityId_str = (selectedActivity.activity_id ?? selectedActivity.id).toString();
      const newScheduledActivity: ScheduledActivity = {
        id: activityId_str,
        activity_id: activityId_str,
        title: selectedActivity.title,
        imageUrl: selectedActivity.image_url || "",
        day,
        hour,
        duration: selectedActivity.duration_hours || 2,
        price: selectedActivity.final_price || selectedActivity.b_price || 0,
        participants: 1,
      };

      setScheduledActivities((prev) => [...prev, newScheduledActivity]);
      setSelectedActivities((prev) =>
        prev.filter((a) => {
          const id = a.activity_id ?? a.id;
          return id.toString() !== activityId;
        })
      );
    } else if (scheduledActivity) {
      setScheduledActivities((prev) =>
        prev.map((a) => (a.id === activityId ? { ...a, day, hour } : a))
      );
    }
  };

  const value = {
    selectedActivities,
    scheduledActivities,
    addActivity,
    removeActivity,
    clearActivities,
    isActivitySelected,
    updateActivity,
    scheduleActivity,
  };

  return (
    <PlanningContext.Provider value={value}>
      {children}
    </PlanningContext.Provider>
  );
}

export function usePlanning() {
  const context = useContext(PlanningContext);
  if (!context) {
    throw new Error("usePlanning must be used within a PlanningProvider");
  }
  return context;
}
