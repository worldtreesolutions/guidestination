
import { ActivityForHomepage } from "@/types/activity";
import ActivityRow from "./ActivityRow";

interface CategorySectionProps {
  title: string;
  activities: ActivityForHomepage[];
}

export default function CategorySection({ title, activities }: CategorySectionProps) {
  if (activities.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4 px-0">{title}</h2>
      <ActivityRow activities={activities} />
    </section>
  );
}
