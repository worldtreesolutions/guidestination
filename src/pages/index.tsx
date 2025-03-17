import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CategoryNav } from '@/components/home/CategoryNav'
import { ActivityCard } from '@/components/home/ActivityCard'
import { Search } from 'lucide-react'
import { Calendar } from 'lucide-react'
import { usePlanning } from '@/contexts/PlanningContext'

export default function Home() {
  const { selectedActivities } = usePlanning()

  const featuredActivities = [
    {
      title: 'Doi Suthep Temple & Hmong Village Tour',
      image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed',
      price: 1500,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/doi-suthep'
    },
    {
      title: 'Traditional Thai Cooking Class with Organic Farm Visit',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947',
      price: 1200,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/cooking-class'
    },
    {
      title: 'Elephant Nature Park Sanctuary Experience',
      image: 'https://images.unsplash.com/photo-1585970480901-90d6bb2a48b5',
      price: 2500,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/elephant-sanctuary'
    },
    {
      title: 'Thai Massage Workshop at Traditional Spa',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874',
      price: 1800,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/massage-workshop'
    },
    {
      title: 'Night Market Food Tour & Local Delicacies',
      image: 'https://images.unsplash.com/photo-1516211881327-e5120a941edc',
      price: 1000,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/food-tour'
    },
    {
      title: 'Mountain Biking Adventure in Doi Suthep',
      image: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190',
      price: 2200,
      location: 'Chiang Mai, Thailand',
      rating: 4,
      href: '/activities/mountain-biking'
    },
    {
      title: 'Traditional Ceramics Workshop in Sankamphaeng',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261',
      price: 1300,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/ceramics-workshop'
    },
    {
      title: 'Sunset Temple Tour by Bicycle',
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526',
      price: 800,
      location: 'Chiang Mai, Thailand',
      rating: 4,
      href: '/activities/temple-bike-tour'
    },
    {
      title: 'Meditation Retreat at Buddhist Temple',
      image: 'https://images.unsplash.com/photo-1545389336-cf090694435e',
      price: 1600,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/meditation-retreat'
    }
  ]

  return (
    <>
      <Head>
        <title>Guidestination Chiang Mai - Discover Amazing Local Experiences</title>
        <meta name='description' content='Find and book unforgettable activities in Chiang Mai, recommended by trusted local partners' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='min-h-screen flex flex-col'>
        <Navbar />
        
        <main className='flex-1'>
          {selectedActivities.length > 0 && (
            <div className='fixed bottom-4 right-4 z-50'>
              <Link href='/planning'>
                <Button size='lg' className='shadow-lg'>
                  <Calendar className='h-5 w-5 mr-2' />
                  Voir mon planning ({selectedActivities.length})
                </Button>
              </Link>
            </div>
          )}
          <section className='relative h-[600px]'>
            <div className='absolute inset-0'>
              <Image
                src='https://images.unsplash.com/photo-1563492065599-3520f775eeed'
                alt='Beautiful temple in Chiang Mai'
                fill
                className='object-cover brightness-75'
                priority
              />
            </div>
            <div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col items-center justify-center text-white'>
              <h1 className='text-4xl md:text-6xl font-bold mb-6 text-center max-w-4xl'>
                Discover the Magic of Chiang Mai
              </h1>
              <div className='w-full max-w-2xl flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-lg'>
                <Input
                  placeholder='Search for activities in Chiang Mai...'
                  className='bg-white/80'
                />
                <Button>
                  <Search className='h-5 w-5 mr-2' />
                  Search
                </Button>
              </div>
            </div>
          </section>

          <section className='py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <CategoryNav />
          </section>

          <section className='py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <h2 className='text-3xl font-bold text-center mb-8'>Popular Experiences in Chiang Mai</h2>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {featuredActivities.map((activity) => (
                <ActivityCard key={activity.href} {...activity} />
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}