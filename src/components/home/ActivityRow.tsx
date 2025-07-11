import { ActivityForHomepage } from "@/types/activity";
import ActivityCard from "./ActivityCard";
import Link from "next/link";

interface ActivityRowProps {
  activities: ActivityForHomepage[];
}

export default function ActivityRow({ activities }: ActivityRowProps) {
  return (
    <div className="relative">
      <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
        {activities.map((activity) => (
          <Link 
            key={activity.id} 
            href={`/activities/${activity.slug || `activity-${activity.id}`}`}
            className="flex-shrink-0 w-80"
          >
            <ActivityCard activity={activity} />
          </Link>
        ))}
      </div>
    </div>
  );
}
