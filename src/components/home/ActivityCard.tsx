import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePlanning } from "@/contexts/PlanningContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/contexts/LanguageContext"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin } from "lucide-react"

interface ActivityCardProps {
  title: string
  image: string
  price: number
  location: string
  rating: number
  href: string
}

export function ActivityCard({ title, image, price, location, rating, href }: ActivityCardProps) {
  const { addActivity } = usePlanning()
  const isMobile = useIsMobile()
  const { t } = useLanguage()

  const handleAddToPlanning = (e: React.MouseEvent) => {
    e.preventDefault()
    addActivity({
      title,
      image_url: image,
      b_price: price
    })
  }

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <Link href={href}>
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
              {rating}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4 flex-grow flex flex-col">
          <div className="flex-grow">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{location}</span>
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  ฿{price.toLocaleString()}
                </span>
                <span className="text-gray-600 text-sm ml-1">per person</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
