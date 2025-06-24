import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { usePlanning } from "@/contexts/PlanningContext"
import Link from "next/link"

export function FloatingCart() {
  const { selectedActivities, scheduledActivities } = usePlanning()
  const totalItems = selectedActivities.length + scheduledActivities.length

  return (
    <Link href="/planning">
      <Button 
        size="lg" 
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-green-600 hover:bg-green-700 text-white px-6 py-3 h-auto"
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        <span className="hidden sm:inline">Cart ({totalItems})</span>
        <span className="sm:hidden">{totalItems}</span>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Button>
    </Link>
  )
}
