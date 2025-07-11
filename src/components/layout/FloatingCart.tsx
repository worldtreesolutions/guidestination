import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { usePlanning } from "@/contexts/PlanningContext";

export default function FloatingCart() {
  const { scheduledActivities } = usePlanning();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button size="icon" className="rounded-full w-14 h-14 shadow-lg relative">
        <ShoppingCart className="h-6 w-6" />
        {scheduledActivities.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {scheduledActivities.length}
          </span>
        )}
      </Button>
    </div>
  );
}
