import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart } from "lucide-react"
import { WishlistItem } from "@/services/customerService"
import Image from "next/image"

interface WishlistCardProps {
  item: WishlistItem
  onRemove: (activityId: number) => void
  onBookNow: (activityId: number) => void
  loading: boolean
}

export default function WishlistCard({ item, onRemove, onBookNow, loading }: WishlistCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video">
        <Image
          src={item.activities?.image_url || "https://images.unsplash.com/photo-1563492065599-3520f775eeed"}
          alt={item.activities?.title || "Activity"}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {item.activities?.title || "Activity"}
        </h3>
        
        <div className="text-lg font-bold text-blue-600 mb-3">
          ฿{(item.activities?.b_price || 0).toLocaleString()}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(item.activity_id)}
            disabled={loading}
            className="flex-1 flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            Remove
          </Button>
          <Button
            size="sm"
            onClick={() => onBookNow(item.activity_id)}
            className="flex-1 flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Book
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
