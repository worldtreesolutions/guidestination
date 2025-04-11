
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePlanning } from "@/contexts/PlanningContext"
import { useIsMobile } from "@/hooks/use-mobile"

interface ActivityCardProps {
  title: string
  image: string
  price: number
  location: string
  rating: number
  href: string
}

export const ActivityCard = ({
  title,
  image,
  price,
  location,
  rating,
  href
}: ActivityCardProps) => {
  const { addActivity } = usePlanning()
  const isMobile = useIsMobile()

  const handleAddToPlanning = (e: React.MouseEvent) => {
    e.preventDefault()
    addActivity({
      title,
      imageUrl: image,
      price,
      duration: 2
    })
  }

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <Card className="group overflow-hidden">
      <Link href={href}>
        <div className="relative aspect-[4/3]">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col sm:flex-row gap-2">
            <Button
              variant="secondary"
              className="rounded-full bg-white/80 hover:bg-white flex items-center gap-1 sm:gap-2 px-2 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm"
              onClick={handleAddToPlanning}
            >
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              {!isMobile ? (
                <span>Ajouter au planning</span>
              ) : (
                <span>Add</span>
              )}
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full bg-white/80 hover:bg-white h-8 w-8 sm:h-10 sm:w-10"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-semibold mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base">{title}</h3>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
            <div className="text-xs sm:text-sm text-muted-foreground">{location}</div>
            <div className="font-medium text-sm sm:text-base">฿{formatPrice(price)} per person</div>
          </div>
          <div className="flex items-center gap-1 mt-1 sm:mt-2">
            {"★".repeat(rating)}{"☆".repeat(5-rating)}
            <span className="text-xs sm:text-sm text-muted-foreground ml-1">({rating}.0)</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
