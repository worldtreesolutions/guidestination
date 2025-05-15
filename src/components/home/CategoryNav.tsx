
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useIsMobile } from '@/hooks/use-mobile'
import { useLanguage } from "@/contexts/LanguageContext"

export const CategoryNav = () => {
  const isMobile = useIsMobile()
  const { t } = useLanguage()
  
  const categories = [
    { key: "adventure", href: "/category/adventure" },
    { key: "nature", href: "/category/nature" },
    { key: "culture", href: "/category/culture" },
    { key: "artCraft", href: "/category/art-craft" },
    { key: "photography", href: "/category/photography" },
    { key: "sport", href: "/category/sport" },
    { key: "cooking", href: "/category/cooking" }
  ]
  
  return (
    <div className='flex flex-col items-center justify-center w-full overflow-x-auto'>
      <div className='flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl mx-auto'>
        {categories.map((category) => (
          <Button
            key={category.key}
            variant="outline"
            className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
            asChild
          >
            <Link href={category.href}>{t(`category.${category.key}`)}</Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
