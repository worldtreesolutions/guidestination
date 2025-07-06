
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Clock, MapPin, Users, X, Star } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { SupabaseActivity } from "@/services/supabaseActivityService"
import Image from "next/image"

interface SelectedActivitiesListProps {
  activities: SupabaseActivity[];
  onActivityRemove: (activityId: string) => void;
}

function DraggableActivityCard({ activity, onRemove }: { activity: SupabaseActivity; onRemove: (id: string) => void }) {
  const { t } = useLanguage()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: activity.id.toString(),
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative group cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50 z-50" : ""
      }`}
    >
      <Card className="overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors bg-gradient-to-br from-white to-primary/5">
        <div className="relative">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={activity.image_urls?.[0] || "/placeholder.jpg"}
              alt={activity.title}
              width={200}
              height={112}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(activity.id.toString())
              }}
            >
              <X className="h-3 w-3" />
            </Button>

            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex items-center gap-1 text-white text-xs">
                <Clock className="h-3 w-3" />
                <span>{activity.duration}h</span>
                <span className="mx-1">•</span>
                <MapPin className="h-3 w-3" />
                <span>฿{formatPrice(activity.price || 0)}</span>
              </div>
            </div>
          </div>

          <CardContent className="p-3">
            <div className="space-y-2">
              <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                {activity.title}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>Max {activity.max_participants || 10}</span>
                </div>
                {activity.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{activity.rating}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {activity.category_name || "Activity"}
                </Badge>
                <div className="text-right">
                  <div className="font-bold text-primary">
                    ฿{formatPrice(activity.price || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">per person</div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}

export function SelectedActivitiesList({ activities, onActivityRemove }: SelectedActivitiesListProps) {
  const { t } = useLanguage()

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">{t("planner.noActivitiesSelected")}</p>
        <p className="text-xs mt-1">{t("planner.dragActivitiesHere")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {activities.map((activity) => (
          <DraggableActivityCard
            key={activity.id}
            activity={activity}
            onRemove={onActivityRemove}
          />
        ))}
      </div>
    </div>
  )
}
