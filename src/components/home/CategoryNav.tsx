
import { Button } from "@/components/ui/button"
import Link from "next/link"

const categories = [
  { name: "Adventure", href: "/category/adventure" },
  { name: "Nature", href: "/category/nature" },
  { name: "Culture", href: "/category/culture" },
  { name: "Art & Craft", href: "/category/art-craft" },
  { name: "Photography", href: "/category/photography" },
  { name: "Sport", href: "/category/sport" },
  { name: "Cooking", href: "/category/cooking" }
]

export const CategoryNav = () => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 px-4 md:px-0">
      {categories.map((category) => (
        <Button
          key={category.name}
          variant="outline"
          className="whitespace-nowrap"
          asChild
        >
          <Link href={category.href}>{category.name}</Link>
        </Button>
      ))}
    </div>
  )
}
