
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Browse by Category</h2>
        <p className="text-gray-600">Discover activities that match your interests</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link key={category.id} href={`/activities?category=${category.id}`}>
            <Card className="p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group rounded-2xl border-2 hover:border-blue-200">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <span className="text-blue-600 text-xl font-semibold">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-medium text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
