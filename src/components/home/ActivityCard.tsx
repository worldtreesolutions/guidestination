import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePlanning } from "@/contexts/PlanningContext"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/contexts/LanguageContext"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, Users } from "lucide-react"
import { SupabaseActivity } from "@/services/supabaseActivityService"

interface ActivityCardProps {
  activity: SupabaseActivity;
  onSelect?: (activity: SupabaseActivity) => void;
}

export function ActivityCard({ activity, onSelect }: ActivityCardProps) {
  const { addActivity, isActivitySelected } = usePlanning()
  const { t } = useLanguage()
  const isSelected = isActivitySelected(activity.id.toString())

  const handleSelect = () => {
    if (!isSelected) {
      addActivity(activity)
    }
    onSelect?.(activity)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative aspect-video">
        <Image
          src={activity.image_urls?.[0] || "/placeholder.jpg"}
          alt={activity.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-semibold text-lg mb-1">{activity.title}</h3>
          <p className="text-sm opacity-90">{activity.location}</p>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/90 text-black">
            ฿{activity.price?.toLocaleString()}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{activity.duration}h</span>
            <Users className="h-4 w-4 ml-2" />
            <span>Max {activity.max_participants || 10}</span>
          </div>
          <Button
            size="sm"
            variant={isSelected ? "secondary" : "default"}
            onClick={handleSelect}
            disabled={isSelected}
          >
            {isSelected ? t("activity.selected") : t("activity.select")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
