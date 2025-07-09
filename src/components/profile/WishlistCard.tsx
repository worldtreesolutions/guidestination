
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MapPin } from "lucide-react"
import { WishlistItem } from "@/services/customerService"
import Image from "next/image"

interface WishlistCardProps {
  item: WishlistItem & {
    activities?: {
      title: string
      image_url?: string
      b_price?: number
      location?: string
    }
  }
  onRemove: (activityId: number) => void
  onBookNow: (activityId: number) => void
  loading?: boolean
}

export default function WishlistCard({ item, onRemove, onBookNow, loading }: WishlistCardProps) {
  const activity = item.activities

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="relative aspect-video">
          {activity?.image_url ? (
            <Image
              src={activity.image_url}
              alt={activity.title || "Activity"}
              fill
              className="object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={() => onRemove(item.activity_id)}
            disabled={loading}
          >
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </Button>
        </div>

        <div className="p-4">
          <h4 className="font-semibold mb-2">
            {activity?.title || "Activity"}
          </h4>
          
          {activity?.location && (
            <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
              <MapPin className="h-3 w-3" />
              {activity.location}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-blue-600">
              ฿{activity?.b_price?.toLocaleString() || "N/A"}
            </div>
            <Button 
              size="sm"
              onClick={() => onBookNow(item.activity_id)}
              disabled={loading}
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
