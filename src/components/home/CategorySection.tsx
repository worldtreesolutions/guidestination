import { ActivityForHomepage } from "@/types/activity";
import ActivityRow from "./ActivityRow";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CategorySectionProps {
  title: string;
  activities: ActivityForHomepage[];
}

export default function CategorySection({ title, activities }: CategorySectionProps) {
  if (activities.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Button variant="link" className="text-primary hover:text-primary/80">
          View All in {title}
        </Button>
      </div>
      <ActivityRow activities={activities.slice(0, 8)} />
    </section>
  );
}
