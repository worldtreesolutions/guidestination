import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityCard } from "./ActivityCard";
import { useRef } from "react";
import { SupabaseActivity } from "@/services/supabaseActivityService";
import Link from "next/link";

interface Activity {
  title: string
  image: string
  price: number
  location: string
  rating: number
  href: string
}

interface ActivityRowProps {
  title: string;
  activities: {
    title: string
    image: string
    price: number
    location: string
    rating: number
    href: string
  }[];
}

export function ActivityRow({ title, activities }: ActivityRowProps) {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {activities.map((activity) => {
          const mockSupabaseActivity: SupabaseActivity = {
            id: 0, // Mock ID
            title: activity.title,
            description: "A great activity to enjoy.",
            price: activity.price,
            location: activity.location,
            image_urls: [activity.image],
            category_id: 1,
            owner_id: "mock_owner",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            duration: 2,
            booking_type: "daily",
            max_participants: 10,
            rating: activity.rating,
            review_count: 10,
            languages: ["English"],
            highlights: ["Highlight 1", "Highlight 2"],
            meeting_point: "Mock meeting point",
            included: ["Item 1"],
            not_included: ["Item 2"],
          };
          return (
            <Link href={activity.href} key={activity.href}>
              <ActivityCard activity={mockSupabaseActivity} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
