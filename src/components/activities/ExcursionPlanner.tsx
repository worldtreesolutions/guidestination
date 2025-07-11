import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import activityService from "@/services/activityService";
import { Activity, ScheduledActivity as ImportedScheduledActivity, SupabaseActivitySchedule } from "../../types/activity";
import { PlanningContext } from "@/contexts/PlanningContext";
import { useToast } from "@/hooks/use-toast";

type PlannerScheduledActivity = Activity & {
  time: string;
  date: Date;
};

export function ExcursionPlanner() {
  const { addActivity } = useContext(PlanningContext);
  const { toast } = useToast();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedActivity, setSelectedActivity] = useState<PlannerScheduledActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const fetchedActivities = await activityService.getActivities();
        setActivities(fetchedActivities);
        setFilteredActivities(fetchedActivities);
        setError(null);
      } catch (err) {
        setError("Failed to fetch activities.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSelectActivity = (activity: Activity, time: string) => {
    if (!selectedDate) {
      toast({
        title: "Please select a date",
        description: "You must select a date before choosing an activity time.",
        variant: "destructive",
      });
      return;
    }

    const scheduled: PlannerScheduledActivity = {
      ...activity,
      date: selectedDate,
      time,
    };
    setSelectedActivity(scheduled);
  };

  const handleAddToPlan = () => {
    if (selectedActivity) {
      addActivity(selectedActivity);
      toast({
        title: "Activity added to plan",
        description: `${selectedActivity.title} on ${selectedActivity.date.toLocaleDateString()} at ${selectedActivity.time} has been added.`,
      });
      setSelectedActivity(null);
    }
  };

  const getAvailableTimes = (activity: Activity): string[] => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay(); // Sunday is 0
    const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Adjust to Monday=1..Sunday=7

    return activity.schedules
      .filter(s => s.day_of_week === adjustedDayOfWeek && s.is_active)
      .map(s => s.start_time);
  };

  if (loading) return <div>Loading activities...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Available Excursions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => {
                const availableTimes = getAvailableTimes(activity);
                if (availableTimes.length === 0) return null;

                return (
                  <div key={activity.id} className="border p-4 rounded-lg">
                    <h3 className="font-semibold">{activity.title}</h3>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Select onValueChange={(time) => handleSelectActivity(activity, time)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimes.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No activities available for the selected date.</p>
            )}
          </CardContent>
        </Card>
        {selectedActivity && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Selected Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>{selectedActivity.title}</strong></p>
              <p>Date: {selectedActivity.date.toLocaleDateString()}</p>
              <p>Time: {selectedActivity.time}</p>
              <Button onClick={handleAddToPlan} className="mt-2">Add to My Plan</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
