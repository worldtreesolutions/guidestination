import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePlanning } from "@/contexts/PlanningContext"

interface ActivityCardProps {
  title: string
  image: string
  price: number
  location: string
  rating: number
  href: string
}

export const ActivityCard = ({
  title,
  image,
  price,
  location,
  rating,
  href
}: ActivityCardProps) => {
  const { addActivity } = usePlanning()

  const handleAddToPlanning = (e: React.MouseEvent) => {
    e.preventDefault()
    addActivity({
      title,
      imageUrl: image,
      price,
      duration: 2
    })
  }

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <Card className='group overflow-hidden'>
      <Link href={href}>
        <div className='relative aspect-[4/3]'>
          <Image
            src={image}
            alt={title}
            fill
            className='object-cover transition-transform group-hover:scale-105'
          />
          <div className='absolute top-4 right-4 flex gap-2'>
            <Button
              variant='secondary'
              className='rounded-full bg-white/80 hover:bg-white flex items-center gap-2 px-4'
              onClick={handleAddToPlanning}
            >
              <Calendar className='h-5 w-5' />
              <span className='text-sm'>Ajouter au planning</span>
            </Button>
            <Button
              size='icon'
              variant='secondary'
              className='rounded-full bg-white/80 hover:bg-white'
            >
              <Heart className='h-5 w-5' />
            </Button>
          </div>
        </div>
        <CardContent className='p-4'>
          <h3 className='font-semibold mb-2 line-clamp-2'>{title}</h3>
          <div className='flex justify-between items-center'>
            <div className='text-sm text-muted-foreground'>{location}</div>
            <div className='font-medium'>฿{formatPrice(price)} per person</div>
          </div>
          <div className='flex items-center gap-1 mt-2'>
            {'★'.repeat(rating)}{'☆'.repeat(5-rating)}
            <span className='text-sm text-muted-foreground ml-1'>({rating}.0)</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}