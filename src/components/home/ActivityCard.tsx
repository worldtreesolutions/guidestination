import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { ActivityForHomepage } from "@/types/activity";
import { currencyService } from "@/services/currencyService";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ActivityCardProps {
  activity: ActivityForHomepage;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const [userCurrency, setUserCurrency] = useState(activity.currency || "USD");

  useEffect(() => {
    if (!activity.currency) {
      const currency = currencyService.getUserCurrency();
      setUserCurrency(currency);
    }
  }, [activity.currency]);

  const formatPrice = (price: number | null) => {
    if (price === null) return "Price on request";
    return currencyService.formatCurrency(price, userCurrency);
  };

  // Generate slug if not provided
  const activitySlug = activity.slug || `activity-${activity.id}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white border border-gray-200 text-black">
      <div className="aspect-video relative">
        <Image
          src={activity.image_url || "/placeholder-activity.jpg"}
          alt={activity.title}
          fill
          className="object-cover"
        />
        {activity.category_name && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            {activity.category_name}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
          {activity.title}
        </h3>
        
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{activity.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-800">
              {activity.average_rating?.toFixed(1) || "New"}
            </span>
          </div>
          
          <div className="text-right">
            <div className="font-semibold text-lg text-gray-900">
              {formatPrice(activity.b_price)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="font-bold text-lg">{activity.currency || '$'}{activity.b_price}</span>
            <span className="text-sm text-muted-foreground"> / person</span>
          </div>
          <Button size="sm" asChild>
            <Link href={`/activities/${activitySlug}`}>Book Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
