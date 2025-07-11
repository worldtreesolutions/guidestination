import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Calendar, MapPin, Languages, Check, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import activityService from "@/services/activityService";
import { Activity } from "@/types/activity";
import { useLanguage } from "@/contexts/LanguageContext";

interface ActivityPreviewProps {
  activityId: string;
}

export function ActivityPreview({ activityId }: ActivityPreviewProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formatCurrency } = useLanguage();

  useEffect(() => {
    if (activityId) {
      const fetchActivity = async () => {
        setLoading(true);
        try {
          const activityIdAsNumber = parseInt(activityId, 10);
          if (isNaN(activityIdAsNumber)) {
            throw new Error("Invalid activity ID");
          }
          const data = await activityService.getActivityById(activityIdAsNumber);
          setActivity(data);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchActivity();
    }
  }, [activityId]);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      // onDelete(activity.id);
    }
  };

  if (!activity) return null;

  const formatDuration = (duration: number | null) => {
    if (duration === null) return "N/A";
    switch (duration) {
      case 2:
        return "2 Hours";
      case 4:
        return "Half Day (4 Hours)";
      case 8:
        return "Full Day (8 Hours)";
      default:
        return `${duration} hours`;
    }
  };

  const formatDates = (dates: any[] | undefined) => {
    if (!dates || dates.length === 0) return "No dates available";
    if (dates.length === 1) return new Date(dates[0].date).toLocaleDateString();
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
            {activity.image_url ? (
              <Image
                src={activity.image_url}
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
              <Badge className="text-sm px-3 py-1">{activity.category_name || "Uncategorized"}</Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold">{activity.title}</h1>
            <div className="text-xl font-bold">
              {formatCurrency(activity.b_price || 0)}{" "}
              <span className="text-sm text-muted-foreground">per person</span>
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
              <span>{formatDates(activity.schedules?.map(s => ({ date: s.start_time })))}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{activity.meeting_point}</span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {activity.description}
            </p>
          </div>

          {Array.isArray(activity.highlights) && activity.highlights.length > 0 && (
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

          {Array.isArray(activity.languages) && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Languages</h2>
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-muted-foreground" />
                <span>{activity.languages.join(", ")}</span>
              </div>
            </div>
          )}

          {Array.isArray(activity.included) && (
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

          {Array.isArray(activity.not_included) &&
            activity.not_included.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  What's Not Included
                </h2>
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
                  <p>
                    {activity.schedules?.[0]?.start_time ||
                      "Not specified"}
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">End Time</h3>
                  <p>
                    {activity.schedules?.[0]?.end_time ||
                      "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
