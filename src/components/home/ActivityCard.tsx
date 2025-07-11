import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { ActivityForHomepage } from "@/types/activity";
import { currencyService } from "@/services/currencyService";
import { useEffect, useState } from "react";
import Image from "next/image";

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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gray-900 border-gray-700 text-white">
      <div className="aspect-video relative">
        <Image
          src={activity.image_url || "/placeholder-activity.jpg"}
          alt={activity.title}
          fill
          className="object-cover"
        />
        {activity.category_name && (
          <Badge className="absolute top-2 left-2 bg-black/70 text-white">
            {activity.category_name}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {activity.title}
        </h3>
        
        <div className="flex items-center gap-1 text-sm text-gray-400 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{activity.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-white">
              {activity.average_rating?.toFixed(1) || "New"}
            </span>
          </div>
          
          <div className="text-right">
            {activity.b_price && activity.b_price !== activity.price && (
              <div className="text-sm text-gray-400 line-through">
                {formatPrice(activity.b_price)}
              </div>
            )}
            <div className="font-semibold text-lg text-white">
              {formatPrice(activity.price)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
