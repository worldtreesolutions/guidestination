import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "./ActivityCard";
import { useRef } from "react";
import Link from "next/link"
import { ActivityForHomepage } from "@/types/activity"

interface ActivityRowProps {
  title: string
  activities: ActivityForHomepage[]
}

export function ActivityRow({ title, activities }: ActivityRowProps) {
  if (!activities || activities.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}
