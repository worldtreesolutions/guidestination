import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useIsMobile } from '@/hooks/use-mobile'

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
  const isMobile = useIsMobile()
  
  return (
    <div className='flex flex-col items-center justify-center w-full overflow-x-auto'>
      <div className='flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl mx-auto'>
        {categories.map((category) => (
          <Button
            key={category.name}
            variant="outline"
            className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
            asChild
          >
            <Link href={category.href}>{category.name}</Link>
          </Button>
        ))}
      </div>
    </div>
  )
}