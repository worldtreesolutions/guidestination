import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Activity } from "@/services/activityService";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Calendar, MapPin, Languages, Check, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from 'react';
import { getActivityById } from '@/services/supabaseActivityService';
import { SupabaseActivity } from '@/types/activity';

interface ActivityPreviewProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityPreview({ activity, isOpen, onClose }: ActivityPreviewProps) {
  const [supabaseActivity, setSupabaseActivity] = useState<SupabaseActivity | null>(null);

  useEffect(() => {
    if (activity) {
      getActivityById(activity.id).then((supabaseActivity) => {
        setSupabaseActivity(supabaseActivity);
      });
    }
  }, [activity]);

  if (!supabaseActivity) return null;

  // Format duration for display
  const formatDuration = (duration: string) => {
    switch (duration) {
      case "2_hours":
        return "2 Hours";
      case "half_day":
        return "Half Day (4 Hours)";
      case "full_day":
        return "Full Day (8 Hours)";
      case "multi_day":
        return "Multi-Day";
      default:
        return duration.replace("_", " ");
    }
  };

  // Format dates for display
  const formatDates = (dates: string[] | undefined) => {
    if (!dates || dates.length === 0) return "No dates available";
    
    if (dates.length === 1) {
      return new Date(dates[0]).toLocaleDateString();
    }
    
    return `${dates.length} dates available`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Activity Preview</DialogTitle>
          <DialogDescription>
            This is how your activity will appear to customers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80 w-full rounded-lg overflow-hidden">
            {supabaseActivity.images && supabaseActivity.images.length > 0 ? (
              <Image
                src={supabaseActivity.images[0]}
                alt={supabaseActivity.title}
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
                {supabaseActivity.category.charAt(0).toUpperCase() + supabaseActivity.category.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Title and Price */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold">{supabaseActivity.title}</h1>
            <div className="text-xl font-bold">
              ฿{supabaseActivity.finalPrice.toLocaleString()} <span className="text-sm text-muted-foreground">per person</span>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>{formatDuration(supabaseActivity.duration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span>Max {supabaseActivity.maxParticipants} people</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{formatDates(supabaseActivity.schedule?.availableDates)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{supabaseActivity.meetingPoint}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-line">{supabaseActivity.description}</p>
          </div>

          {/* Highlights */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Highlights</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {supabaseActivity.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Languages</h2>
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-muted-foreground" />
              <span>{supabaseActivity.languages.join(", ")}</span>
            </div>
          </div>

          {/* What's Included */}
          <div>
            <h2 className="text-xl font-semibold mb-2">What's Included</h2>
            <ul className="space-y-2">
              {supabaseActivity.included.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What's Not Included */}
          {supabaseActivity.notIncluded && supabaseActivity.notIncluded.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">What's Not Included</h2>
              <ul className="space-y-2">
                {supabaseActivity.notIncluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickup Information */}
            {supabaseActivity.includesPickup && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Pickup Information</h3>
                <p>{supabaseActivity.pickupLocations}</p>
              </div>
            )}

            {/* Meal Information */}
            {supabaseActivity.includesMeal && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Meal Information</h3>
                <p>{supabaseActivity.mealDescription}</p>
              </div>
            )}
          </div>

          {/* Schedule */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Schedule</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Start Time</h3>
                <p>{supabaseActivity.schedule?.startTime || "Not specified"}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">End Time</h3>
                <p>{supabaseActivity.schedule?.endTime || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          {supabaseActivity.images && supabaseActivity.images.length > 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Gallery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {supabaseActivity.images.slice(1).map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${supabaseActivity.title} - image ${index + 2}`}
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
