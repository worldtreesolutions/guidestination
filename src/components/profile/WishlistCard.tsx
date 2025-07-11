import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { Activity, ActivityForHomepage } from "@/types/activity"
import Link from "next/link"

interface WishlistCardProps {
  activity: Activity | ActivityForHomepage;
  onRemove: () => void;
}

export default function WishlistCard({ activity, onRemove }: WishlistCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video">
        <Image
          src={activity.image_url || "https://images.unsplash.com/photo-1563492065599-3520f775eeed"}
          alt={activity.title || "Activity"}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {activity.title || "Activity"}
        </h3>
        
        <div className="text-lg font-bold text-blue-600 mb-3">
          ฿{(activity.b_price || 0).toLocaleString()}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="flex-1 flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            Remove
          </Button>
          <Link href={activity.slug ? `/activities/${activity.slug}` : `/booking/${activity.id}`} passHref>
            <Button
              size="sm"
              className="flex-1 flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Book
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
