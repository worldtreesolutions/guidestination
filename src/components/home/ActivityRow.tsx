import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "./ActivityCard";
import { useRef } from "react";
import { SupabaseActivity } from "@/services/supabaseActivityService";
import Link from "next/link"
import { ActivityForHomepage } from "@/types/activity"

interface ActivityRowProps {
  title: string
  activities: ActivityForHomepage[]
}

export function ActivityRow({ title, activities }: ActivityRowProps) {
  if (activities.length === 0) return null

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activities.map((activity) => (
          <Link key={activity.id} href={`/activities/${activity.id}`}>
            <ActivityCard
              title={activity.title}
              image={activity.image_url || "https://images.unsplash.com/photo-1563492065599-3520f775eeed"}
              price={activity.price}
              location={activity.location || "Location TBD"}
              rating={activity.rating || 0}
              href={`/activities/${activity.id}`}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
