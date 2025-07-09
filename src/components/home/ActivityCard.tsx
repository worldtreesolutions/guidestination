import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Star, MapPin } from "lucide-react"

interface ActivityCardProps {
  title: string
  image: string
  price: number
  location: string
  rating: number
  href: string
}

export function ActivityCard({ title, image, price, location, rating }: ActivityCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div className="relative aspect-video">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm truncate">{location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm">{rating.toFixed(1)}</span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            ฿{price.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
