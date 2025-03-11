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
      title: 'Doi Suthep Temple & Hmong Village Tour',
      image: 'https://images.unsplash.com/photo-1598935898639-81586f7d2129',
      price: 1500,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/doi-suthep'
    },
    {
      title: 'Traditional Thai Cooking Class with Organic Farm Visit',
      image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7',
      price: 1200,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/cooking-class'
    },
    {
      title: 'Elephant Nature Park Sanctuary Experience',
      image: 'https://images.unsplash.com/photo-1559628233-100c798642d4',
      price: 2500,
      location: 'Chiang Mai, Thailand',
      rating: 5,
      href: '/activities/elephant-sanctuary'
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
          <section className='relative h-[600px]'>
            <div className='absolute inset-0'>
              <Image
                src='https://images.unsplash.com/photo-1598935888738-cd2c5cbb7c9f'
                alt='Chiang Mai Temple'
                fill
                className='object-cover brightness-75'
                priority
              />
            </div>
            <div className='relative container h-full flex flex-col items-center justify-center text-white'>
              <h1 className='text-4xl md:text-6xl font-bold mb-6 text-center'>
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

          <section className='container py-8'>
            <CategoryNav />
          </section>

          <section className='container py-8'>
            <h2 className='text-2xl font-semibold mb-6'>Popular Experiences in Chiang Mai</h2>
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