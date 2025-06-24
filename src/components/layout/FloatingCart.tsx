import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { usePlanning } from "@/contexts/PlanningContext"
import Link from "next/link"

export function FloatingCart() {
  const { selectedActivities, scheduledActivities } = usePlanning()
  const totalItems = selectedActivities.length + scheduledActivities.length

  return (
    <Link href="/planning">
      <div className="fixed bottom-6 right-6 z-40 cursor-pointer group">
        <div className="relative bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
              {totalItems}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
