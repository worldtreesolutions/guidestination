import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Calendar, MapPin, Languages, Check, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from 'react';
import { supabaseActivityService } from "@/services/supabaseActivityService";
import { SupabaseActivity } from "@/types/activity";

interface ActivityPreviewProps {
  activityId: string;
}

export function ActivityPreview({ activityId }: ActivityPreviewProps) {
  const [activity, setActivity] = useState<SupabaseActivity | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      if (activityId) {
        try {
          const fetchedActivity = await supabaseActivityService.getActivityById(parseInt(activityId));
          setActivity(fetchedActivity);
        } catch (error) {
          console.error("Error fetching activity preview:", error);
        }
      }
    };
    fetchActivity();
  }, [activityId]);

  if (!activity) return null;

  const formatDuration = (duration: number | null) => {
    if (duration === null) return "N/A";
    switch (duration) {
      case 2: return "2 Hours";
      case 4: return "Half Day (4 Hours)";
      case 8: return "Full Day (8 Hours)";
      default: return `${duration} hours`;
    }
  };

  const formatDates = (dates: string[] | undefined) => {
    if (!dates || dates.length === 0) return "No dates available";
    if (dates.length === 1) return new Date(dates[0]).toLocaleDateString();
    return `${dates.length} dates available`;
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Activity Preview</DialogTitle>
          <DialogDescription>
            This is how your activity will appear to customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="relative h-64 sm:h-80 w-full rounded-lg overflow-hidden">
            {activity.image_urls && activity.image_urls.length > 0 ? (
              <Image
                src={activity.image_urls[0]}
                alt={activity.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="bg-muted h-full flex items-center justify-center text-muted-foreground">
                No Image Available
              </div>
            )}
            <div className="absolute bottom-4 right-4">
              <Badge className="text-sm px-3 py-1">
                {activity.category_name}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold">{activity.title}</h1>
            <div className="text-xl font-bold">
              ฿{activity.price?.toLocaleString()} <span className="text-sm text-muted-foreground">per person</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>{formatDuration(activity.duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>Max {activity.max_participants} people</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{formatDates(activity.schedules?.availableDates?.map(d => d.date))}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{activity.meeting_point}</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">{activity.description}</p>
          </div>

          {activity.highlights && activity.highlights.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Highlights</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activity.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activity.languages && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Languages</h2>
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-muted-foreground" />
                <span>{activity.languages.join(", ")}</span>
              </div>
            </div>
          )}

          {activity.included && (
            <div>
              <h2 className="text-xl font-semibold mb-2">What's Included</h2>
              <ul className="space-y-2">
                {activity.included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activity.not_included && activity.not_included.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">What's Not Included</h2>
              <ul className="space-y-2">
                {activity.not_included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activity.includes_pickup && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Pickup Information</h3>
                <p>{activity.pickup_locations}</p>
              </div>
            )}

            {activity.includes_meal && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Meal Information</h3>
                <p>{activity.meal_description}</p>
              </div>
            )}
          </div>

          {activity.schedules && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Schedule</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Start Time</h3>
                  <p>{activity.schedules?.availableDates?.[0]?.startTime || "Not specified"}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">End Time</h3>
                  <p>{activity.schedules?.availableDates?.[0]?.endTime || "Not specified"}</p>
                </div>
              </div>
            </div>
          )}

          {activity.image_urls && activity.image_urls.length > 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {activity.image_urls.slice(1).map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${activity.title} - image ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
