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
    <div className='flex flex-col items-center justify-center'>
      <div className='flex flex-wrap justify-center gap-3 max-w-4xl mx-auto'>
        {categories.map((category) => (
          <Button
            key={category.name}
            variant='outline'
            className='whitespace-nowrap'
            asChild
          >
            <Link href={category.href}>{category.name}</Link>
          </Button>
        ))}
      </div>
    </div>
  )
}