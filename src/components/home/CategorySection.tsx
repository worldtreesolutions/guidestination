import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface Category {
  id: number
  name: string
  icon?: string
  color?: string
}

interface CategorySectionProps {
  categories: Category[]
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Browse by Category</h2>
        <p className="text-sm text-gray-600">Discover activities that match your interests</p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/activities?category=${category.id}`}>
            <div className="px-4 py-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-full transition-all duration-200 cursor-pointer group">
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
