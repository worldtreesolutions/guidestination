import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Star, MapPin } from "lucide-react"
import { SupabaseActivity, ActivityForHomepage } from "@/types/activity"

interface ActivityCardProps {
  activity: ActivityForHomepage
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const formatPrice = (price: number | null) => {
    // Provide fallback values to prevent undefined errors
    const safePrice = typeof price === 'number' ? price : 0
    return safePrice.toLocaleString()
  }

  return (
    <Link href={`/activities/${activity.id}`} legacyBehavior>
      <a className="block group">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-48 w-full">
              <Image
                src={activity.image_url || "/placeholder.jpg"}
                alt={activity.title}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{activity.title}</h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm truncate">{activity.address || "Location not specified"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-sm">{(activity.average_rating || 0).toFixed(1)}</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  ฿{formatPrice(activity.b_price)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  )
}
  
