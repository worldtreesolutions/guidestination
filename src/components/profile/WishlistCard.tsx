import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import Image from "next/image"
import { Activity, ActivityForHomepage } from "@/types/activity"
import Link from "next/link"

interface WishlistCardProps {
  activity: Activity | ActivityForHomepage;
  onRemove?: () => void;
}

export default function WishlistCard({ activity, onRemove }: WishlistCardProps) {
  const generateSlug = (activity: Activity | ActivityForHomepage) => {
    if ('slug' in activity && activity.slug) {
      return activity.slug;
    }
    return `activity-${activity.id}`;
  };

  const activitySlug = generateSlug(activity);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
       {onRemove && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 z-10 h-8 w-8"
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <div className="aspect-video relative">
        <Image
          src={activity.image_url || "/placeholder-activity.jpg"}
          alt={activity.title}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {activity.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">
            ${activity.b_price}
          </div>
          <Button size="sm" asChild>
            <Link href={`/activities/${activitySlug}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
