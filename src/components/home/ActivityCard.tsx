import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Star, MapPin } from "lucide-react"
import { ActivityForHomepage } from "@/types/activity"

interface ActivityCardProps {
  activity?: ActivityForHomepage
}

export function ActivityCard({ activity }: ActivityCardProps) {
  if (!activity) {
    return null
  }

  const {
    title,
    image_url,
    price,
    location,
    rating
  } = activity

  // Provide fallback values to prevent undefined errors
  const safePrice = typeof price === 'number' ? price : 0
  const safeRating = typeof rating === 'number' ? rating : 0
  const safeLocation = location || "Location not specified"
  const safeImageUrl = image_url || "https://images.unsplash.com/photo-1563492065-1a83e8c6b8d8"

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative aspect-video">
        <Image
          src={safeImageUrl}
          alt={title || "Activity image"}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm truncate">{safeLocation}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm">{safeRating.toFixed(1)}</span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            ฿{safePrice.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
  
