import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { ActivityForHomepage } from "@/types/activity";
import { useCurrency } from "@/context/CurrencyContext";
import { convertCurrency, formatCurrency } from "@/utils/currency";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

interface ActivityCardProps {
  activity: ActivityForHomepage;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const { currency } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  const formatPrice = (price: number | null) => {
    if (price === null) return "Price on request";
    const converted = convertCurrency(price, currency);
    return formatCurrency(converted, currency);
  };

  // Generate slug if not provided
  const activitySlug = activity.slug || `activity-${activity.id}`;

  // Handle image_url as array or single string, including nested arrays
  const images = (() => {
    const imageUrl = activity.image_url as any; // Type assertion to handle mixed types
    
    if (Array.isArray(imageUrl)) {
      // Flatten nested arrays and filter out empty/invalid URLs
      const flattenedUrls = imageUrl.flat(2); // Flatten up to 2 levels deep
      const validImages = flattenedUrls.filter((url: any) => url && typeof url === 'string' && url.trim() !== '');
      return validImages.length > 0 ? validImages : ["/placeholder-activity.jpg"];
    } else if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      // Single string URL (legacy support)
      return [imageUrl];
    } else {
      // No valid image URL
      return ["/placeholder-activity.jpg"];
    }
  })();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white border border-gray-200 text-black">
      <div className="aspect-video relative group">
        <img
          src={imageError ? "/placeholder-activity.jpg" : images[currentImageIndex]}
          alt={activity.title}
          className="w-full h-full object-cover transition-all duration-300"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
        
        {/* Image navigation controls - only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Image dots indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        
        {activity.category_name && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            {activity.category_name}
          </Badge>
        )}
        
        {/* Multiple images indicator */}
        {images.length > 1 && (
          <Badge className="absolute top-2 right-2 bg-black/70 text-white text-xs">
            {currentImageIndex + 1}/{images.length}
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
            <span className="font-bold text-lg">{formatPrice(activity.b_price)}</span>
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
