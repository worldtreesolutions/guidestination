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

export default function Home() {
  const featuredActivities = [
    {
      title: 'Chiang Mai Elephant Sanctuary, Waterfall & Bamboo Rafting',
      image: 'https://images.unsplash.com/photo-1559628233-100c798642d4',
      price: 89,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/elephant-sanctuary'
    },
    {
      title: 'Colosseum, Roman Forum & Palatine Guided Tour',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
      price: 59,
      location: 'Rome, Italy',
      rating: 4,
      href: '/activities/colosseum-tour'
    },
    {
      title: 'Elephant Sanctuary Long Neck & White Temple',
      image: 'https://images.unsplash.com/photo-1575872235826-d894d5177c6c',
      price: 75,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/elephant-temple'
    }
  ]

  return (
    <>
      <Head>
        <title>TourConnect - Discover Amazing Travel Experiences</title>
        <meta name='description' content='Find and book unforgettable travel activities recommended by trusted local partners' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='min-h-screen flex flex-col'>
        <Navbar />
        
        <main className='flex-1'>
          <section className='relative h-[600px]'>
            <div className='absolute inset-0'>
              <Image
                src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'
                alt='Hero background'
                fill
                className='object-cover brightness-75'
                priority
              />
            </div>
            <div className='relative container h-full flex flex-col items-center justify-center text-white'>
              <h1 className='text-4xl md:text-6xl font-bold mb-6 text-center'>
                Travel memories you'll never forget
              </h1>
              <div className='w-full max-w-2xl flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-lg'>
                <Input
                  placeholder='Find places and things...'
                  className='bg-white/80'
                />
                <Button>
                  <Search className='h-5 w-5 mr-2' />
                  Search
                </Button>
              </div>
            </div>
          </section>

          <section className='container py-8'>
            <CategoryNav />
          </section>

          <section className='container py-8'>
            <h2 className='text-2xl font-semibold mb-6'>Activities you may like</h2>
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