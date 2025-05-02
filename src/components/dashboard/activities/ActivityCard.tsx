import Image from "next/image";
import Link from "next/link";
import { Activity } from "@/services/activityCrudService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Archive, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ActivityPreview } from "./ActivityPreview";
import categoryService from '@/services/categoryService';

interface ActivityCardProps {
  activity: Activity;
  onStatusChange?: (activityId: number, newStatus: number) => void;
  onDelete?: (activityId: number) => void;
}

export default function ActivityCard({ activity, onStatusChange, onDelete }: ActivityCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [categoryName, setCategoryName] = useState<string>('Uncategorized');
  
  // Fetch category name when component mounts
  useEffect(() => {
    const fetchCategoryName = async () => {
      if (activity.category_id) {
        try {
          const name = await categoryService.getCategoryNameById(activity.category_id);
          setCategoryName(name);
        } catch (error) {
          console.error('Error fetching category name:', error);
        }
      }
    };

    fetchCategoryName();
  }, [activity.category_id]);

  const getStatusVariant = (status: number | null) => {
    switch (status) {
      case 2: // Published/Active
        return "default";
      case 1: // Draft
        return "secondary";
      case 0: // Archived
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusText = (status: number | null) => {
    switch (status) {
      case 2:
        return "active";
      case 1:
        return "draft";
      case 0:
        return "archived";
      default:
        return "draft";
    }
  };

  const handleStatusChange = (newStatus: number) => {
    if (onStatusChange) {
      onStatusChange(activity.id, newStatus);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(activity.id);
    }
  };

  // Create a compatible activity object for the preview component
  // @ Fix status type to match ActivityPreview expectation if different
  // Assuming ActivityPreview expects 'published', 'draft', 'archived'
  const getPreviewStatus = (status: number | null): "published" | "draft" | "archived" => {
     switch (status) {
       case 2: return "published";
       case 1: return "draft";
       case 0: return "archived";
       default: return "draft";
     }
  };

  const previewActivity = {
    id: activity.id.toString(),
    title: activity.title,
    description: activity.description || "",
    category: activity.category_id ? categoryName : "Uncategorized",
    duration: activity.duration || "",
    basePrice: activity.price,
    finalPrice: activity.b_price || activity.price,
    images: activity.image_url ? [activity.image_url] : [],
    // @ Use helper function for status mapping
    status: getPreviewStatus(activity.status), 
    highlights: activity.highlights ? activity.highlights.split('\n') : [],
    included: activity.included ? activity.included.split('\n') : [],
    notIncluded: activity.not_included ? activity.not_included.split('\n') : [],
    maxParticipants: activity.max_participants || 0,
    meetingPoint: activity.meeting_point || "",
    pickupLocation: activity.pickup_location,
    dropoffLocation: activity.dropoff_location,
    languages: activity.languages ? activity.languages.split(',') : [],
    // Add missing properties to satisfy TypeScript if ActivityPreview expects them
    providerId: (activity.provider_id || 0).toString(), // Convert to string
    includesPickup: !!activity.pickup_location,
    includesMeal: false, // Assuming false, adjust if needed
    createdAt: activity.created_at || "",
    updatedAt: activity.updated_at || ""
    // Add any other fields ActivityPreview might require from its own Activity type definition
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="p-0 relative h-48">
          {activity.image_url ? (
            <Image
              src={activity.image_url}
              alt={activity.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="bg-muted h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          <Badge
            variant={getStatusVariant(activity.status)}
            className="absolute top-2 right-2 capitalize"
          >
            {getStatusText(activity.status)}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg mb-1 line-clamp-2">{activity.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-2 capitalize">
            {activity.category_id ? categoryName : "Uncategorized"} - {activity.duration.replace("_", " ")}
          </CardDescription>
          <p className="font-semibold text-lg">
            ฿{activity.b_price?.toLocaleString() ?? activity.price.toLocaleString()}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/activities/${activity.id}`}>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Link>
            </Button>
            {activity.status !== 2 && onStatusChange && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange(2)}>
                <Eye className="h-4 w-4 mr-1" /> Publish
              </Button>
            )}
            {activity.status !== 0 && onStatusChange && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange(0)}>
                <Archive className="h-4 w-4 mr-1" /> Archive
              </Button>
            )}
            {activity.status === 0 && onStatusChange && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange(1)}>
                <Edit className="h-4 w-4 mr-1" /> Move to Draft
              </Button>
            )}
          </div>
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={handleDelete} className="mt-2 sm:mt-0">
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Activity Preview Dialog */}
      <ActivityPreview 
        activity={previewActivity}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}